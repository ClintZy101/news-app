import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link className="text-white text-lg font-bold" to="/">NewsApp</Link>
        <div className="flex space-x-4">
          <Link className="text-white" to="/">Home</Link>
          <Link className="text-white" to="/create-news">Create News</Link>
          <Link className="text-white" to="/news/tag/sports">Sports</Link>
          <Link className="text-white" to="/news/tag/technology">Technology</Link>
          <Link className="text-white" to="/news/tag/entertainment">Entertainment</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
