import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTrash } from "react-icons/fa";

const API_URL = "https://api.redemly.com/api/users/getallnews";
const DELETE_API = "https://api.redemly.com/api/users/delete-news";

const ITEMS_PER_PAGE = 6;

const CATEGORIES = [
  "Immigration",
  "Stocks & Finance",
  "AI & Tech",
  "India",
  "Cricket",
  "Geopolitics",
  "Austin Local",
  // "US Immigration",
  // "Startup News",
  // "Cricket",
  // "Tech Jobs",
  // "Geopolitical News",
  // "Stock Market & Crypto",
  // "AI Developments",
  // "AP/TS Local News"
];

const AdminLatestNews = () => {
  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [view, setView] = useState("table");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    filterNews();
  }, [search, category, news]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      setNews(res.data.news || []);
      setFilteredNews(res.data.news || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterNews = () => {
    let data = [...news];

    if (category !== "All") {
      data = data.filter((n) => n.category === category);
    }

    if (search) {
      data = data.filter((n) =>
        n.catchy_headline.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredNews(data);
    setPage(1);
  };

  const deleteNews = async (id) => {
    if (!window.confirm("Delete this news article?")) return;

    try {
      await axios.delete(`${DELETE_API}/${id}`);

      const updated = news.filter((n) => n._id !== id);
      setNews(updated);
      setFilteredNews(updated);

      alert("News deleted successfully");
    } catch {
      alert("Delete failed");
    }
  };

  const totalPages = Math.ceil(filteredNews.length / ITEMS_PER_PAGE);

  const paginatedNews = filteredNews.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  /* Ellipsis Pagination */
  const getPagination = () => {
    const pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, "...", totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
      }
    }

    return pages;
  };

  /* Empty State UI */
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center bg-white rounded-xl shadow p-12 text-center">
      <div className="text-6xl mb-4">📰</div>

      <h3 className="text-lg font-semibold text-gray-700 mb-2">
        No News Found
      </h3>

      <p className="text-sm text-gray-500 max-w-sm">
        No news available for this category or search query.
        Try selecting another category or clearing the search.
      </p>

      <button
        onClick={() => {
          setCategory("All");
          setSearch("");
        }}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        Reset Filters
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">

      {/* Header */}
      <div className="bg-white shadow rounded-xl p-6 mb-6">

        <div className="flex flex-col md:flex-row justify-between gap-4">

          <h2 className="text-2xl font-bold text-gray-800">
            Latest News
          </h2>

          <div className="flex gap-2">

            <button
              onClick={() => setView("grid")}
              className={`px-4 py-2 rounded-lg text-sm ${view === "grid"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100"
                }`}
            >
              Grid
            </button>

            <button
              onClick={() => setView("table")}
              className={`px-4 py-2 rounded-lg text-sm ${view === "table"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100"
                }`}
            >
              Table
            </button>

          </div>

        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mt-4">

          <input
            type="text"
            placeholder="Search headline..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-4 py-2 w-full md:w-64"
          />

          <select
            className="border rounded-lg px-4 py-2"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="All">All Categories</option>

            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}

          </select>

        </div>

      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-10 text-gray-500">
          Loading news...
        </div>
      )}

      {/* GRID VIEW */}
      {!loading && view === "grid" && (
        filteredNews.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            {paginatedNews.map((item) => (

              <div
                key={item._id}
                className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
              >

                {/* Necessary field: url_large — cover image */}
                <img
                  src={item.url_large}
                  className="w-full h-44 object-cover"
                  alt={item.catchy_headline}
                />

                <div className="p-4">

                  {/* Necessary fields: category_emoji + category */}
                  <div className="text-sm text-gray-500 mb-1">
                    {item.category_emoji} {item.category}
                  </div>

                  {/* Necessary field: catchy_headline */}
                  <h3 className="font-semibold text-gray-800 line-clamp-2">
                    {item.catchy_headline}
                  </h3>

                  {/* Necessary field: tldr */}
                  <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                    {item.tldr}
                  </p>

                  <div className="flex justify-between items-center mt-4">

                    {/* Necessary field: published_at */}
                    <span className="text-xs text-gray-400">
                      {new Date(item.published_at).toLocaleDateString()}
                    </span>

                    {/* Necessary field: source_name */}
                    <span className="text-xs text-blue-500 font-medium truncate max-w-[100px]">
                      {item.source_name}
                    </span>

                    {/* Action: delete using _id */}
                    <button
                      onClick={() => deleteNews(item._id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      <FaTrash />
                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>
        )
      )}

      {/* TABLE VIEW */}
      {!loading && view === "table" && (
        filteredNews.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto bg-white rounded-xl shadow">

            <table className="min-w-full text-sm">

              <thead className="bg-gray-100 text-gray-600">

                <tr>
                  <th className="p-3 text-left">S.No</th>
                  <th className="p-3 text-left">Image</th>
                  <th className="p-3 text-left">Headline</th>
                  <th className="p-3 text-left">Category</th>
                  <th className="p-3 text-left">TLDR</th>
                  <th className="p-3 text-left">Source</th>
                  <th className="p-3 text-left">Published</th>
                  <th className="p-3 text-left">Action</th>
                </tr>

              </thead>

              <tbody>

                {paginatedNews.map((item, index) => {

                  const serialNumber = (page - 1) * ITEMS_PER_PAGE + index + 1;

                  return (

                    <tr key={item._id} className="border-t hover:bg-gray-50">

                      {/* Necessary field: serial number (derived) */}
                      <td className="p-3 font-medium text-gray-600">
                        {serialNumber}
                      </td>

                      {/* Necessary field: url — thumbnail */}
                      <td className="p-3">
                        <img
                          src={item.url}
                          className="w-16 h-12 object-cover rounded"
                          alt={item.catchy_headline}
                        />
                      </td>

                      {/* Necessary field: catchy_headline */}
                      <td className="p-3 font-medium text-gray-700 max-w-[220px]">
                        {item.catchy_headline}
                      </td>

                      {/* Necessary fields: category_emoji + category */}
                      <td className="p-3 whitespace-nowrap">
                        {item.category_emoji} {item.category}
                      </td>

                      {/* Necessary field: tldr */}
                      <td className="p-3 text-gray-500 max-w-[200px] line-clamp-2">
                        {item.tldr}
                      </td>

                      {/* Necessary field: source_name */}
                      <td className="p-3 text-blue-500 font-medium whitespace-nowrap">
                        {item.source_name}
                      </td>

                      {/* Necessary field: published_at */}
                      <td className="p-3 text-gray-500 whitespace-nowrap">
                        {new Date(item.published_at).toLocaleDateString()}
                      </td>

                      {/* Action: delete using _id */}
                      <td className="p-3">
                        <button
                          onClick={() => deleteNews(item._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FaTrash />
                        </button>
                      </td>

                    </tr>

                  );

                })}

              </tbody>

            </table>

          </div>
        )
      )}

      {/* Pagination */}
      {filteredNews.length > 0 && (
        <div className="flex justify-center items-center mt-10 gap-2 flex-wrap">

          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 border rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50"
          >
            Prev
          </button>

          {getPagination().map((p, index) => (

            <button
              key={index}
              disabled={p === "..."}
              onClick={() => p !== "..." && setPage(p)}
              className={`px-3 py-1 rounded-lg border text-sm ${p === page
                  ? "bg-blue-600 text-white"
                  : "bg-white hover:bg-gray-100"
                } ${p === "..." ? "cursor-default border-none" : ""}`}
            >
              {p}
            </button>

          ))}

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 border rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50"
          >
            Next
          </button>

        </div>
      )}

    </div>
  );
};

export default AdminLatestNews;