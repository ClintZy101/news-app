import React, { useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { useNavigate, Link } from 'react-router-dom';
import useUserStore from '../../store/userStore';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [secretKey, setSecretKey] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const setUser = useUserStore((state) => state.setUser);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { email, password, role };
    if (role === 'admin') {
      payload.secretKey = secretKey;
    }
    try {
      const res = await axiosInstance.post(
        role === 'admin' ? '/api/auth/register-admin' : '/api/auth/register',
        payload
      );
      setUser({ email: res.data.email, role: res.data.role, token: res.data.token });
      setModalMessage('Registration successful!');
      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        navigate('/signin');
      }, 2000);
    } catch (error) {
      setModalMessage('Error registering. Please try again.');
      setShowModal(true);
      setTimeout(() => setShowModal(false), 2000);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="container max-w-md mx-auto mt-3">
        <h1 className="text-2xl font-bold mb-4 text-center">Register</h1>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="role">
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {role === 'admin' && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="secretKey">
                Secret Key
              </label>
              <input
                type="text"
                id="secretKey"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
          )}
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Register
            </button>
            <Link to="/signin" className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800">
              Already have an account? Sign In
            </Link>
          </div>
        </form>
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <p>{modalMessage}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
