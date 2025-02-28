import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import CreateNews from "./components/CreateNews";
import NewsListByTag from "./components/newslist/NewsListByTag";
import Navbar from "./components/Navbar";
import DataList from "./components/newslist/DataList";
import axiosInstance from "./utils/axiosInstance"; // Ensure axiosInstance is imported

function AppContent() {
  const [tags, setTags] = React.useState([]);
  const location = useLocation();

  React.useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await axiosInstance.get('/api/news/tags');
        setTags(res.data);
      } catch (error) {
        console.error('Error fetching tags', error);
      }
    };

    fetchTags();
  }, []);

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar tags={tags} />
      <Routes>
        <Route path="/create-news" element={<CreateNews />} />
        <Route path="/news/tag/:tag" element={<NewsListByTag key={location.pathname} />} />
        <Route path="/" element={<DataList />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
