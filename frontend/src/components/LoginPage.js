// src/components/LoginPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [errorMsg, setErrorMsg] = useState(''); // ← For showing error message
  const navigate = useNavigate();
  const API_BASE_URL = "/api";


  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg(''); // Clear previous error
    axios.post(`${API_BASE_URL}/login`, { username, password, role })
      .then(response => {
        onLogin(response.data);
        navigate('/');
      })
      .catch(error => {
        // Display error in a red alert box instead of alert()
        const detail = error.response?.data?.detail || 'Sign in failed.';
        setErrorMsg(detail);
      });
  };

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8 bg-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          src="/logo.jpg"
          alt="ECSite"
          className="mx-auto h-24 w-auto"
          />

        <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        {/* Error Message (red alert) */}
        {errorMsg && (
          <div className="mb-4 rounded-md bg-red-50 border-l-4 border-red-400 p-4 text-red-700">
            {errorMsg}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-900">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 
                         outline outline-1 outline-gray-300 placeholder:text-gray-400 
                         focus:outline-indigo-600 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-900">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 
                         outline outline-1 outline-gray-300 placeholder:text-gray-400 
                         focus:outline-indigo-600 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900">Role</label>
            <div className="mt-2 flex space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="customer"
                  checked={role === 'customer'}
                  onChange={e => setRole(e.target.value)}
                />
                <span>Customer</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="merchant"
                  checked={role === 'merchant'}
                  onChange={e => setRole(e.target.value)}
                />
                <span>Merchant</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold 
                       text-white hover:bg-indigo-500"
          >
            Sign in
          </button>
        </form>

        <p className="mt-10 text-center text-sm text-gray-500">
          Not a member?{' '}
          <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
