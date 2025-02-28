import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import CreateNews from "./components/CreateNews";
import NewsListByTag from "./components/newslist/NewsListByTag";
import Navbar from "./components/Navbar";
import DataList from "./components/newslist/DataList";
import SignIn from "./components/auth/SignIn";
import SignOut from "./components/auth/SignOut";
import Register from "./components/auth/Register";
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

  const hideNavbar = location.pathname === '/signin' || location.pathname === '/register';

  return (
    <div className="min-h-screen bg-white text-black">
      {!hideNavbar && <Navbar tags={tags} />}
      <Routes>
        <Route path="/create-news" element={<CreateNews />} />
        <Route path="/news/tag/:tag" element={<NewsListByTag key={location.pathname} />} />
        <Route path="/" element={<DataList />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signout" element={<SignOut />} />
        <Route path="/register" element={<Register />} />
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
