import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import * as tf from '@tensorflow/tfjs';

const FaceAuth = ({ onAuthenticated }) => {
  const videoRef = useRef(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [mode, setMode] = useState("login"); // "login" or "enroll"
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    // Load face-api.js models
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

    // Access webcam and start video stream
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: 640,
              height: 480,
              facingMode: "user", // Front-facing camera
              exposure: { ideal: 0.5 }, // Exposure control
              brightness: { ideal: 0.5 } // Brightness control
            }
          });
          videoRef.current.srcObject = stream;
      } catch (error) {
        console.error("Error accessing webcam:", error);
        setStatusMessage("Error accessing webcam. Please check permissions.");
      }
    };

    startVideo();

    // Clean up the webcam stream on unmount
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  const enrollFace = async () => {
    if (!isVideoLoaded || !videoRef.current) return;
  
    const detections = await faceapi.detectSingleFace(videoRef.current).withFaceLandmarks().withFaceDescriptor();
  
    if (detections) {
      console.log("Face detected", detections); // Log detected face data
      const descriptor = detections.descriptor;
      const userName = prompt("Enter a username for enrollment:");
      if (userName) {
        // Store descriptor in localStorage
        const existingDescriptors = JSON.parse(localStorage.getItem("faceDescriptors") || "[]");
        existingDescriptors.push({ label: userName, descriptor: Array.from(descriptor) });
        localStorage.setItem("faceDescriptors", JSON.stringify(existingDescriptors));
        setStatusMessage(`Enrolled user "${userName}" successfully.`);
      }
    } else {
      console.log("No face detected");
      setStatusMessage("No face detected. Please try again.");
    }
  };
  

  const loginFace = async () => {
    if (!isVideoLoaded || !videoRef.current) return;

    const detections = await faceapi.detectSingleFace(videoRef.current).withFaceLandmarks().withFaceDescriptor();

    if (detections) {
      const descriptor = detections.descriptor;
      const labeledDescriptors = await loadLabeledDescriptors();

      if (labeledDescriptors.length > 0) {
        const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
        const bestMatch = faceMatcher.findBestMatch(descriptor);

        if (bestMatch.label !== "unknown") {
          setStatusMessage(`Welcome, ${bestMatch.label}!`);
          onAuthenticated();
        } else {
          setStatusMessage("Face not recognized. Access denied.");
        }
      } else {
        setStatusMessage("No enrolled users found. Please enroll a face first.");
      }
    } else {
      setStatusMessage("No face detected. Please try again.");
    }
  };

  const loadLabeledDescriptors = async () => {
    const storedDescriptors = JSON.parse(localStorage.getItem("faceDescriptors") || "[]");
    return storedDescriptors.map((item) => {
      return new faceapi.LabeledFaceDescriptors(item.label, [new Float32Array(item.descriptor)]);
    });
  };

  return (
    <div>
      <h2>Face Authentication</h2>
      <div className="video-container">
        <video ref={videoRef} autoPlay muted width="640" height="480" />
      </div>
      <div className="controls">
        <button onClick={() => setMode("enroll")}>Enroll Face</button>
        <button onClick={() => setMode("login")}>Login</button>
      </div>
      <div>
        {mode === "enroll" && <button onClick={enrollFace}>Capture and Enroll</button>}
        {mode === "login" && <button onClick={loginFace}>Authenticate</button>}
      </div>
      <p>{statusMessage}</p>
    </div>
  );
};

export default FaceAuth;
