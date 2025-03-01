import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';

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
              <td className="py-2 ">{stat.title}</td>
              <td className="py-2 text-center">{stat.views}</td>
              <td className="py-2 text-center">{stat.likes}</td>
              <td className="py-2 text-center">{stat.dislikes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default NewsStatistics;
