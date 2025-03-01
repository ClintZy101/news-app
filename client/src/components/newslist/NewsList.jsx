import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axiosInstance from '../../utils/axiosInstance';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useNavigate, useLocation } from 'react-router-dom';

const socket = io(process.env.NODE_ENV === 'production' ? 'https://your-production-url.com' : 'http://localhost:5555');

const NewsList = () => {
  const [news, setNews] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const location = useLocation();
  const newsRefs = useRef({});

  useEffect(() => {
    loadInitialNews();
    socket.on('newsCreated', (newNews) => {
      setNews((prevNews) => [newNews, ...prevNews]);
    });
    socket.on('newsUpdated', (updatedNews) => {
      setNews((prevNews) =>
        prevNews.map((item) =>
          item._id === updatedNews._id ? updatedNews : item
        )
      );
    });
    return () => {
      socket.off('newsCreated');
      socket.off('newsUpdated');
    };
  }, []);

  // useEffect(() => {
  //   if (location.state?.articleId) {
  //     const articleId = location.state.articleId;
  //     if (newsRefs.current[articleId]) {
  //       newsRefs.current[articleId].scrollIntoView({ behavior: 'smooth' });
  //     }
  //   }
  // }, [location, news]);

  const loadInitialNews = async () => {
    try {
      const res = await axiosInstance.get(`/api/news?page=1`);
      setNews(res.data);
      if (res.data.length < 3) setHasMore(false);
    } catch (error) {
      console.error('Error loading news', error);
    }
  };

  const fetchMoreNews = async () => {
    try {
      const res = await axiosInstance.get(`/api/news?page=${page + 1}`);
      setNews((prev) => [...prev, ...res.data]);
      setPage(page + 1);
      if (res.data.length < 3) setHasMore(false);
    } catch (error) {
      console.error('Error loading news', error);
    }
  };

  const handleCardClick = (id) => {
    navigate(`/news/${id}`);
  };

  console.log(news);

  return (
    <div className="container mx-auto mt-3 p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">News</h1>
      <InfiniteScroll
        dataLength={news.length}
        next={fetchMoreNews}
        hasMore={hasMore}
        loader={<h4>Loading...</h4>}
        endMessage={<p className="text-center">No more news</p>}
      >
        <div className="grid grid-cols-1 gap-6">
          {news.map((item) => (
            <div
              key={item._id}
              ref={(el) => (newsRefs.current[item._id] = el)}
              className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 cursor-pointer hover:shadow-lg hover:border-black transition-all duration-300"
              onClick={() => handleCardClick(item._id)}
            >
              <h5 className="text-2xl font-semibold mb-4">{item.title}</h5>
              {item.images && item.images.map((image, index) => (
                <img key={index} src={image} alt={item.title} className="w-full h-64 object-cover rounded mb-4" />
              ))}
              <p className="text-gray-700 mb-4 line-clamp-2">{item.text}</p>
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
              <div>
                <p className='text-gray-500'>Author: {item.author}</p>
              </div>
            </div>
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
};

export default NewsList;