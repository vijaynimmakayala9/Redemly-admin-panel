import { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";

const SpinCountPage = () => {
  const [spinConfigs, setSpinConfigs] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [downloadLimit, setDownloadLimit] = useState(50);
  const [formData, setFormData] = useState({
    dailySpinLimit: ""
  });
  const [editFormData, setEditFormData] = useState({
    dailySpinLimit: ""
  });
  const [loading, setLoading] = useState(false);

  // Fetch spin configurations on mount
  useEffect(() => {
    fetchSpinConfigs();
  }, []);

  const fetchSpinConfigs = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://31.97.206.144:6098/api/admin/getallspin");
      console.log("API Response:", res.data); // Debug log
      
      if (res.data && res.data.success) {
        // Handle the response structure: { success: true, data: [...] }
        setSpinConfigs(res.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch spin configs:", error);
      alert("Failed to fetch spin configurations from server.");
    } finally {
      setLoading(false);
    }
  };

  // Handle add new spin limit
  const handleAddSpinLimit = async (e) => {
    e.preventDefault();
    if (!formData.dailySpinLimit || formData.dailySpinLimit < 1) {
      alert("Please enter a valid spin limit (minimum 1)");
      return;
    }

    try {
      const res = await axios.post("http://31.97.206.144:6098/api/admin/spin-limit", {
        dailySpinLimit: parseInt(formData.dailySpinLimit)
      });

      if (res.data && res.data.success) {
        alert("Spin limit added successfully!");
        setFormData({ dailySpinLimit: "" });
        fetchSpinConfigs(); // Refresh the list
      }
    } catch (error) {
      console.error("Failed to add spin limit:", error);
      alert("Error adding spin limit: " + (error.response?.data?.message || error.message));
    }
  };

  // Handle edit spin limit
  const handleEditSpinLimit = async (id) => {
    if (!editFormData.dailySpinLimit || editFormData.dailySpinLimit < 1) {
      alert("Please enter a valid spin limit (minimum 1)");
      return;
    }

    try {
      const res = await axios.put(`http://31.97.206.144:6098/api/admin/spin-limit/${id}`, {
        dailySpinLimit: parseInt(editFormData.dailySpinLimit)
      });

      if (res.data && res.data.success) {
        alert("Spin limit updated successfully!");
        setEditingId(null);
        setEditFormData({ dailySpinLimit: "" });
        fetchSpinConfigs(); // Refresh the list
      }
    } catch (error) {
      console.error("Failed to update spin limit:", error);
      alert("Error updating spin limit: " + (error.response?.data?.message || error.message));
    }
  };

  // Handle delete spin limit
  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this spin configuration?");
    if (!confirmed) return;

    try {
      const res = await axios.delete(`http://31.97.206.144:6098/api/admin/spin-limit/${id}`);
      
      if (res.data && res.data.success) {
        alert("Spin configuration deleted successfully!");
        fetchSpinConfigs(); // Refresh the list
      }
    } catch (error) {
      console.error("Failed to delete spin config:", error);
      alert("Error deleting spin configuration: " + (error.response?.data?.message || error.message));
    }
  };

  // Start editing
  const startEditing = (config) => {
    setEditingId(config.id);
    setEditFormData({
      dailySpinLimit: config.dailySpinLimit.toString()
    });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingId(null);
    setEditFormData({ dailySpinLimit: "" });
  };

  // Pagination
  const spinConfigsPerPage = downloadLimit;
  const totalPages = Math.ceil(spinConfigs.length / spinConfigsPerPage);
  const indexOfLastConfig = currentPage * spinConfigsPerPage;
  const indexOfFirstConfig = indexOfLastConfig - spinConfigsPerPage;
  const currentConfigs = spinConfigs.slice(indexOfFirstConfig, indexOfLastConfig);

  return (
    <div className="p-6 bg-white min-h-screen">
      <h1 className="text-2xl font-semibold text-center mb-6 text-gray-700">Spin Count Management</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Side - Add Form */}
        <div className="lg:w-1/3 bg-gray-50 p-6 rounded-lg shadow border">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Add New Spin Limit</h2>
          <form onSubmit={handleAddSpinLimit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Daily Spin Limit *
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.dailySpinLimit}
                onChange={(e) => setFormData({ dailySpinLimit: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter daily spin limit"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
            >
              Add Spin Limit
            </button>
          </form>

          {/* Additional Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">Note:</h3>
            <p className="text-sm text-blue-700">
              Setting a new spin limit will update the daily spin count for all users immediately.
              Each user will receive the new limit as their daily spin count.
            </p>
          </div>
        </div>

        {/* Right Side - Table */}
        <div className="lg:w-2/3">
          {/* Controls */}
          <div className="mb-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <span className="text-gray-700 font-medium">Show:</span>
              <select
                value={downloadLimit}
                onChange={(e) => {
                  setDownloadLimit(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="p-2 border border-gray-300 rounded text-gray-700 focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </select>
              <span className="text-gray-600 bg-gray-100 px-3 py-1 rounded">
                Total: {spinConfigs.length} configuration(s)
              </span>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-2">Loading spin configurations...</p>
            </div>
          )}

          {/* Spin Configs Table */}
          {!loading && (
            <div className="overflow-x-auto bg-white rounded-lg shadow border">
              <table className="w-full border border-gray-300">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="p-3 border text-left">ID</th>
                    <th className="p-3 border text-left">Daily Spin Limit</th>
                    <th className="p-3 border text-left">Created At</th>
                    <th className="p-3 border text-left">Updated At</th>
                    <th className="p-3 border text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentConfigs.length > 0 ? (
                    currentConfigs.map((config) => (
                      <tr key={config.id} className="border-b hover:bg-gray-50 transition duration-150">
                        <td className="p-3 border text-gray-600 font-mono text-sm">
                          {config.id?.slice(-8) || 'N/A'}
                        </td>
                        
                        <td className="p-3 border">
                          {editingId === config.id ? (
                            <input
                              type="number"
                              min="1"
                              value={editFormData.dailySpinLimit}
                              onChange={(e) => setEditFormData({ dailySpinLimit: e.target.value })}
                              className="w-24 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                              autoFocus
                            />
                          ) : (
                            <span className="font-semibold text-green-600 text-lg">
                              {config.dailySpinLimit}
                            </span>
                          )}
                        </td>
                        
                        <td className="p-3 border text-gray-600">
                          {config.createdAt ? new Date(config.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          }) : 'N/A'}
                        </td>
                        
                        <td className="p-3 border text-gray-600">
                          {config.updatedAt ? new Date(config.updatedAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          }) : 'N/A'}
                        </td>
                        
                        <td className="p-3 border">
                          <div className="flex justify-center gap-3">
                            {editingId === config.id ? (
                              <>
                                <button
                                  onClick={() => handleEditSpinLimit(config.id)}
                                  className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 transition duration-200 flex items-center gap-2"
                                >
                                  <FaEdit /> Save
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  className="bg-gray-600 text-white px-3 py-2 rounded hover:bg-gray-700 transition duration-200"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button 
                                  onClick={() => startEditing(config)}
                                  className="text-blue-600 hover:text-blue-800 transition duration-200 p-2 hover:bg-blue-50 rounded"
                                  title="Edit"
                                >
                                  <FaEdit size={18} />
                                </button>
                                <button 
                                  onClick={() => handleDelete(config.id)}
                                  className="text-red-600 hover:text-red-800 transition duration-200 p-2 hover:bg-red-50 rounded"
                                  title="Delete"
                                >
                                  <FaTrash size={18} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-lg">No spin configurations found.</p>
                          <p className="text-sm mt-1">Add a new spin limit using the form on the left.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex justify-center mt-6 gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="bg-gray-200 px-4 py-2 rounded disabled:opacity-50 hover:bg-gray-300 transition duration-200 font-medium"
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`px-4 py-2 rounded transition duration-200 font-medium ${
                    currentPage === idx + 1 
                      ? "bg-blue-500 text-white" 
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="bg-gray-200 px-4 py-2 rounded disabled:opacity-50 hover:bg-gray-300 transition duration-200 font-medium"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Popup Modal */}
      {editingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Edit Spin Limit</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Daily Spin Limit *
                </label>
                <input
                  type="number"
                  min="1"
                  value={editFormData.dailySpinLimit}
                  onChange={(e) => setEditFormData({ dailySpinLimit: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter daily spin limit"
                  autoFocus
                />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button
                  onClick={cancelEditing}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleEditSpinLimit(editingId)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition duration-200 font-medium"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpinCountPage;