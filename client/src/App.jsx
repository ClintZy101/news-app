import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CreateNews from "./components/CreateNews";
import NewsList from "./components/newslist/NewsList";
import NewsListByTag from "./components/newslist/NewsListByTag";
import Navbar from "./components/Navbar";

function App() {
  return (
    <div className="min-h-screen bg-gray-100">

      <Router>
      <Navbar />
        <Routes>
          <Route path="/create-news" element={<CreateNews />} />
          <Route path="/news/tag/:tag" element={<NewsListByTag />} />
          <Route path="/" element={<NewsList />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
