import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import useArticleStore from '../store/articleStore';

const AdminPanel = () => {
  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [articleToDelete, setArticleToDelete] = useState(null);
  const setArticleData = useArticleStore((state) => state.setArticleData);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await axiosInstance.get(`/api/admin/news?page=${page}`);
        setArticles(res.data.articles);
        setTotalPages(res.data.totalPages);
      } catch (error) {
        console.error('Error fetching articles:', error);
      }
    };

    fetchArticles();
  }, [page]);

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/api/news/${id}`);
      setArticles(articles.filter(article => article._id !== id));
      setArticleToDelete(null);
    } catch (error) {
      console.error('Error deleting article:', error);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const confirmDelete = (id) => {
    setArticleToDelete(id);
  };

  const cancelDelete = () => {
    setArticleToDelete(null);
  };

  const handleEdit = (article) => {
    setArticleData(article);
  };

  const handleView = (id) => {
    navigate(`/news/${id}`, { state: { fromAdminPanel: true } });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2">Title</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody className=''>
          {articles.map(article => (
            <tr key={article._id} className='border-b'>
              <td className="py-2 cursor-pointer" onClick={() => handleView(article._id)}>{article.title}</td>
              <td className="py-2">
                <Link to={`/edit-article/${article._id}`} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded mr-2" onClick={() => handleEdit(article)}>Edit</Link>
                <button onClick={() => confirmDelete(article._id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-center mt-10">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mx-2"
        >
          Previous
        </button>
        <span className="text-lg font-bold mx-2">{page} / {totalPages}</span>
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mx-2"
        >
          Next
        </button>
      </div>

      {articleToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
            <p className="mb-4">Are you sure you want to delete this article?</p>
            <div className="flex justify-end">
              <button onClick={cancelDelete} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2">Cancel</button>
              <button onClick={() => handleDelete(articleToDelete)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
