import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-blue-100 to-purple-200">
      <div className="bg-white/70 backdrop-blur-md shadow-2xl rounded-xl w-full max-w-3xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left - Form */}
          <div className="p-8 sm:p-10 space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                Redeemly
              </h1>
              <p className="text-gray-700 text-sm mt-1">Admin Login</p>
            </div>

            {error && (
              <div className="p-3 text-red-600 bg-red-100 rounded-md shadow-sm text-sm">
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
                  className="w-full px-4 py-3 mt-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
                  className="w-full px-4 py-3 mt-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 text-white text-sm font-medium rounded-md transition duration-300 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-purple-600 hover:to-blue-600 focus:outline-none focus:ring-4 focus:ring-purple-300 ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>

          {/* Right - Illustration */}
          <div className="hidden md:block">
            <img
              src="https://media.istockphoto.com/id/1438476855/photo/3d-character-hand-holding-a-smartphone-login-and-password-from-an-account-in-a-mobile-phone.jpg?b=1&s=612x612&w=0&k=20&c=0uo1cQYCMf4ebQl_ocKTtrP4eBcfr_7yHsmiGM5ieQE="
              alt="Admin Login Illustration"
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
