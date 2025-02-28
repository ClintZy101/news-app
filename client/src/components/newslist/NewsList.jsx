import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import axiosInstance from "../../utils/axiosInstance";
import InfiniteScroll from "react-infinite-scroll-component";

const socket = io(
  process.env.NODE_ENV === "production"
    ? "https://your-production-url.com"
    : "http://localhost:5555"
);

const NewsList = () => {
  const [news, setNews] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);


  useEffect(() => {
    loadInitialNews();
    socket.on("newsCreated", (newNews) => {
      setNews((prevNews) => [newNews, ...prevNews]);
      updateTags([newNews, ...news]);
    });
      
    socket.on("newsUpdated", (updatedNews) => {
      const updatedNewsList = news.map((item) =>
        item._id === updatedNews._id ? updatedNews : item
      );
      setNews(updatedNewsList);
      updateTags(updatedNewsList);
    });
    return () => {
      socket.off("newsCreated");
      socket.off("newsUpdated");
    };
  }, []);

  const loadInitialNews = async () => {
    try {
      const res = await axiosInstance.get(`/api/news?page=1`);
      setNews(res.data);
      updateTags(res.data);
      if (res.data.length < 3) setHasMore(false);
    } catch (error) {
      console.error("Error loading news", error);
    }
  };

  const fetchMoreNews = async () => {
    try {
      const res = await axiosInstance.get(`/api/news?page=${page + 1}`);
      const updatedNewsList = [...news, ...res.data];
      setNews(updatedNewsList);
      setPage(page + 1);
      updateTags(updatedNewsList);
      if (res.data.length < 3) setHasMore(false);
    } catch (error) {
      console.error("Error loading news", error);
    }
  };

  const updateTags = (newsList) => {
    const allTags = newsList.flatMap((item) => item.tags);
    const uniqueTags = [...new Set(allTags)];
    setTags(uniqueTags);
  };

  const handleLike = async (id) => {
    await axiosInstance.post(`/news/${id}/like`);
  };

  const handleDislike = async (id) => {
    await axiosInstance.post(`/news/${id}/dislike`);
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
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
              <h5 className="text-2xl font-semibold mb-4">{item.title}</h5>
              {item.images &&
                item.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={item.title}
                    className="w-full h-64 object-cover rounded mb-4"
                  />
                ))}
              <p className="text-gray-700 mb-4">{item.text}</p>
              <p className="text-gray-500 mb-4">
                <strong>Likes:</strong> {item.likes} |{" "}
                <strong>Dislikes:</strong> {item.dislikes}
              </p>
              {item.tags && (
                <div className="mb-4">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block bg-gray-200 text-gray-700 text-sm font-semibold mr-2 px-2.5 py-0.5 rounded"
                    >
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

export default NewsList;
