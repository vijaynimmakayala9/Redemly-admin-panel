import React, { useState, useEffect } from "react";
import axios from "axios";

const PrivacyPolicyPage = () => {
  const [policy, setPolicy] = useState(null);
  const [editModal, setEditModal] = useState(false);
  const [edited, setEdited] = useState({ title: "", content: "", date: "", _id: "" });
  const [error, setError] = useState("");

  // ✅ Fetch the existing privacy policy (single object)
  useEffect(() => {
    axios
      .get("http://31.97.206.144:6098/api/admin/privacy-policy")
      .then((res) => {
        if (res.data.success && res.data.data) {
          setPolicy(res.data.data);
        } else {
          setPolicy(null);
        }
      })
      .catch(() => setError("Failed to fetch privacy policy."));
  }, []);

  // ✅ Open modal for editing
  const handleEdit = () => {
    if (!policy) return;
    setEdited({ ...policy });
    setEditModal(true);
  };

  // ✅ Open modal for creating
  const handleCreate = () => {
    setEdited({ title: "", content: "", date: "" });
    setEditModal(true);
  };

  // ✅ Save (create or update based on _id)
  const handleSave = async () => {
    try {
      if (edited._id) {
        // Update
        const res = await axios.put(
          `http://31.97.206.144:6098/api/admin/privacy-policy/${edited._id}`,
          {
            title: edited.title,
            content: edited.content,
            date: edited.date,
          }
        );
        if (res.data.success) {
          setPolicy(res.data.data);
          setEditModal(false);
        } else {
          alert(res.data.message || "Update failed.");
        }
      } else {
        // Create
        const res = await axios.post("http://31.97.206.144:6098/api/admin/privacy-policy", {
          title: edited.title,
          content: edited.content,
          date: edited.date,
        });
        if (res.data.success) {
          setPolicy(res.data.data);
          setEditModal(false);
        } else {
          alert(res.data.message || "Creation failed.");
        }
      }
    } catch (error) {
      console.error(error);
      alert("Request failed.");
    }
  };

  // ✅ Delete
  const handleDelete = async () => {
    if (!policy || !window.confirm("Are you sure you want to delete this policy?")) return;
    try {
      const res = await axios.delete(
        `http://31.97.206.144:6098/api/admin/privacy-policy/${policy._id}`
      );
      if (res.data.success) {
        setPolicy(null);
        alert("Privacy policy deleted.");
      } else {
        alert(res.data.message || "Delete failed.");
      }
    } catch (error) {
      console.error(error);
      alert("Delete failed.");
    }
  };

  // ✅ Render
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-md rounded-lg">
      {!policy ? (
        <div>
          <p>No privacy policy available.</p>
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
            onClick={handleCreate}
          >
            Create One
          </button>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-semibold">{policy.title}</h2>
            <div className="space-x-2">
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-4">Effective Date: {policy.date}</p>
          <div className="whitespace-pre-line text-gray-800 leading-relaxed">
            {policy.content}
          </div>
        </>
      )}

      {/* ✅ Modal for Create / Edit */}
      {editModal && (
        <div className="fixed inset-0 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
            <h3 className="text-xl font-semibold mb-4">
              {edited._id ? "Edit" : "Create"} Privacy Policy
            </h3>
            <label className="block mb-1">Title</label>
            <input
              className="w-full p-2 border rounded mb-3"
              value={edited.title}
              onChange={(e) => setEdited({ ...edited, title: e.target.value })}
            />
            <label className="block mb-1">Effective Date</label>
            <input
              type="date"
              className="w-full p-2 border rounded mb-3"
              value={edited.date}
              onChange={(e) => setEdited({ ...edited, date: e.target.value })}
            />
            <label className="block mb-1">Content</label>
            <textarea
              rows={8}
              className="w-full p-2 border rounded mb-4"
              value={edited.content}
              onChange={(e) => setEdited({ ...edited, content: e.target.value })}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setEditModal(false)}
                className="px-3 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-2 bg-green-600 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrivacyPolicyPage;
