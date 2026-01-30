import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  RiEdit2Line,
  RiDeleteBin6Line,
  RiEyeLine,
  RiCloseLine,
  RiLoader4Line,
} from "react-icons/ri";

const AdminAllBanners = () => {
  const [banners, setBanners] = useState([]);
  const [editId, setEditId] = useState(null);
  const [newImages, setNewImages] = useState([]);
  const [loading, setLoading] = useState(false);

  // View modal
  const [viewOpen, setViewOpen] = useState(false);
  const [viewBanner, setViewBanner] = useState(null);

  /* ---------- FETCH ALL ---------- */
  const fetchBanners = async () => {
    try {
      const res = await axios.get(
        "https://api.redemly.com/api/admin/banners"
      );
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
      const res = await axios.get(
        `https://api.redemly.com/api/admin/get/${id}`
      );
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
      await axios.delete(
        `https://api.redemly.com/api/admin/banner/${id}`
      );
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

      await axios.put(
        `https://api.redemly.com/api/admin/update/${id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setEditId(null);
      setNewImages([]);
      fetchBanners();
    } catch {
      alert("Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">All Banners</h2>
        <p className="text-sm text-gray-500">
          View, update, or delete uploaded banners
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
            {/* Images preview */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-4">
              {banner.images.map((img) => (
                <img
                  key={img._id}
                  src={img.url}
                  alt="banner"
                  className="w-full h-28 object-cover rounded-lg border"
                />
              ))}
            </div>

            {/* Edit input */}
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
              {/* View */}
              {/* <button
                onClick={() => handleView(banner._id)}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                <RiEyeLine /> View
              </button> */}

              {/* Edit / Save */}
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

              {/* Cancel */}
              {editId === banner._id && (
                <button
                  onClick={() => setEditId(null)}
                  className="px-3 py-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
                >
                  Cancel
                </button>
              )}

              {/* Delete */}
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

      {/* ---------- VIEW MODAL ---------- */}
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
