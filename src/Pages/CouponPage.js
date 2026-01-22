import { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { utils, writeFile } from "xlsx";
import axios from "axios";

const CouponsTable = () => {
  const [coupons, setCoupons] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [editingId, setEditingId] = useState(null);
  const [downloadLimit, setDownloadLimit] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [editForm, setEditForm] = useState({
    status: "",
    requiredCoins: "",
    limitForSameUser: "",
    maxUsage: ""
  });
  const [editLoading, setEditLoading] = useState(false);

  // Number of coupons per page based on downloadLimit
  const couponsPerPage = downloadLimit;

  // Fetch coupons from API on mount
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await axios.get("https://api.redemly.com/api/admin/getallcoupons");
        if (res.data && res.data.coupons) {
          setCoupons(res.data.coupons);
        }
      } catch (error) {
        console.error("Failed to fetch coupons:", error);
        alert("Failed to fetch coupons from server.");
      }
    };
    fetchCoupons();
  }, []);

  // Open edit modal with coupon data
  const openEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setEditForm({
      status: coupon.status || "pending",
      requiredCoins: coupon.requiredCoins || "",
      limitForSameUser: coupon.limitForSameUser || "",
      maxUsage: coupon.maxUsage || ""
    });
    setIsEditModalOpen(true);
  };

  // Handle edit form changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle update coupon API call
  const handleUpdateCoupon = async () => {
    if (!editingCoupon?._id) return;

    // Basic validation
    if (!editForm.requiredCoins || !editForm.limitForSameUser || !editForm.maxUsage) {
      alert("Please fill all required fields");
      return;
    }

    setEditLoading(true);
    try {
      const res = await axios.put(
        `https://api.redemly.com/api/admin/updatecouponstatus/${editingCoupon._id}`,
        {
          status: editForm.status,
          requiredCoins: Number(editForm.requiredCoins),
          limitForSameUser: Number(editForm.limitForSameUser),
          maxUsage: Number(editForm.maxUsage)
        }
      );

      if (res.data && res.data.coupon) {
        // Update local state with new data
        setCoupons((prev) =>
          prev.map((c) => 
            c._id === editingCoupon._id 
              ? { 
                  ...c, 
                  status: editForm.status,
                  requiredCoins: Number(editForm.requiredCoins),
                  limitForSameUser: Number(editForm.limitForSameUser),
                  maxUsage: Number(editForm.maxUsage)
                } 
              : c
          )
        );
        setIsEditModalOpen(false);
        setEditingCoupon(null);
        alert("Coupon updated successfully!");
      } else {
        alert("Failed to update coupon.");
      }
    } catch (error) {
      console.error("Failed to update coupon:", error);
      alert(error.response?.data?.message || "Error updating coupon.");
    } finally {
      setEditLoading(false);
    }
  };

  // Handle delete coupon (call API)
  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this coupon?");
    if (!confirmed) return;

    try {
      await axios.delete(`https://api.redemly.com/api/admin/deletecoupon/${id}`);
      // Remove from local state on success
      setCoupons((prev) => prev.filter((c) => c._id !== id));
      alert("Coupon deleted successfully.");
    } catch (error) {
      console.error("Failed to delete coupon:", error);
      alert("Error deleting coupon.");
    }
  };

  // Filter coupons by category and status
  const filteredCoupons = coupons.filter((c) => {
    const categoryMatch = selectedCategory === "All" || c.category === selectedCategory;
    const statusMatch = selectedStatus === "All" || c.status === selectedStatus;
    return categoryMatch && statusMatch;
  });

  const totalPages = Math.ceil(filteredCoupons.length / couponsPerPage);

  const indexOfLastCoupon = currentPage * couponsPerPage;
  const indexOfFirstCoupon = indexOfLastCoupon - couponsPerPage;
  const currentCoupons = filteredCoupons.slice(indexOfFirstCoupon, indexOfLastCoupon);

  const categories = ["All", "Food", "Restaurant", "Meat Shop", "Groceries"];
  const statuses = ["All", "approved", "rejected", "pending"];

  const exportData = (type) => {
    const exportCoupons = filteredCoupons
      .slice(0, downloadLimit)
      .map(({ _id, name, discountPercentage, validityDate, couponCode, category, status, vendorId, requiredCoins, limitForSameUser, maxUsage }) => ({
        ID: _id,
        Name: name,
        Category: category,
        Discount: discountPercentage,
        RequiredCoins: requiredCoins,
        LimitPerUser: limitForSameUser,
        MaxUsage: maxUsage,
        ValidTill: new Date(validityDate).toLocaleDateString(),
        Code: couponCode,
        Status: status,
        VendorName: vendorId?.name || "",
        VendorBusinessName: vendorId?.businessName || "",
      }));

    const ws = utils.json_to_sheet(exportCoupons);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Coupons");
    writeFile(wb, `coupons.${type}`);
  };

  const statusBadge = (status) => {
    const colors = {
      approved: "bg-green-200 text-green-800",
      rejected: "bg-red-200 text-red-800",
      pending: "bg-yellow-200 text-yellow-800"
    };
    return (
      <span className={`px-2 py-1 rounded-full text-sm ${colors[status] || "bg-gray-200"}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="p-6 bg-white shadow rounded">
      <h1 className="text-2xl font-semibold text-center mb-6 text-gray-700">Coupons List</h1>

      {/* Filters and Export Controls */}
      <div className="mb-6 flex flex-wrap justify-between items-center gap-4">
        <div className="flex gap-4">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="border px-4 py-2 rounded bg-gray-100 text-gray-700"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="border px-4 py-2 rounded bg-gray-100 text-gray-700"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 items-center">
          <select
            value={downloadLimit}
            onChange={(e) => {
              setDownloadLimit(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="p-2 border rounded text-gray-700"
          >
            <option value={10}>10</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
          </select>
          <button
            className="bg-gray-200 px-4 py-2 rounded text-sm hover:bg-gray-300"
            onClick={() => exportData("csv")}
          >
            Export CSV
          </button>
          <button
            className="bg-gray-200 px-4 py-2 rounded text-sm hover:bg-gray-300"
            onClick={() => exportData("xlsx")}
          >
            Export Excel
          </button>
        </div>
      </div>

      {/* Coupon Table */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Category</th>
              <th className="p-2 border">Discount</th>
              <th className="p-2 border">Coins</th>
              <th className="p-2 border">Limit/User</th>
              <th className="p-2 border">Max Usage</th>
              <th className="p-2 border">Valid Till</th>
              <th className="p-2 border">Code</th>
              <th className="p-2 border">Vendor</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentCoupons.length > 0 ? (
              currentCoupons.map((coupon) => (
                <tr key={coupon._id} className="text-center border-b hover:bg-gray-50">
                  <td className="p-2 border">{coupon._id.slice(-6)}</td>
                  <td className="p-2 border">{coupon.name}</td>
                  <td className="p-2 border">{coupon.category}</td>
                  <td className="p-2 border font-bold">{coupon.discountPercentage}%</td>
                  <td className="p-2 border">{coupon.requiredCoins}</td>
                  <td className="p-2 border">{coupon.limitForSameUser}</td>
                  <td className="p-2 border">{coupon.maxUsage}</td>
                  <td className="p-2 border">{new Date(coupon.validityDate).toLocaleDateString()}</td>
                  <td className="p-2 border font-mono bg-gray-100">{coupon.couponCode}</td>
                  <td className="p-2 border">
                    <div className="flex flex-col items-center">
                      <img
                        src={coupon.vendorId?.businessLogo || ""}
                        alt={coupon.vendorId?.businessName}
                        className="w-8 h-8 rounded-full mb-1 object-cover border"
                        onError={(e) => {
                          e.target.src = "";
                        }}
                      />
                      <div className="text-xs font-semibold">{coupon.vendorId?.businessName}</div>
                    </div>
                  </td>
                  <td className="p-2 border">
                    {statusBadge(coupon.status)}
                  </td>
                  <td className="p-2 border">
                    <div className="flex justify-center gap-3">
                      <button 
                        onClick={() => openEditModal(coupon)} 
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit Coupon"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        onClick={() => handleDelete(coupon._id)} 
                        className="text-red-600 hover:text-red-800"
                        title="Delete Coupon"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="12" className="p-4 text-center text-gray-500">
                  No coupons found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-6 gap-2">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Previous
        </button>
        {[...Array(totalPages)].map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentPage(idx + 1)}
            className={`px-4 py-2 rounded ${
              currentPage === idx + 1 ? "bg-blue-500 text-white" : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {idx + 1}
          </button>
        ))}
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && editingCoupon && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Edit Coupon</h2>
              <p className="text-sm text-gray-500 mt-1">
                Update coupon details for: <span className="font-semibold">{editingCoupon.name}</span>
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={editForm.status}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Required Coins */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Required Coins
                </label>
                <input
                  type="number"
                  name="requiredCoins"
                  value={editForm.requiredCoins}
                  onChange={handleEditChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Enter required coins"
                />
              </div>

              {/* Limit Per User */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Limit Per User
                </label>
                <input
                  type="number"
                  name="limitForSameUser"
                  value={editForm.limitForSameUser}
                  onChange={handleEditChange}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Enter limit per user"
                />
              </div>

              {/* Max Usage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Usage
                </label>
                <input
                  type="number"
                  name="maxUsage"
                  value={editForm.maxUsage}
                  onChange={handleEditChange}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Enter max usage count"
                />
              </div>

              {/* Current Info */}
              <div className="p-3 bg-blue-50 rounded border border-blue-200">
                <p className="text-sm text-blue-700">
                  <span className="font-semibold">Current:</span> {editingCoupon.discountPercentage}% off • 
                  Category: {editingCoupon.category} • 
                  Code: {editingCoupon.couponCode}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingCoupon(null);
                }}
                className="px-5 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateCoupon}
                disabled={editLoading}
                className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {editLoading ? "Updating..." : "Update Coupon"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponsTable;