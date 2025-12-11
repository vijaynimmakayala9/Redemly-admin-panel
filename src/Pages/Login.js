import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import discountLogo from '../Images/discount logo.png'; // 👈 Your local image

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://31.97.206.144:6098/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');

      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminId', data.admin.id);
      localStorage.setItem('adminName', data.admin.name);

      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-blue-100 to-purple-200">
      <div className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl w-full max-w-5xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        
        {/* Left Side - Login Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
              Redemly
            </h1>
            <p className="text-gray-600 text-sm mt-1">Admin Login</p>
          </div>

          {error && (
            <div className="p-3 text-red-600 bg-red-100 rounded-md shadow-sm text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full px-4 py-3 mt-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 mt-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 text-white text-sm font-medium rounded-md bg-gradient-to-r from-blue-600 to-purple-600 hover:from-purple-600 hover:to-blue-600 transition duration-300 ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>

        {/* Right Side - Logo */}
        <div className="bg-white/70 flex items-center justify-center p-6 md:p-12">
          <img
            src={discountLogo}
            alt="Discount Logo"
            className="max-w-full h-auto object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
