import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';

const NewsStatistics = () => {
  const [statistics, setStatistics] = useState([]);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const res = await axiosInstance.get('/api/news/statistics');
        setStatistics(res.data);
      } catch (error) {
        console.error('Error fetching statistics', error);
      }
    };

    fetchStatistics();
  }, []);

  return (
    <div className="container mx-auto mt-3 p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">News Statistics</h1>
      <div className="grid grid-cols-1 gap-6">
        {statistics.map((item) => (
          <div key={item._id} className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <h5 className="text-2xl font-semibold mb-4">{item.title}</h5>
            <p className="text-gray-500 mb-4"><strong>Views:</strong> {item.views} | <strong>Likes:</strong> {item.likes}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsStatistics;
