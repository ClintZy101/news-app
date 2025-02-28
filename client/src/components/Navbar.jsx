import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = ({ tags }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center relative">
        <Link to="/" className="text-white text-lg font-bold">News App</Link>
        <div className="flex items-center space-x-4">
          <Link to="/create-news" className="text-white">Create News</Link>
          <div className="">
            <button
              className="bg-gray-700 text-white px-4 py-2 rounded cursor-pointer"
              onClick={toggleDropdown}
            >
              News By Tags
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 grid grid-cols-5 w-full p-4 bg-white rounded shadow-lg">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Link to="/signin" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer">
            Sign In
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
