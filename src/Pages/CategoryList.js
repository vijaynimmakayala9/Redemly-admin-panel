import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { utils, writeFile } from 'xlsx';
import axios from 'axios';

const API_BASE = 'http://31.97.206.144:6098/api/admin';

export default function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedCategory, setEditedCategory] = useState({ _id: null, categoryName: '' });
  const [exportLimit, setExportLimit] = useState(10);
  const categoriesPerPage = 5;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch categories from API
  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_BASE}/categories`);
      if (res.data && res.data.categories) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Export to CSV or Excel
  const exportData = (type) => {
    const exportItems = filteredCategories
      .slice(0, exportLimit)
      .map(({ _id, categoryName }) => ({
        id: _id,
        categoryName: categoryName || 'N/A',
      }));

    const ws = utils.json_to_sheet(exportItems);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Categories');
    writeFile(wb, `categories.${type}`);
  };

  // Search filter
  const filteredCategories = categories.filter((cat) =>
    cat.categoryName.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination logic
  const indexOfLast = currentPage * categoriesPerPage;
  const indexOfFirst = indexOfLast - categoriesPerPage;
  const currentCategories = filteredCategories.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredCategories.length / categoriesPerPage);

  // Open edit modal and set selected category data
  const handleEditCategory = (category) => {
    setEditedCategory({ _id: category._id, categoryName: category.categoryName });
    setIsEditModalOpen(true);
  };

  // Save edited category (call update API)
  const handleSaveEditedCategory = async () => {
    if (!editedCategory.categoryName.trim()) {
      alert('Category name cannot be empty');
      return;
    }
    try {
      await axios.put(`${API_BASE}/update-categories/${editedCategory._id}`, {
        categoryName: editedCategory.categoryName,
      });
      // Update locally
      setCategories((prev) =>
        prev.map((cat) =>
          cat._id === editedCategory._id ? { ...cat, categoryName: editedCategory.categoryName } : cat
        )
      );
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Error updating category:', err);
      alert('Failed to update category');
    }
  };

  // Delete category (call delete API)
  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      await axios.delete(`${API_BASE}/delete-categories/${id}`);
      setCategories((prev) => prev.filter((cat) => cat._id !== id));
    } catch (err) {
      console.error('Error deleting category:', err);
      alert('Failed to delete category');
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-lg bg-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-blue-900">All Categories</h2>
      </div>

      <div className="flex justify-between mb-4">
        <input
          className="w-1/3 p-2 border rounded"
          placeholder="Search by category name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2 items-center">
          <select
            className="border border-gray-300 p-2 rounded"
            value={exportLimit}
            onChange={(e) => setExportLimit(parseInt(e.target.value, 10))}
          >
            <option value={10}>10</option>
            <option value={100}>100</option>
            <option value={500}>500</option>
            <option value={1000}>1000</option>
          </select>
          <button
            className="bg-gray-200 px-4 py-2 rounded"
            onClick={() => exportData('csv')}
          >
            CSV
          </button>
          <button
            className="bg-gray-200 px-4 py-2 rounded"
            onClick={() => exportData('xlsx')}
          >
            Excel
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-center">Loading categories...</p>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : (
        <>
          <div className="overflow-x-auto mb-4">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="p-2 border">Sl</th>
                  <th className="p-2 border">Category Name</th>
                  <th className="p-2 border">Created At</th>
                  <th className="p-2 border">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentCategories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-500">
                      No categories found.
                    </td>
                  </tr>
                ) : (
                  currentCategories.map((cat, index) => (
                    <tr key={cat._id} className="border-b">
                      <td className="p-2 border">{index + 1 + indexOfFirst}</td>
                      <td className="p-2 border">{cat.categoryName || 'N/A'}</td>
                      <td className="p-2 border">
                        {new Date(cat.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-2 border flex gap-2">
                        <button
                          className="bg-blue-500 text-white p-1 rounded"
                          onClick={() => handleEditCategory(cat)}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="bg-red-500 text-white p-1 rounded"
                          onClick={() => handleDeleteCategory(cat._id)}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center mt-4 gap-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="bg-gray-300 px-4 py-2 rounded"
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-4 py-2 rounded ${
                  currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="bg-gray-300 px-4 py-2 rounded"
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Edit Category Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h3 className="text-xl font-semibold mb-4">Edit Category</h3>
            <input
              type="text"
              value={editedCategory.categoryName}
              onChange={(e) =>
                setEditedCategory({ ...editedCategory, categoryName: e.target.value })
              }
              className="w-full p-3 border rounded mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditedCategory}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
