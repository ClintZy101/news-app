import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axiosInstance from '../../utils/axiosInstance';
import { useParams } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroll-component';

const socket = io(process.env.NODE_ENV === 'production' ? 'https://your-production-url.com' : 'http://localhost:5555');

const NewsListByTag = () => {
  const { tag } = useParams();
  const [news, setNews] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const newsIds = new Set();

  const loadNews = async () => {
    try {
      const res = await axiosInstance.get(`/api/news/tags/${tag}?page=${page}`);
      const newNews = res.data.filter(item => !newsIds.has(item._id));
      newNews.forEach(item => newsIds.add(item._id));
      setNews((prev) => [...prev, ...newNews]);
      if (newNews.length < 3) setHasMore(false);
      setPage(page + 1);
    } catch (error) {
      console.error('Error loading news', error);
    }
  };

  useEffect(() => {
    setNews([]);
    setHasMore(true);
    setPage(1);
    newsIds.clear();
    loadNews();
    socket.on('newsCreated', (newNews) => {
      if (newNews.tags.includes(tag) && !newsIds.has(newNews._id)) {
        newsIds.add(newNews._id);
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

  // const fetchMoreNews = async () => {
  //   try {
  //     const res = await axiosInstance.get(`/api/news/tags/${tag}?page=${page + 1}`);
  //     const updatedNewsList = [...news, ...res.data];
  //     setNews(updatedNewsList);
  //     setPage(page + 1);
  //     updateTags(updatedNewsList);
  //     if (res.data.length < 3) setHasMore(false);
  //   } catch (error) {
  //     console.error("Error loading news", error);
  //   }
  // };

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
console.log(news)
  return (
    <div className="container mx-auto mt-3">
      <h1 className="text-2xl font-bold mb-4">News tagged with "{tag}"</h1>
      <InfiniteScroll
        dataLength={news.length}
        next={loadNews}
        hasMore={hasMore}
        loader={<p className="text-center mt-4">Loading...</p>}
        endMessage={<p className="text-center mt-4">No more news</p>}
      >
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
      </InfiniteScroll>
    </div>
  );
};

export default NewsListByTag;
