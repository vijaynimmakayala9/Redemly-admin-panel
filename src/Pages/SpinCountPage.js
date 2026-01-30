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
        // API returns a SINGLE object → convert to array
        const normalizedData = [
          {
            id: "spin-config-1", // synthetic ID
            dailySpinLimit: res.data.dailySpinLimit,
            createdAt: res.data.createdAt,
            updatedAt: res.data.updatedAt,
          },
        ];

        setSpinConfigs(normalizedData);
      }
    } catch (err) {
      console.error(err);
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

  /* ================= UI ================= */
  return (
    <div className="p-6 bg-white min-h-screen">
      <h1 className="text-2xl font-semibold text-center mb-6">
        Spin Count Management
      </h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ADD FORM */}
        <form
          onSubmit={handleAddSpinLimit}
          className="bg-gray-50 p-6 rounded shadow space-y-4"
        >
          <h2 className="text-lg font-semibold">Add Spin Limit</h2>

          <input
            type="number"
            min="1"
            value={formData.dailySpinLimit}
            onChange={(e) =>
              setFormData({ dailySpinLimit: e.target.value })
            }
            className="w-full p-3 border rounded"
            placeholder="Daily spin limit"
          />

          <button className="w-full bg-blue-600 text-white py-2 rounded">
            Add
          </button>
        </form>

        {/* TABLE */}
<div className="lg:col-span-2">
  {loading ? (
    <div className="py-10 text-center text-gray-500">Loading...</div>
  ) : (
    <div className="overflow-x-auto rounded-xl shadow border bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <tr>
            <th className="p-3 text-left w-16">S.No</th>
            <th className="p-3 text-left">Daily Spin Limit</th>
            <th className="p-3 text-left">Created</th>
            <th className="p-3 text-left">Updated</th>
            <th className="p-3 text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {currentConfigs.length > 0 ? (
            currentConfigs.map((config, index) => (
              <tr
                key={config.id}
                className="border-t hover:bg-gray-50 transition"
              >
                {/* S NO */}
                <td className="p-3 font-medium text-gray-600">
                  {(currentPage - 1) * downloadLimit + index + 1}
                </td>

                {/* LIMIT */}
                <td className="p-3">
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
                      className="w-24 px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                  ) : (
                    <span className="inline-block px-3 py-1 text-green-700 bg-green-100 rounded-full font-semibold">
                      {config.dailySpinLimit}
                    </span>
                  )}
                </td>

                {/* CREATED */}
                <td className="p-3 text-gray-600">
                  {new Date(config.createdAt).toLocaleDateString("en-IN")}
                </td>

                {/* UPDATED */}
                <td className="p-3 text-gray-600">
                  {new Date(config.updatedAt).toLocaleDateString("en-IN")}
                </td>

                {/* ACTIONS */}
                <td className="p-3">
                  <div className="flex justify-center gap-2">
                    {editingId === config.id ? (
                      <>
                        <button
                          onClick={handleEditSpinLimit}
                          className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEditing(config)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={handleDelete}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                          title="Delete"
                        >
                          <FaTrash />
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
                No spin configuration found
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
