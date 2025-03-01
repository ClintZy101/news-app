import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';

const NewsStatistics = () => {
  const [statistics, setStatistics] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);


  useEffect(() => {
    fetchStatistics(page);
  }, [page]);

  const fetchStatistics = async (page) => {
    try {
      const res = await axiosInstance.get(`/api/news/statistics?page=${page}`);
      setStatistics(res.data.statistics || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching statistics', error);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">News Views Statistics</h1>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 text-center">Title</th>
            <th className="py-2 text-center">Views</th>
            <th className="py-2">Likes</th>
            <th className="py-2">Dislikes</th>
          </tr>
        </thead>
        <tbody>
          {statistics.map((stat) => (
            <tr key={stat._id} className='border-b'>
              <td className="py-2" >
                {stat.title}
              </td>
              <td className="py-2 text-center">{stat.views}</td>
              <td className="py-2 text-center">{stat.likes}</td>
              <td className="py-2 text-center">{stat.dislikes}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={handlePreviousPage}
          disabled={page === 1}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
        >
          Previous
        </button>
        <span className="text-gray-700">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={page === totalPages}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default NewsStatistics;
