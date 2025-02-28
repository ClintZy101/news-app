import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { useParams } from 'react-router-dom';
import socket from '../../utils/socket';

const NewsListByTag = () => {
  const { tag } = useParams();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

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

  useEffect(() => {
    setNews([]);
    setHasMore(true);
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

  const handleScroll = useCallback(() => {
    if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || loading) return;
    loadNews();
  }, [loading]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handleLike = async (id) => {
    setNews((prevNews) =>
      prevNews.map((item) =>
        item._id === id ? { ...item, likes: item.likes + 1 } : item
      )
    );
    socket.emit('likeNews', { id });
  };

  const handleDislike = async (id) => {
    setNews((prevNews) =>
      prevNews.map((item) =>
        item._id === id ? { ...item, dislikes: item.dislikes + 1 } : item
      )
    );
    socket.emit('dislikeNews', { id });
  };

  return (
    <div className="container mx-auto mt-3">
      <h1 className="text-2xl font-bold mb-4">News tagged with "{tag}"</h1>
      <div className="grid grid-cols-1 gap-4">
        {news.map((item) => (
          <div key={item._id} className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <h5 className="text-2xl font-semibold mb-4">{item.title}</h5>
            {item.images && item.images.map((image, index) => (
              <img key={index} src={image} alt={item.title} className="w-full h-64 object-cover rounded mb-4" />
            ))}
            <p className="text-gray-700 mb-4">{item.text}</p>
            <p className="text-gray-500 mb-4"><strong>Likes:</strong> {item.likes} | <strong>Dislikes:</strong> {item.dislikes}</p>
            {item.tags && (
              <div className="mb-4">
                {item.tags.map((tag) => (
                  <span key={tag} className="inline-block bg-gray-200 text-gray-700 text-sm font-semibold mr-2 px-2.5 py-0.5 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            <div className="flex space-x-4 justify-end">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer"
                onClick={() => handleLike(item._id)}
              >
                Like
              </button>
              <button
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded cursor-pointer"
                onClick={() => handleDislike(item._id)}
              >
                Dislike
              </button>
            </div>
          </div>
        ))}
      </div>
      {loading && <p className="text-center mt-4">Loading...</p>}
    </div>
  );
};

export default NewsListByTag;
