import { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";

const SpinCountPage = () => {
  const [spinConfigs, setSpinConfigs] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [downloadLimit, setDownloadLimit] = useState(10);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    dailySpinLimit: "",
  });

  const [editFormData, setEditFormData] = useState({
    dailySpinLimit: "",
  });

  useEffect(() => {
    fetchSpinConfigs();
  }, []);

  /* ================= FETCH ================= */
  const fetchSpinConfigs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        "https://api.redemly.com/api/admin/getallspin"
      );

      if (res.data?.success) {
        const normalizedData = [
          {
            id: "spin-config-1",
            dailySpinLimit: res.data.dailySpinLimit,
            createdAt: res.data.createdAt,
            updatedAt: res.data.updatedAt,
          },
        ];
        setSpinConfigs(normalizedData);
      }
    } catch (err) {
      alert("Failed to fetch spin configuration");
    } finally {
      setLoading(false);
    }
  };

  /* ================= ADD ================= */
  const handleAddSpinLimit = async (e) => {
    e.preventDefault();

    if (!formData.dailySpinLimit || formData.dailySpinLimit < 1) {
      return alert("Enter a valid spin limit");
    }

    try {
      const res = await axios.post(
        "https://api.redemly.com/api/admin/spin-limit",
        {
          dailySpinLimit: Number(formData.dailySpinLimit),
        }
      );

      if (res.data?.success) {
        alert("Spin limit added");
        setFormData({ dailySpinLimit: "" });
        fetchSpinConfigs();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Add failed");
    }
  };

  /* ================= EDIT ================= */
  const handleEditSpinLimit = async () => {
    if (!editFormData.dailySpinLimit || editFormData.dailySpinLimit < 1) {
      return alert("Enter valid spin limit");
    }

    try {
      const res = await axios.post(
        "https://api.redemly.com/api/admin/spin-limit",
        {
          dailySpinLimit: Number(editFormData.dailySpinLimit),
        }
      );

      if (res.data?.success) {
        alert("Spin limit updated");
        setEditingId(null);
        setEditFormData({ dailySpinLimit: "" });
        fetchSpinConfigs();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    if (!window.confirm("Delete spin configuration?")) return;

    try {
      const res = await axios.delete(
        "https://api.redemly.com/api/admin/spin-limit"
      );

      if (res.data?.success) {
        alert("Deleted");
        fetchSpinConfigs();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  /* ================= EDIT STATE ================= */
  const startEditing = (config) => {
    setEditingId(config.id);
    setEditFormData({
      dailySpinLimit: String(config.dailySpinLimit),
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditFormData({ dailySpinLimit: "" });
  };

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(spinConfigs.length / downloadLimit);
  const indexOfLast = currentPage * downloadLimit;
  const indexOfFirst = indexOfLast - downloadLimit;
  const currentConfigs = spinConfigs.slice(indexOfFirst, indexOfLast);

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* TITLE */}
      <h1 className="text-xl sm:text-2xl font-semibold text-center mb-6">
        Spin Count Management
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ADD FORM */}
        <form
          onSubmit={handleAddSpinLimit}
          className="bg-white p-4 sm:p-6 rounded-xl shadow-md space-y-4"
        >
          <h2 className="text-base sm:text-lg font-semibold">
            Add Spin Limit
          </h2>

          <input
            type="number"
            min="1"
            value={formData.dailySpinLimit}
            onChange={(e) =>
              setFormData({ dailySpinLimit: e.target.value })
            }
            className="w-full p-2 sm:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Daily spin limit"
          />

          <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
            Add
          </button>
        </form>

        {/* TABLE */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="py-10 text-center text-gray-500">
              Loading...
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl shadow bg-white">
              <table className="min-w-[600px] w-full text-xs sm:text-sm">
                <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <tr>
                    <th className="p-2 sm:p-3 text-left">#</th>
                    <th className="p-2 sm:p-3 text-left">Limit</th>
                    <th className="p-2 sm:p-3 text-left">Created</th>
                    <th className="p-2 sm:p-3 text-left">Updated</th>
                    <th className="p-2 sm:p-3 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {currentConfigs.length > 0 ? (
                    currentConfigs.map((config, index) => (
                      <tr
                        key={config.id}
                        className="border-t hover:bg-gray-50 transition"
                      >
                        <td className="p-2 sm:p-3">
                          {(currentPage - 1) * downloadLimit +
                            index +
                            1}
                        </td>

                        <td className="p-2 sm:p-3">
                          {editingId === config.id ? (
                            <input
                              type="number"
                              min="1"
                              value={editFormData.dailySpinLimit}
                              onChange={(e) =>
                                setEditFormData({
                                  dailySpinLimit: e.target.value,
                                })
                              }
                              className="w-20 px-2 py-1 border rounded"
                            />
                          ) : (
                            <span className="px-2 py-1 text-green-700 bg-green-100 rounded-full text-xs sm:text-sm">
                              {config.dailySpinLimit}
                            </span>
                          )}
                        </td>

                        <td className="p-2 sm:p-3 text-gray-600">
                          {new Date(
                            config.createdAt
                          ).toLocaleDateString("en-IN")}
                        </td>

                        <td className="p-2 sm:p-3 text-gray-600">
                          {new Date(
                            config.updatedAt
                          ).toLocaleDateString("en-IN")}
                        </td>

                        <td className="p-2 sm:p-3">
                          <div className="flex justify-center gap-2">
                            {editingId === config.id ? (
                              <>
                                <button className="px-2 py-1 text-xs bg-green-600 text-white rounded">
                                  Save
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  className="px-2 py-1 text-xs bg-gray-500 text-white rounded"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() =>
                                    startEditing(config)
                                  }
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                >
                                  <FaEdit size={14} />
                                </button>
                                <button
                                  onClick={handleDelete}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                                >
                                  <FaTrash size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="p-6 text-center text-gray-500"
                      >
                        No data found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpinCountPage;