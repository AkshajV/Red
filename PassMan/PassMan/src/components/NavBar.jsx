import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

function Navbar({ setSearchTerm }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <nav className="bg-purple-600 dark:bg-purple-900 text-white shadow-lg w-full transition-colors duration-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div>
            <a href="#" className="font-bold text-xl">PassMan</a>
          </div>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search passwords..."
              className="px-4 py-2 rounded-md bg-white/10 text-white placeholder-white/70 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 w-64"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

