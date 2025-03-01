import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import useArticleStore from '../store/articleStore';

const EditArticle = () => {
  const { article } = useArticleStore((state) => state);
  const [title, setTitle] = useState(article.title || '');
  const [text, setText] = useState(article.text || '');
  const [images, setImages] = useState(article.images || []);
  const [tags, setTags] = useState(article.tags || []);
  const navigate = useNavigate();

  useEffect(() => {
    if (!article._id) {
      navigate('/admin-panel');
    }
  }, [article, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    axiosInstance.put(`/api/news/${article._id}`, { title, text, images, tags })
      .then(() => navigate('/admin-panel'))
      .catch(error => console.error('Error updating article:', error));
  };

  const handleImageChange = (index, value) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
  };

  const handleTagChange = (index, value) => {
    const newTags = [...tags];
    newTags[index] = value;
    setTags(newTags);
  };

  const addImageField = () => {
    setImages([...images, '']);
  };

  const addTagField = () => {
    setTags([...tags, '']);
  };

  const removeImageField = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const removeTagField = (index) => {
    const newTags = tags.filter((_, i) => i !== index);
    setTags(newTags);
  };

  return (
    <div className="container mx-auto p-4 pb-10">
      <h1 className="text-2xl font-bold mb-4">Edit Article</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="text">Text</label>
          <textarea
            id="text"
            rows={20}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Images</label>
          {images.map((image, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="text"
                value={image}
                onChange={(e) => handleImageChange(index, e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
              <button type="button" onClick={() => removeImageField(index)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-2 focus:outline-none focus:shadow-outline">Remove</button>
            </div>
          ))}
          <button type="button" onClick={addImageField} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Add Image</button>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Tags</label>
          {tags.map((tag, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="text"
                value={tag}
                onChange={(e) => handleTagChange(index, e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
              <button type="button" onClick={() => removeTagField(index)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-2 focus:outline-none focus:shadow-outline">Remove</button>
            </div>
          ))}
          <button type="button" onClick={addTagField} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Add Tag</button>
        </div>
        <button type="submit" className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full">Update</button>
      </form>
    </div>
  );
};

export default EditArticle;
