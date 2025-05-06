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
    // Placeholder for login logic
    navigate('/dashboard');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://img.freepik.com/free-photo/hand-painted-watercolor-background-with-sky-clouds-shape_24972-1095.jpg?t=st=1746429807~exp=1746433407~hmac=e3434110c0769d2ad42bd54e0534379335887da5831a723df88f4f74891e28d2&w=1380')",
      }}
    >
      <div className="bg-white/70 backdrop-blur-md shadow-2xl rounded-xl w-full max-w-3xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left - Form */}
          <div className="p-8 sm:p-10 space-y-6">
            <div className="text-center">
            <h1 className="text-3xl font-extrabold text-center">
            <span className="text-blue-600">POSTER</span>{' '}
            <span className="text-black">BANAVO</span>
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
                className="w-full px-4 py-3 mt-1 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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
                className="w-full px-4 py-3 mt-1 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              </div>

              <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 text-white text-sm font-medium rounded-md transition duration-200 ${
                isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:scale-[1.02]'
              }`}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>            
            </form>
          </div>

          {/* Right - Illustration */}
          <div className="hidden md:block">
            <img
              src="https://mir-s3-cdn-cf.behance.net/projects/original/ec753e129429523.61a1e79332f16.png"
              alt="Vendor Login Illustration"
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
