import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, User, Key } from 'lucide-react';
import FaceAuth from './FaceAuth';

function Login({ setIsLoggedIn }) {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const handleAuthenticated = () => {
    setIsLoggedIn(true);
    navigate('/');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="relative px-8 py-6 mt-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg w-full max-w-md">
        <button
          onClick={toggleTheme}
          className="absolute top-4 right-4 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-purple-600" />}
        </button>
        <h3 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">Login to PassMan</h3>
        <div className="flex items-center justify-center mb-6 space-x-2">
          <User className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <Key className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </div>
        <FaceAuth onAuthenticated={handleAuthenticated} />
      </div>
    </div>
  );
}

export default Login;

