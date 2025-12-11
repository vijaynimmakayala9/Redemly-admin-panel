import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { Link } from "react-router-dom";
import { utils, writeFile } from "xlsx";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [downloadLimit, setDownloadLimit] = useState(50);
  const [error, setError] = useState("");
  const [editModal, setEditModal] = useState(false);
  const [editedUser, setEditedUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("http://31.97.206.144:6098/api/admin/getallusers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setUsers(data.users);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  // Open Edit modal with user data
  const openEditModal = (user) => {
    setEditedUser({ ...user }); // shallow copy to edit
    setEditModal(true);
  };

  // Handle input changes in edit modal
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({ ...prev, [name]: value }));
  };

  // Save updated user
  const handleSave = async () => {
    if (!editedUser || !editedUser.id) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(
        `http://31.97.206.144:6098/api/admin/updateusers/${editedUser.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: editedUser.name,
            email: editedUser.email,
            phone: editedUser.phone,
            city: editedUser.city,
            zipcode: editedUser.zipcode,
            dateOfBirth: editedUser.dateOfBirth,
            coins: editedUser.coins,
            couponCode: editedUser.couponCode,
            favoriteCoupons: editedUser.favoriteCoupons,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");
      // Update local user list
      setUsers((prev) =>
        prev.map((u) => (u.id === editedUser.id ? data.updatedUser || editedUser : u))
      );
      setEditModal(false);
      setEditedUser(null);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`http://31.97.206.144:6098/api/admin/deleteusers/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Delete failed");

      // Remove deleted user from state
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter users by name search
  const filtered = users.filter((u) =>
    (u.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLast = currentPage * usersPerPage;
  const indexOfFirst = indexOfLast - usersPerPage;
  const currentUsers = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / usersPerPage);

  const exportData = (type) => {
    const exportUsers = filtered.slice(0, downloadLimit).map((u) => ({
      id: u.id,
      name: u.name || "",
      email: u.email || "",
      phone: u.phone || "",
      city: u.city || "",
      zipcode: u.zipcode || "",
      dateOfBirth: u.dateOfBirth || "",
      coins: u.coins ?? "",
      couponCode: u.couponCode || "",
      favoriteCoupons: (u.favoriteCoupons || []).join(";"),
      steps: JSON.stringify(u.steps),
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));
    const ws = utils.json_to_sheet(exportUsers);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Users");
    writeFile(wb, `users_export.${type}`);
  };

  return (
    <div className="p-4 bg-white shadow rounded relative">
      <h2 className="text-xl font-semibold mb-4">All Users</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="flex justify-between mb-4 gap-2">
        <input
          className="w-1/3 p-2 border rounded"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
        <div className="flex gap-2">
          <select
            value={downloadLimit}
            onChange={(e) => setDownloadLimit(Number(e.target.value))}
            className="p-2 border rounded"
          >
            {[10, 50, 100, 200].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
          <button
            onClick={() => exportData("csv")}
            className="bg-gray-200 px-4 py-2 rounded"
          >
            Export CSV
          </button>
        </div>
      </div>

      <table className="w-full table-auto border-collapse border border-gray-300 mb-4">
        <thead>
          <tr className="bg-blue-600 text-white">
            <th className="p-2 border">Sl</th>
            <th className="p-2 border">Profile</th>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Phone</th>
            <th className="p-2 border">City</th>
            <th className="p-2 border">DOB</th>
            <th className="p-2 border">Coins</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.map((u, idx) => (
            <tr key={u.id}>
              <td className="p-2 border">{indexOfFirst + idx + 1}</td>
              <td className="p-2 border">
                <img
                  src={u.profileImage || "/default-profile-image.jpg"}
                  alt="profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
              </td>
              <td className="p-2 border">{u.name}</td>
              <td className="p-2 border">{u.email}</td>
              <td className="p-2 border">{u.phone}</td>
              <td className="p-2 border">{u.city}</td>
              <td className="p-2 border">
                {u.dateOfBirth ? u.dateOfBirth.split("T")[0] : ""}
              </td>
              <td className="p-2 border">{u.coins}</td>
              <td className="p-2 border flex gap-2">
                <Link to={`/users/${u.id}`}>
                  <button
                    className="bg-green-500 text-white p-1 rounded"
                    title="View"
                    onClick={() => console.log("Viewing user with ID:", u.id)}
                  >
                    <FaEye />
                  </button>
                </Link>
                <button
                  className="bg-blue-500 text-white p-1 rounded"
                  title="Edit"
                  onClick={() => openEditModal(u)}
                >
                  <FaEdit />
                </button>
                <button
                  className="bg-red-500 text-white p-1 rounded"
                  title="Delete"
                  onClick={() => handleDelete(u.id)}
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-center gap-2 mb-4">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="bg-gray-300 px-4 py-2 rounded"
        >
          Previous
        </button>
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-4 py-2 rounded ${
              currentPage === i + 1 ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="bg-gray-300 px-4 py-2 rounded"
        >
          Next
        </button>
      </div>

     {/* Edit Modal */}
{editModal && editedUser && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl relative max-h-[90vh] overflow-y-auto">
      <h3 className="text-xl font-semibold mb-6">
        Edit User - {editedUser.name}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block mb-1 font-medium">Name</label>
          <input
            name="name"
            className="w-full p-2 border rounded"
            value={editedUser.name || ""}
            onChange={handleEditChange}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input
            name="email"
            type="email"
            className="w-full p-2 border rounded"
            value={editedUser.email || ""}
            onChange={handleEditChange}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Phone</label>
          <input
            name="phone"
            className="w-full p-2 border rounded"
            value={editedUser.phone || ""}
            onChange={handleEditChange}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">City</label>
          <input
            name="city"
            className="w-full p-2 border rounded"
            value={editedUser.city || ""}
            onChange={handleEditChange}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Zipcode</label>
          <input
            name="zipcode"
            className="w-full p-2 border rounded"
            value={editedUser.zipcode || ""}
            onChange={handleEditChange}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Date of Birth</label>
          <input
            name="dateOfBirth"
            type="date"
            className="w-full p-2 border rounded"
            value={
              editedUser.dateOfBirth
                ? editedUser.dateOfBirth.split("T")[0]
                : ""
            }
            onChange={handleEditChange}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Coins</label>
          <input
            name="coins"
            type="number"
            className="w-full p-2 border rounded"
            value={editedUser.coins || 0}
            onChange={handleEditChange}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Coupon Code</label>
          <input
            name="couponCode"
            className="w-full p-2 border rounded"
            value={editedUser.couponCode || ""}
            onChange={handleEditChange}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">
            Favorite Coupons (semicolon separated)
          </label>
          <input
            name="favoriteCoupons"
            className="w-full p-2 border rounded"
            value={(editedUser.favoriteCoupons || []).join
              ? (editedUser.favoriteCoupons || []).join(";")
              : editedUser.favoriteCoupons || ""}
            onChange={(e) =>
              setEditedUser((prev) => ({
                ...prev,
                favoriteCoupons: e.target.value
                  .split(";")
                  .map((c) => c.trim()),
              }))
            }
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 mt-6">
        <button
          onClick={() => {
            setEditModal(false);
            setEditedUser(null);
          }}
          className="px-4 py-2 bg-gray-300 rounded"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-green-600 text-white rounded"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}
