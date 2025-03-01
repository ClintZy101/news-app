import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { FaThumbsUp, FaThumbsDown, FaArrowLeft, FaTimes } from 'react-icons/fa';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

const NewsDetail = () => {
  const { id } = useParams();
  const [news, setNews] = useState(null);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasDisliked, setHasDisliked] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await axiosInstance.get(`/api/news/${id}`);
        setNews(res.data);
        setHasLiked(res.data.likedByUser);
        setHasDisliked(res.data.dislikedByUser);
      } catch (error) {
        console.error('Error fetching news', error);
      }
    };

    fetchNews();
  }, [id]);

  const handleLike = async () => {
    try {
      const res = await axiosInstance.post(`/news/${id}/like`);
      setNews((prevNews) => ({ ...prevNews, likes: res.data.likes, dislikes: res.data.dislikes }));
      setHasLiked(!hasLiked);
      if (hasDisliked) setHasDisliked(false);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setModalIsOpen(true);
      } else {
        console.error('Error liking news', error);
      }
    }
  };

  const handleDislike = async () => {
    try {
      const res = await axiosInstance.post(`/news/${id}/dislike`);
      setNews((prevNews) => ({ ...prevNews, likes: res.data.likes, dislikes: res.data.dislikes }));
      setHasDisliked(!hasDisliked);
      if (hasLiked) setHasLiked(false);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setModalIsOpen(true);
      } else {
        console.error('Error disliking news', error);
      }
    }
  };

  const handleBack = () => {
    if (location.state?.fromAdminPanel) {
      navigate('/admin-panel');
    } else {
      navigate('/');
    }
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const redirectToSignIn = () => {
    setModalIsOpen(false);
    navigate('/signin');
  };

  if (!news) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto mt-3 p-4">
      <button
        onClick={handleBack}
        className="mb-4 flex items-center justify-self-end bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        <FaArrowLeft className="mr-2" />{location.state?.fromAdminPanel ? 'Back Admin Panel' : 'Back to News List'}
      </button>
      <h1 className="text-3xl font-bold mb-6">{news.title}</h1>
      {news.images && news.images.length > 1 ? (
        <Carousel showThumbs={false} showStatus={false} infiniteLoop useKeyboardArrows>
          {news.images.map((image, index) => (
            <div key={index}>
              <img src={image} alt={news.title} className="w-full h-64 object-cover rounded mb-4" />
            </div>
          ))}
        </Carousel>
      ) : (
        news.images && news.images.map((image, index) => (
          <img key={index} src={image} alt={news.title} className="w-full h-64 object-cover rounded mb-4" />
        ))
      )}
      <p className="text-gray-700 mb-4">{news.text}</p>
      <p className="text-gray-500 mb-4 flex items-center"><FaThumbsUp className="mr-2 text-blue-500" /> {news.likes} |  <FaThumbsDown className="mx-2 text-red-500" />{news.dislikes}</p>
      {news.tags && (
        <div className="mb-4">
          {news.tags.map((tag) => (
            <span key={tag} className="inline-block bg-gray-200 text-gray-700 text-sm font-semibold mr-2 px-2.5 py-0.5 rounded">
              #{tag}
            </span>
          ))}
        </div>
      )}
      <div>
        <p className='text-gray-500'>Author: {news.author}</p>
      </div>
      <div className="flex space-x-4 justify-end mt-4">
        <button
          className={`flex items-center ${hasLiked ? 'bg-gray-500' : 'bg-blue-500 hover:bg-blue-700'} text-white font-bold py-2 px-4 rounded cursor-pointer`}
          onClick={handleLike}
        >
          <FaThumbsUp className="mr-2" /> {hasLiked ? 'Liked' : 'Like'}
        </button>
        <button
          className={`flex items-center ${hasDisliked ? 'bg-gray-500' : 'bg-red-500 hover:bg-red-700'} text-white font-bold py-2 px-4 rounded cursor-pointer`}
          onClick={handleDislike}
        >
          <FaThumbsDown className="mr-2" /> {hasDisliked ? 'Disliked' : 'Dislike'}
        </button>
      </div>
      {modalIsOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black -50">
          <div className="bg-white p-6 rounded shadow-lg relative">
            <button onClick={closeModal} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
              <FaTimes />
            </button>
            <h2 className="text-2xl mb-4">Sign In Required</h2>
            <p>You need to sign in to like or dislike a news article.</p>
            <button onClick={redirectToSignIn} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">Sign In</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsDetail;
