import React, { useState, useEffect } from 'react';
import { utils, writeFile } from 'xlsx';
import axios from 'axios';
import { FaTrash, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const API = 'https://api.redemly.com/api/admin';

const AllQuizzesTable = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [exportLimit, setExportLimit] = useState(10);

  const itemsPerPage = 10;

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API}/getallquizes`);
      if (res.data?.quizzes) setQuizzes(res.data.quizzes);
    } catch {
      setError('Failed to fetch quizzes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleDelete = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this quiz?");
    if (!confirm) return;

    try {
      await axios.delete(`${API}/delete-quiz/${id}`);
      setQuizzes((prev) => prev.filter((q) => q._id !== id));
    } catch (err) {
      alert('Failed to delete quiz.');
    }
  };

  const filtered = quizzes.filter((q) =>
    q.topic.toLowerCase().includes(search.toLowerCase()) ||
    q.question.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const pageItems = filtered.slice(start, start + itemsPerPage);

  const exportData = (type) => {
    const arr = filtered.slice(0, exportLimit).map((q) => ({
      topic: q.topic,
      question: q.question,
      answer: q.answer
    }));
    const ws = utils.json_to_sheet(arr);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Quizzes');
    writeFile(wb, `quizzes.${type}`);
  };

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="p-6 bg-white rounded shadow-md max-w-6xl mx-auto">
      <h1 className="text-xl font-semibold mb-4 text-blue-800">All Quizzes</h1>

      <div className="flex justify-between mb-4">
        <input
          placeholder="Search topic or question..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="border p-2 rounded w-1/3"
        />
        <div className="flex items-center gap-2">
          <select
            className="border p-2 rounded"
            value={exportLimit}
            onChange={(e) => setExportLimit(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={500}>500</option>
          </select>
          <button 
            onClick={() => exportData('csv')} 
            className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 transition"
          >
            Export CSV
          </button>
          <button 
            onClick={() => exportData('xlsx')} 
            className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition"
          >
            Export Excel
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-center py-4">Loading quizzes...</p>
      ) : error ? (
        <p className="text-red-600 text-center py-4">{error}</p>
      ) : (
        <>
          <div className="mb-2 text-sm text-gray-600">
            Showing {start + 1}-{Math.min(start + itemsPerPage, filtered.length)} of {filtered.length} quizzes
          </div>

          <table className="w-full border-collapse border text-sm mb-4">
            <thead className="bg-gray-200">
              <tr>
                <th className="border p-2 text-left">#</th>
                <th className="border p-2 text-left">Topic</th>
                <th className="border p-2 text-left">Question</th>
                <th className="border p-2 text-left">Answer</th>
                <th className="border p-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-gray-500">
                    No quizzes found
                  </td>
                </tr>
              ) : (
                pageItems.map((q, idx) => (
                  <tr key={q._id} className="odd:bg-white even:bg-gray-50 hover:bg-gray-100">
                    <td className="border p-2">{start + idx + 1}</td>
                    <td className="border p-2 font-medium">{q.topic}</td>
                    <td className="border p-2">{q.question}</td>
                    <td className="border p-2">{q.answer}</td>
                    <td className="border p-2 text-center">
                      <button
                        onClick={() => handleDelete(q._id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition flex items-center gap-1 mx-auto"
                        title="Delete Quiz"
                      >
                        <FaTrash size={12} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination - Only Prev/Next Buttons */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className={`flex items-center gap-2 px-4 py-2 rounded transition ${
                    currentPage === 1 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <FaChevronLeft size={14} />
                  Previous
                </button>
                
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`flex items-center gap-2 px-4 py-2 rounded transition ${
                    currentPage === totalPages 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  Next
                  <FaChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AllQuizzesTable;