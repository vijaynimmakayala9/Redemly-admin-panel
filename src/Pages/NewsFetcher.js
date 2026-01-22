import React, { useState, useEffect } from "react";
import axios from "axios";

const CATEGORIES = [
  "US Immigration",
      "Startup News",
      "Cricket",
      "Tech Jobs",
      "Geopolitical News",
      "Stock Market & Crypto",
      "AI Developments",
      "AP/TS Local News"
];

const NewsFetcher = () => {
  const [category, setCategory] = useState("");
  const [generatedNews, setGeneratedNews] = useState([]);
  const [storedNews, setStoredNews] = useState([]);
  const [filteredStoredNews, setFilteredStoredNews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [storedLoading, setStoredLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [storedCategory, setStoredCategory] = useState(""); // Alag category for stored news

  const NEWS_PER_PAGE = 10;

  // Stored news ke liye alag category filter
  useEffect(() => {
    const fetchNews = async () => {
      setStoredLoading(true);
      try {
        const res = await axios.get("https://api.redemly.com/api/users/latestnews", {
          params: storedCategory ? { category: storedCategory } : {},
        });

        if (res.data.success) {
          setStoredNews(res.data.news || []);
          setFilteredStoredNews(res.data.news || []);
          setCurrentPage(1);
        } else {
          setStoredNews([]);
          setFilteredStoredNews([]);
        }
      } catch (error) {
        console.error("Error fetching news:", error);
        setStoredNews([]);
        setFilteredStoredNews([]);
        setErrorMsg("Failed to fetch news.");
      } finally {
        setStoredLoading(false);
      }
    };

    fetchNews();
  }, [storedCategory]); // Sirf storedCategory change par hi fetch hoga

  // Filter stored news based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredStoredNews(storedNews);
    } else {
      const filtered = storedNews.filter(news => 
        news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (news.description && news.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (news.source && news.source.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredStoredNews(filtered);
    }
    setCurrentPage(1); // Reset to first page when search changes
  }, [searchTerm, storedNews]);

  const handleGenerateNews = async () => {
    if (!category) {
      setErrorMsg("Please select a category.");
      return;
    }

    setLoading(true);
    setGeneratedNews([]);
    setErrorMsg("");

    try {
      const res = await axios.get("https://api.redemly.com/api/users/generate-news", {
        params: { category },
      });

      if (res.data.success) {
        setGeneratedNews(res.data.news || []);
        // Yahan par stored news ko refresh nahi karenge
        // Sirf generated news update karenge
      } else {
        setErrorMsg(res.data.message || "No news generated.");
      }
    } catch (error) {
      console.error("Error generating news:", error);
      setErrorMsg("Something went wrong while generating news.");
    } finally {
      setLoading(false);
    }
  };

  // Manually refresh stored news ka option
  const handleRefreshStoredNews = async () => {
    setStoredLoading(true);
    try {
      const res = await axios.get("https://api.redemly.com/api/users/latestnews", {
        params: storedCategory ? { category: storedCategory } : {},
      });

      if (res.data.success) {
        setStoredNews(res.data.news || []);
        setFilteredStoredNews(res.data.news || []);
        setCurrentPage(1);
        setErrorMsg("");
      } else {
        setStoredNews([]);
        setFilteredStoredNews([]);
      }
    } catch (error) {
      console.error("Error fetching news:", error);
      setErrorMsg("Failed to fetch news.");
    } finally {
      setStoredLoading(false);
    }
  };

  // Smart pagination numbers generator
  const getPaginationNumbers = () => {
    const totalNumbers = 5;
    const totalBlocks = totalNumbers + 2;
    
    if (totalPages <= totalBlocks) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);
    
    let pages = [1];

    if (startPage > 2) {
      pages.push('...');
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages - 1) {
      pages.push('...');
    }

    pages.push(totalPages);
    return pages;
  };

  const paginatedNews = filteredStoredNews.slice(
    (currentPage - 1) * NEWS_PER_PAGE,
    currentPage * NEWS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredStoredNews.length / NEWS_PER_PAGE);

  const NewsCard = ({ news }) => (
    <div className="bg-white border rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <img
        src={news.image}
        alt={news.title}
        className="w-full h-48 object-cover"
        loading="lazy"
        onError={(e) => {
          e.target.src = "https://assets.bwbx.io/images/users/iqjWHBFdfxIU/iYd04u2j7sS4/v0/-1x-1.jpg";
        }}
      />
      <div className="p-4">
        <h3 className="font-semibold text-lg text-purple-900 mb-2">{news.title}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{news.description}</p>
        {news.source && (
          <a
            href={news.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-purple-600 hover:underline text-sm font-medium"
          >
            Source: {news.source}
          </a>
        )}
        <p className="text-xs text-gray-400 mt-2">
          Published: {new Date(news.pubDate).toLocaleDateString()}
        </p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-purple-800 mb-2">📰 News Generator</h1>
      <p className="text-gray-600 mb-6">Generate and explore latest news from various categories</p>

      {/* Category selector and Generate button - SIRF GENERATE KE LIYE */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
        <div className="w-full md:w-1/2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Category for Generation
          </label>
          <select
            className="p-3 border border-gray-300 rounded w-full focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Select a category to generate</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-auto mt-4 md:mt-6">
          <button
            className="bg-purple-700 hover:bg-purple-800 text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:bg-purple-400 disabled:cursor-not-allowed w-full md:w-auto"
            onClick={handleGenerateNews}
            disabled={loading || !category}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </span>
            ) : "Generate News"}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {errorMsg}
        </div>
      )}

      {/* Newly Generated News - Separate Section */}
      {generatedNews.length > 0 && (
        <div className="mb-8 bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-green-700 flex items-center">
              <span className="bg-green-100 text-green-800 p-2 rounded-full mr-2">🆕</span>
              Newly Generated News - {category}
            </h2>
            <span className="text-sm text-gray-500 bg-green-50 px-3 py-1 rounded-full">
              {generatedNews.length} new articles
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {generatedNews.map((news, index) => (
              <NewsCard key={news._id || news.id || index} news={news} />
            ))}
          </div>
        </div>
      )}

      {/* Stored News Section - Separate Section with its own filter */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <span className="bg-purple-100 text-purple-800 p-2 rounded-full mr-2">📰</span>
                Stored News Articles
              </h2>
              {/* Refresh button for stored news */}
              <button
                onClick={handleRefreshStoredNews}
                disabled={storedLoading}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh stored news"
              >
                <svg className={`h-4 w-4 ${storedLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
            
            {/* Stored News ke liye alag filter section */}
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              {/* Category filter for stored news */}
              <div className="w-full sm:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Category
                </label>
                <select
                  className="p-2 border border-gray-300 rounded w-full focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                  value={storedCategory}
                  onChange={(e) => setStoredCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Search Input */}
              <div className="w-full sm:w-64">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search News
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search news..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            Showing {filteredStoredNews.length} articles
            {storedCategory && ` in ${storedCategory}`}
            {searchTerm && ` matching "${searchTerm}"`}
          </div>
        </div>

        {storedLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
            <p className="mt-2 text-gray-600">Loading news...</p>
          </div>
        ) : filteredStoredNews.length > 0 ? (
          <div className="p-6">
            <div className="overflow-x-auto rounded-lg border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title & Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedNews.map((news) => (
                    <tr key={news._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img
                          src={news.image}
                          alt="News"
                          className="h-12 w-16 object-cover rounded border"
                          onError={(e) => {
                            e.target.src = "https://assets.bwbx.io/images/users/iqjWHBFdfxIU/iYd04u2j7sS4/v0/-1x-1.jpg";
                          }}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 max-w-xs">{news.title}</div>
                        {news.description && (
                          <div className="text-sm text-gray-600 mt-1 max-w-md line-clamp-2">
                            {news.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {news.category || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {news.source && (
                          <a
                            href={news.link}
                            className="text-purple-600 hover:text-purple-800 hover:underline text-sm font-medium"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {news.source}
                          </a>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(news.pubDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * NEWS_PER_PAGE + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(currentPage * NEWS_PER_PAGE, filteredStoredNews.length)}
                  </span> of{" "}
                  <span className="font-medium">{filteredStoredNews.length}</span> articles
                </div>
                
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </button>
                  
                  {getPaginationNumbers().map((pageNum, index) => (
                    <button
                      key={index}
                      onClick={() => typeof pageNum === 'number' && setCurrentPage(pageNum)}
                      disabled={pageNum === '...'}
                      className={`px-3 py-2 border rounded-md text-sm font-medium min-w-[40px] ${
                        pageNum === '...' 
                          ? 'bg-transparent cursor-default' 
                          : currentPage === pageNum 
                          ? 'bg-purple-700 text-white border-purple-700' 
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      } transition-colors`}
                    >
                      {pageNum}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">📰</div>
            <p className="text-gray-500 text-lg">
              {searchTerm 
                ? `No news found matching "${searchTerm}"${storedCategory ? ` in ${storedCategory}` : ""}.`
                : `No stored news found${storedCategory ? ` for ${storedCategory}` : ""}.`
              }
            </p>
            <p className="text-gray-400 mt-2">
              {searchTerm 
                ? "Try a different search term or clear the search."
                : "Try generating some news or select a different category."
              }
            </p>
            {(searchTerm || storedCategory) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStoredCategory("");
                }}
                className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsFetcher;