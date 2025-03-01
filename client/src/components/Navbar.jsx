import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useUserStore from '../store/userStore';

const Navbar = ({ tags }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [email, setEmail] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    const storedEmail = localStorage.getItem('email');
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleTagClick = (tag) => {
    setDropdownOpen(false);
    const tagPath = `/news/tag/${encodeURIComponent(tag.trim())}`;
    if (location.pathname === tagPath) {
      navigate('/temp', { replace: true });
      setTimeout(() => navigate(tagPath, { replace: true }), 0);
    } else {
      navigate(tagPath);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    setEmail(null);
    navigate('/signin');
  };

  const filteredTags = tags.filter(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <nav className="bg-gray-800 p-2 px-4 fixed top-0 left-0 w-full z-50">
      <div className=" mx-auto flex justify-between items-center relative">
        <Link to="/" className="text-white text-lg font-bold">News App</Link>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              className="text-white px-4 py-2 cursor-pointer hover:underline transition-all duration-300"
              onClick={toggleDropdown}
            >
              News By Tags
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded shadow-lg p-4">
                <input
                  type="text"
                  placeholder="Search tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 mb-2 border border-gray-300 rounded"
                />
                <div className="max-h-64 overflow-y-auto">
                  {filteredTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleTagClick(tag)}
                      className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          {user.role === 'admin' && (
            <>
              <Link to="/admin-panel" className="text-white bg-gray-700 hover:bg-gray-900 text-white px-4 py-2 rounded cursor-pointer transition-all duration-300">Admin Panel</Link>
              <Link to="/news-statistics" className="text-white bg-gray-700 hover:bg-gray-900 text-white px-4 py-2 rounded cursor-pointer transition-all duration-300">News Statistics</Link>
            </>
          )}
          {email ? (
            <>
              <button
                onClick={handleSignOut}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline cursor-pointer"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link to="/signin" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
