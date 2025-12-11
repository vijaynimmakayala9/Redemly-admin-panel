import { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { utils, writeFile } from "xlsx";
import { useNavigate } from "react-router-dom";

export default function VendorList() {
  const [vendors, setVendors] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [downloadLimit, setDownloadLimit] = useState(50);
  const vendorsPerPage = 5;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editModal, setEditModal] = useState(false);
  const [editedVendor, setEditedVendor] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch vendors - reusable function
  const fetchVendors = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("http://31.97.206.144:6098/api/admin/getvendors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed to fetch vendors: ${res.status}`);
      const data = await res.json();
      setVendors(data.vendors || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  // Filter vendors by search term
  const filteredVendors = vendors.filter((vendor) =>
    vendor.name.toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLastVendor = currentPage * vendorsPerPage;
  const indexOfFirstVendor = indexOfLastVendor - vendorsPerPage;
  const currentVendors = filteredVendors.slice(
    indexOfFirstVendor,
    indexOfLastVendor
  );
  const totalPages = Math.ceil(filteredVendors.length / vendorsPerPage);

  // Export CSV or Excel
  const exportData = (type) => {
    const exportVendors = filteredVendors
      .slice(0, downloadLimit)
      .map(
        ({
          _id,
          name,
          email,
          phone,
          businessName,
          city,
          zipcode,
          businessLogo,
        }) => ({
          id: _id,
          name,
          email,
          phone,
          businessName,
          city,
          zipcode,
          businessLogo,
        })
      );
    const ws = utils.json_to_sheet(exportVendors);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Vendors");
    writeFile(wb, `vendors.${type}`);
  };

  // Navigate to vendor details page
  const viewVendor = (vendor) => {
    navigate(`/vendor/${vendor._id}`, { state: { vendor } });
  };

  // Edit modal input change handler
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedVendor((prev) => ({ ...prev, [name]: value }));
  };

  // Save updated vendor info (PUT API)
  const handleSave = async () => {
    if (!editedVendor?._id) return;
    setActionLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(
        `http://31.97.206.144:6098/api/admin/updatevendor/${editedVendor._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editedVendor),
        }
      );
      if (!res.ok) throw new Error(`Failed to update vendor: ${res.status}`);
      await fetchVendors();
      setEditModal(false);
      setEditedVendor(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Delete vendor by ID (DELETE API)
  const handleDelete = async (vendorId) => {
    if (!window.confirm("Are you sure you want to delete this vendor?")) return;
    setActionLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(
        `http://31.97.206.144:6098/api/admin/deletevendor/${vendorId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error(`Failed to delete vendor: ${res.status}`);
      await fetchVendors();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading)
    return (
      <div className="p-4 text-center text-blue-600">Loading vendors...</div>
    );
  if (error)
    return (
      <div className="p-4 text-center text-red-600">Error: {error}</div>
    );

  return (
    <div className="p-4 border rounded-lg shadow-lg bg-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-blue-900">All Vendors</h2>
      </div>

      <div className="flex justify-between mb-4 gap-2 flex-wrap">
        <input
          className="w-full md:w-1/3 p-2 border rounded"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2 flex-wrap">
          <select
            value={downloadLimit}
            onChange={(e) => setDownloadLimit(Number(e.target.value))}
            className="p-2 border rounded"
          >
            <option value={10}>10</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
          </select>
          <button
            className="bg-gray-200 px-4 py-2 rounded"
            onClick={() => exportData("csv")}
          >
            Export CSV
          </button>
          <button
            className="bg-gray-200 px-4 py-2 rounded"
            onClick={() => exportData("xlsx")}
          >
            Export Excel
          </button>
        </div>
      </div>

      <div className="overflow-x-auto mb-4">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="p-2 border">Sl</th>
              <th className="p-2 border">Logo</th>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Phone</th>
              <th className="p-2 border">Business Name</th>
              <th className="p-2 border">City</th>
              <th className="p-2 border">Zipcode</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentVendors.map((vendor, index) => (
              <tr key={vendor._id}>
                <td className="p-2 border">
                  {index + 1 + indexOfFirstVendor}
                </td>
                <td className="p-2 border">
                  {vendor.businessLogo ? (
                    <img
                      src={vendor.businessLogo}
                      alt={`${vendor.businessName} Logo`}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    "N/A"
                  )}
                </td>
                <td className="p-2 border">{vendor.name}</td>
                <td className="p-2 border">{vendor.email}</td>
                <td className="p-2 border">{vendor.phone}</td>
                <td className="p-2 border">{vendor.businessName}</td>
                <td className="p-2 border">{vendor.city}</td>
                <td className="p-2 border">{vendor.zipcode}</td>
                <td className="p-2 border flex gap-2">
                  <button
                    className="bg-green-500 text-white p-1 rounded"
                    onClick={() => viewVendor(vendor)}
                    title="View Vendor"
                  >
                    <FaEye />
                  </button>

                  <button
                    className="bg-blue-500 text-white p-1 rounded"
                    title="Edit Vendor"
                    onClick={() => {
                      setEditedVendor(vendor);
                      setEditModal(true);
                    }}
                    disabled={actionLoading}
                  >
                    <FaEdit />
                  </button>

                  <button
                    className="bg-red-500 text-white p-1 rounded"
                    title="Delete Vendor"
                    onClick={() => handleDelete(vendor._id)}
                    disabled={actionLoading}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
            {currentVendors.length === 0 && (
              <tr>
                <td colSpan={9} className="p-4 text-center text-gray-500">
                  No vendors found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-4 gap-4 flex-wrap">
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
              currentPage === index + 1
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
          >
            {index + 1}
          </button>
        ))}
        <button
          onClick={() =>
            setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev))
          }
          disabled={currentPage === totalPages}
          className="bg-gray-300 px-4 py-2 rounded"
        >
          Next
        </button>
      </div>

      {/* Edit Modal */}
      {editModal && editedVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">
              Edit Vendor - {editedVendor.name}
            </h3>
            <label className="block mb-1">Name</label>
            <input
              name="name"
              className="w-full p-2 border rounded mb-3"
              value={editedVendor.name || ""}
              onChange={handleEditChange}
            />
            <label className="block mb-1">Email</label>
            <input
              name="email"
              type="email"
              className="w-full p-2 border rounded mb-3"
              value={editedVendor.email || ""}
              onChange={handleEditChange}
            />
            <label className="block mb-1">Phone</label>
            <input
              name="phone"
              className="w-full p-2 border rounded mb-3"
              value={editedVendor.phone || ""}
              onChange={handleEditChange}
            />
            <label className="block mb-1">Business Name</label>
            <input
              name="businessName"
              className="w-full p-2 border rounded mb-3"
              value={editedVendor.businessName || ""}
              onChange={handleEditChange}
            />
            <label className="block mb-1">City</label>
            <input
              name="city"
              className="w-full p-2 border rounded mb-3"
              value={editedVendor.city || ""}
              onChange={handleEditChange}
            />
            <label className="block mb-1">Zipcode</label>
            <input
              name="zipcode"
              className="w-full p-2 border rounded mb-4"
              value={editedVendor.zipcode || ""}
              onChange={handleEditChange}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setEditModal(false);
                  setEditedVendor(null);
                }}
                className="px-3 py-2 bg-gray-300 rounded"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-2 bg-green-600 text-white rounded"
                disabled={actionLoading}
              >
                {actionLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
