import React, { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import axiosInstance from '../../utils/axiosInstance';
import { useParams } from 'react-router-dom';

const socket = io(process.env.NODE_ENV === 'production' ? 'https://your-production-url.com' : 'http://localhost:5555');

const NewsListByTag = () => {
  const { tag } = useParams();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadNews();
    socket.on('newsCreated', (newNews) => {
      if (newNews.tags.includes(tag)) {
        setNews((prevNews) => [newNews, ...prevNews]);
      }
    });
    socket.on('newsUpdated', (updatedNews) => {
      if (updatedNews.tags.includes(tag)) {
        setNews((prevNews) =>
          prevNews.map((item) =>
            item._id === updatedNews._id ? updatedNews : item
          )
        );
      }
    });
    return () => {
      socket.off('newsCreated');
      socket.off('newsUpdated');
    };
  }, [tag]);

  const loadNews = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/api/news/tags/${tag}?page=${Math.ceil(news.length / 3) + 1}`);
      setNews((prev) => [...prev, ...res.data]);
      if (res.data.length < 3) setHasMore(false);
    } catch (error) {
      console.error('Error loading news', error);
    }
    setLoading(false);
  };

  const handleScroll = useCallback(() => {
    if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || loading) return;
    loadNews();
  }, [loading]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handleLike = async (id) => {
    await axiosInstance.post(`/news/${id}/like`);
  };

  const handleDislike = async (id) => {
    await axiosInstance.post(`/news/${id}/dislike`);
  };

  return (
    <div className="container mx-auto mt-3">
      <h1 className="text-2xl font-bold mb-4">News tagged with "{tag}"</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {news.map((item) => (
          <div key={item._id} className="bg-white p-4 rounded shadow">
            <h5 className="text-xl font-bold mb-2">{item.title}</h5>
            <p className="text-gray-700 mb-2">{item.text}</p>
            <p className="text-gray-500 mb-2"><strong>Likes:</strong> {item.likes} | <strong>Dislikes:</strong> {item.dislikes}</p>
            <button className="bg-blue-500 text-white px-4 py-2 rounded mr-2" onClick={() => handleLike(item._id)}>Like</button>
            <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={() => handleDislike(item._id)}>Dislike</button>
          </div>
        ))}
      </div>
      {loading && <p className="text-center mt-4">Loading...</p>}
    </div>
  );
};

export default NewsListByTag;
