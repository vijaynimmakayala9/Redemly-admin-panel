import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  RiEdit2Line,
  RiDeleteBin6Line,
  RiEyeLine,
  RiCloseLine,
  RiLoader4Line,
} from "react-icons/ri";

const API = "https://api.redemly.com/api/admin";

const AdminAllBanners = () => {
  const [banners, setBanners] = useState([]);
  const [editId, setEditId] = useState(null);
  const [newImages, setNewImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const [viewOpen, setViewOpen] = useState(false);
  const [viewBanner, setViewBanner] = useState(null);

  /* ---------- FETCH ALL BANNERS ---------- */
  const fetchBanners = async () => {
    try {
      const res = await axios.get(`${API}/banners`);
      setBanners(res.data.data || []);
    } catch {
      alert("Failed to load banners");
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  /* ---------- VIEW SINGLE ---------- */
  const handleView = async (id) => {
    try {
      const res = await axios.get(`${API}/get/${id}`);
      setViewBanner(res.data.data);
      setViewOpen(true);
    } catch {
      alert("Failed to load banner");
    }
  };

  /* ---------- DELETE ---------- */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this banner permanently?")) return;

    try {
      await axios.delete(`${API}/banner/${id}`);
      fetchBanners();
    } catch {
      alert("Delete failed");
    }
  };

  /* ---------- UPDATE ---------- */
  const handleUpdate = async (id) => {
    if (!newImages.length) return alert("Select images");

    try {
      setLoading(true);

      const formData = new FormData();
      newImages.forEach((img) => formData.append("images", img));

      await axios.put(`${API}/update/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setEditId(null);
      setNewImages([]);
      fetchBanners();
    } catch {
      alert("Update failed");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- TOGGLE IMAGE ---------- */
  const toggleImage = async (bannerId, imageId, currentStatus) => {
    try {
      await axios.patch(
        `${API}/banners/${bannerId}/images/${imageId}/toggle`,
        { isActive: !currentStatus }
      );

      fetchBanners();
    } catch {
      alert("Image toggle failed");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">All Banners</h2>
        <p className="text-sm text-gray-500">
          Manage banners, toggle images, update or delete
        </p>
      </div>

      {banners.length === 0 && (
        <p className="text-gray-500 text-sm">No banners found</p>
      )}

      {/* Banner Cards */}
      <div className="space-y-6">
        {banners.map((banner) => (
          <div
            key={banner._id}
            className="border rounded-xl p-4 hover:shadow-md transition"
          >
            {/* Banner Header */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-semibold text-gray-700">
                Banner ID: {banner._id.slice(-6)}
              </span>
            </div>

            {/* Images */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-4">
              {banner.images.map((img) => (
                <div key={img._id} className="relative">
                  <img
                    src={img.url}
                    alt="banner"
                    className="w-full h-28 object-cover rounded-lg border"
                  />

                  <button
                    onClick={() =>
                      toggleImage(banner._id, img._id, img.isActive)
                    }
                    className={`absolute bottom-1 left-1 text-xs px-2 py-1 rounded-full font-semibold ${img.isActive
                        ? "bg-green-600 text-white"
                        : "bg-gray-400 text-white"
                      }`}
                  >
                    {img.isActive ? "Active" : "Inactive"}
                  </button>
                </div>
              ))}
            </div>

            {/* Edit Upload */}
            {editId === banner._id && (
              <input
                type="file"
                multiple
                onChange={(e) => setNewImages([...e.target.files])}
                className="mb-4 block w-full text-sm"
              />
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleView(banner._id)}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                <RiEyeLine /> View
              </button>

              {editId === banner._id ? (
                <button
                  onClick={() => handleUpdate(banner._id)}
                  disabled={loading}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                  {loading && <RiLoader4Line className="animate-spin" />}
                  Save
                </button>
              ) : (
                <button
                  onClick={() => setEditId(banner._id)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm"
                >
                  <RiEdit2Line /> Edit
                </button>
              )}

              {editId === banner._id && (
                <button
                  onClick={() => setEditId(null)}
                  className="px-3 py-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
                >
                  Cancel
                </button>
              )}

              <button
                onClick={() => handleDelete(banner._id)}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
              >
                <RiDeleteBin6Line /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* VIEW MODAL */}
      {viewOpen && viewBanner && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-white max-w-4xl w-full rounded-2xl p-6 relative">
            <button
              onClick={() => setViewOpen(false)}
              className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-black"
            >
              <RiCloseLine />
            </button>

            <h3 className="text-xl font-bold mb-4 text-gray-800">
              Banner Preview
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {viewBanner.images.map((img) => (
                <img
                  key={img._id}
                  src={img.url}
                  alt="banner"
                  className="w-full h-32 object-cover rounded-lg border"
                />
              ))}
            </div>

            <p className="text-xs text-gray-500 mt-4">
              Created: {new Date(viewBanner.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAllBanners;