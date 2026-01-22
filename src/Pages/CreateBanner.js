import React, { useState } from "react";
import axios from "axios";
import { RiImageAddLine, RiLoader4Line } from "react-icons/ri";

const CreateBanner = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setImages([...e.target.files]);
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!images.length) return alert("Please select images");

    try {
      setLoading(true);

      const formData = new FormData();
      images.forEach((img) => formData.append("images", img));

      await axios.post(
        "http://31.97.206.144:6091/api/admin/banner",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setImages([]);
      setSuccess("Banner uploaded successfully 🎉");
    } catch (err) {
      alert(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Create Banner</h2>
        <p className="text-sm text-gray-500">
          Upload multiple banner images (PNG, JPG, JPEG)
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Upload Box */}
        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-blue-300 rounded-xl cursor-pointer bg-blue-50 hover:bg-blue-100 transition">
          <RiImageAddLine className="text-4xl text-blue-600 mb-2" />
          <p className="text-sm font-medium text-blue-700">
            Click to upload or drag & drop
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Multiple images supported
          </p>

          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleChange}
            className="hidden"
          />
        </label>

        {/* Preview Section */}
        {images.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Preview ({images.length})
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((img, i) => (
                <div
                  key={i}
                  className="relative group border rounded-xl overflow-hidden shadow-sm"
                >
                  <img
                    src={URL.createObjectURL(img)}
                    alt="preview"
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      Image {i + 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          disabled={loading}
          className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition
            ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
          {loading && <RiLoader4Line className="animate-spin text-xl" />}
          {loading ? "Uploading..." : "Create Banner"}
        </button>
      </form>

      {/* Success Message */}
      {success && (
        <div className="mt-4 p-3 rounded-lg bg-green-100 text-green-700 text-sm font-medium">
          ✅ {success}
        </div>
      )}
    </div>
  );
};

export default CreateBanner;
