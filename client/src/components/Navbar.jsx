import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import useUserStore from "../store/userStore";

const Navbar = ({ tags }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [email, setEmail] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const user = useUserStore((state) => state.user);
  const clearUser = useUserStore((state) => state.clearUser);
  const tagsDropdownRef = useRef(null);

  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        tagsDropdownRef.current &&
        !tagsDropdownRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleTagClick = (tag) => {
    setDropdownOpen(false);
    const tagPath = `/news/tag/${encodeURIComponent(tag.trim())}`;
    if (location.pathname === tagPath) {
      navigate("/temp", { replace: true });
      setTimeout(() => navigate(tagPath, { replace: true }), 0);
    } else {
      navigate(tagPath);
    }
  };

  const handleSignOut = () => {
    clearUser();
    navigate("/signin");
  };

  const filteredTags = tags.filter((tag) =>
    tag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <nav className="bg-gray-800 p-2 px-4 fixed top-0 left-0 w-full z-50">
      <div className="mx-auto flex justify-between items-center relative">
        <Link to="/" className="text-white text-lg font-bold">
          News App
        </Link>
        <div className="flex items-center space-x-4">
          <div className="relative " ref={tagsDropdownRef}>
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
          <button className="text-white md:hidden" onClick={toggleSidebar}>
            <FaBars />
          </button>
          <div className="hidden md:flex items-center space-x-4">
            {(!user || user?.role === "admin") && (
              <>
                <Link
                  to="/admin-panel"
                  className="text-white bg-gray-700 hover:bg-gray-900 px-4 py-2 rounded cursor-pointer transition-all duration-300"
                >
                  Admin Panel
                </Link>
                <Link
                  to="/news-statistics"
                  className="text-white bg-gray-700 hover:bg-gray-900 px-4 py-2 rounded cursor-pointer transition-all duration-300"
                >
                  News Statistics
                </Link>
              </>
            )}
            {email ? (
              <button
                onClick={handleSignOut}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline cursor-pointer"
              >
                Sign Out
              </button>
            ) : (
              <Link
                to="/signin"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
      <div
        className={`fixed inset-0 bg-gray-800/50 z-40 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={toggleSidebar}
      >
        <div className={`fixed top-0 right-0 w-64 bg-white h-full shadow-lg z-50 p-4 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <button className="text-black mb-4" onClick={toggleSidebar}>
            <FaTimes />
          </button>
          {(!user || user?.role === "admin") && (
            <>
              <Link
                to="/admin-panel"
                className="block text-black bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded cursor-pointer transition-all duration-300 mb-2"
                onClick={toggleSidebar}
              >
                Admin Panel
              </Link>
              <Link
                to="/news-statistics"
                className="block text-black bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded cursor-pointer transition-all duration-300 mb-2"
                onClick={toggleSidebar}
              >
                News Statistics
              </Link>
            </>
          )}
          {email ? (
            <button
              onClick={handleSignOut}
              className="block w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline cursor-pointer"
            >
              Sign Out
            </button>
          ) : (
            <Link
              to="/signin"
              className="block w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer"
              onClick={toggleSidebar}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
