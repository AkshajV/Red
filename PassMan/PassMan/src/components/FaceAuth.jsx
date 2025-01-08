import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import * as tf from '@tensorflow/tfjs';
import { Camera, UserPlus, LogIn, AlertCircle } from 'lucide-react';

const FaceAuth = ({ onAuthenticated }) => {
  const videoRef = useRef(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [mode, setMode] = useState("login");
  const [statusMessage, setStatusMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = '/weights';
        console.log(`TensorFlow.js version: ${tf.version_core}`);
        await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        setIsVideoLoaded(true);
        console.log("Models loaded successfully");
      } catch (error) {
        console.error("Error loading models:", error);
        setStatusMessage("Failed to load models. Check console for details.");
      }
    };

    loadModels();

    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: 640,
            height: 480,
            facingMode: "user",
            exposure: { ideal: 0.5 },
            brightness: { ideal: 0.5 }
          }
        });
        videoRef.current.srcObject = stream;
      } catch (error) {
        console.error("Error accessing webcam:", error);
        setStatusMessage("Error accessing webcam. Please check permissions.");
      }
    };

    startVideo();

    return () => {
      // Stop video stream when the component unmounts or authentication finishes
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  const enrollFace = async () => {
    if (!isVideoLoaded || !videoRef.current) return;
    setIsProcessing(true);

    try {
      const detections = await faceapi.detectSingleFace(videoRef.current).withFaceLandmarks().withFaceDescriptor();

      if (detections) {
        const descriptor = detections.descriptor;
        const userName = prompt("Enter a username for enrollment:");
        if (userName) {
          // Send data to the backend
          const response = await fetch("http://localhost:5000/register", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username: userName,
              password: "default_password",  // Default password for now (you can make this more dynamic)
              faceDescriptors: Array.from(descriptor),
            }),
          });

          if (response.ok) {
            setStatusMessage(`Enrolled user "${userName}" successfully.`);
          } else {
            setStatusMessage("Failed to enroll user.");
          }
        }
      } else {
        setStatusMessage("No face detected. Please try again.");
      }
    } catch (error) {
      console.error("Error during enrollment:", error);
      setStatusMessage("An error occurred during enrollment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const loginFace = async () => {
    if (!isVideoLoaded || !videoRef.current) return;
    setIsProcessing(true);

    try {
      const detections = await faceapi.detectSingleFace(videoRef.current).withFaceLandmarks().withFaceDescriptor();

      if (detections) {
        const descriptor = detections.descriptor;
        const labeledDescriptors = await loadLabeledDescriptors();

        if (labeledDescriptors.length > 0) {
          const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
          const bestMatch = faceMatcher.findBestMatch(descriptor);

          console.log("Username from face matcher:", bestMatch.label); // Log the matched username
          console.log("Face descriptors from video:", descriptor); // Log the face descriptors being sent

          if (bestMatch.label !== "unknown") {
            const response = await fetch("http://localhost:5000/login", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ username: bestMatch.label, faceDescriptors: descriptor }),
            });

            const data = await response.json(); // Parse the response as JSON

            if (response.ok) {
              setStatusMessage(`Welcome, ${bestMatch.label}!`);
              onAuthenticated();
            } else {
              setStatusMessage(data.message || "Face recognition failed.");
            }
          } else {
            setStatusMessage("Face not recognized. Access denied.");
          }
        } else {
          setStatusMessage("No enrolled users found. Please enroll a face first.");
        }
      } else {
        setStatusMessage("No face detected. Please try again.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setStatusMessage("An error occurred during login. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const loadLabeledDescriptors = async () => {
    const storedDescriptors = JSON.parse(localStorage.getItem("faceDescriptors") || "[]");
    return storedDescriptors.map((item) => {
      return new faceapi.LabeledFaceDescriptors(item.label, [new Float32Array(item.descriptor)]);
    });
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      console.log("Webcam stopped.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
        <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        )}
      </div>
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => setMode("enroll")}
          className={`px-4 py-2 rounded-md transition-colors ${mode === "enroll" ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"}`}
        >
          <UserPlus className="inline-block mr-2 h-5 w-5" />
          Enroll Face
        </button>
        <button
          onClick={() => setMode("login")}
          className={`px-4 py-2 rounded-md transition-colors ${mode === "login" ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"}`}
        >
          <LogIn className="inline-block mr-2 h-5 w-5" />
          Login
        </button>
      </div>
      <div className="flex justify-center">
        {mode === "enroll" && (
          <button
            onClick={enrollFace}
            disabled={isProcessing}
            className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50"
          >
            <Camera className="inline-block mr-2 h-5 w-5" />
            Capture and Enroll
          </button>
        )}
        {mode === "login" && (
          <button
            onClick={loginFace}
            disabled={isProcessing}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            <LogIn className="inline-block mr-2 h-5 w-5" />
            Authenticate
          </button>
        )}
      </div>
      {statusMessage && (
        <div className={`text-center p-2 rounded-md ${statusMessage.includes("successfully") || statusMessage.includes("Welcome") ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100" : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"}`}>
          <AlertCircle className="inline-block mr-2 h-5 w-5" />
          {statusMessage}
        </div>
      )}
    </div>
  );
};

export default FaceAuth;
