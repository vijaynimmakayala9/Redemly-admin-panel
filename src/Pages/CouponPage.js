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

  // Number of coupons per page based on downloadLimit
  const couponsPerPage = downloadLimit;

  // Fetch coupons from API on mount
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await axios.get("http://31.97.206.144:6098/api/admin/getallcoupons");
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

  // Handle status update (call API)
  const handleStatusChange = async (id, newStatus) => {
    try {
      // Call PATCH API to update coupon status
      const res = await axios.put(
        `http://31.97.206.144:6098/api/admin/updatecouponstatus/${id}`,
        { status: newStatus }
      );
      if (res.data && res.data.coupon) {
        // Update local state with new status
        setCoupons((prev) =>
          prev.map((c) => (c._id === id ? { ...c, status: newStatus } : c))
        );
        setEditingId(null);
        alert("Status updated successfully.");
      } else {
        alert("Failed to update status.");
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Error updating coupon status.");
    }
  };

  // Handle delete coupon (call API)
  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this coupon?");
    if (!confirmed) return;

    try {
      await axios.delete(`http://31.97.206.144:6098/api/admin/deletecoupon/${id}`);
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
      .map(({ _id, name, discountPercentage, validityDate, couponCode, category, status, vendorId }) => ({
        ID: _id,
        Name: name,
        Category: category,
        Discount: discountPercentage,
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
              setCurrentPage(1); // Reset page on filter change
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
              setCurrentPage(1); // Reset page on filter change
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
              setCurrentPage(1); // Reset page on limit change
            }}
            className="p-2 border rounded text-gray-700"
          >
            <option value={10}>10</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
          </select>
          <button
            className="bg-gray-200 px-4 py-2 rounded text-sm"
            onClick={() => exportData("csv")}
          >
            Export CSV
          </button>
          <button
            className="bg-gray-200 px-4 py-2 rounded text-sm"
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
              <th className="p-2 border">Discount (%)</th>
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
                <tr key={coupon._id} className="text-center border-b">
                  <td className="p-2 border">{coupon._id.slice(-6)}</td>
                  <td className="p-2 border">{coupon.name}</td>
                  <td className="p-2 border">{coupon.category}</td>
                  <td className="p-2 border">{coupon.discountPercentage}</td>
                  <td className="p-2 border">{new Date(coupon.validityDate).toLocaleDateString()}</td>
                  <td className="p-2 border font-mono">{coupon.couponCode}</td>
                  <td className="p-2 border">
                    <div className="flex flex-col items-center">
                      <img
                        src={coupon.vendorId?.businessLogo}
                        alt={coupon.vendorId?.businessName}
                        className="w-8 h-8 rounded-full mb-1 object-cover"
                      />
                      <div className="text-xs font-semibold">{coupon.vendorId?.businessName}</div>
                    </div>
                  </td>
                  <td className="p-2 border">
                    {editingId === coupon._id ? (
                      <select
                        value={coupon.status}
                        onChange={(e) => handleStatusChange(coupon._id, e.target.value)}
                        className="border p-1 rounded"
                      >
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="pending">Pending</option>
                      </select>
                    ) : (
                      <span
                        className={`px-2 py-1 rounded-full text-sm ${
                          coupon.status === "approved"
                            ? "bg-green-200 text-green-800"
                            : coupon.status === "rejected"
                            ? "bg-red-200 text-red-800"
                            : "bg-yellow-200 text-yellow-800"
                        }`}
                      >
                        {coupon.status}
                      </span>
                    )}
                  </td>
                  <td className="p-2 border flex justify-center gap-3">
                    <button onClick={() => setEditingId(coupon._id)} className="text-blue-600">
                      <FaEdit />
                    </button>
                    <button onClick={() => handleDelete(coupon._id)} className="text-red-600">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="p-4 text-center text-gray-500">
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
          className="bg-gray-200 px-4 py-2 rounded disabled:opacity-50"
        >
          Previous
        </button>
        {[...Array(totalPages)].map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentPage(idx + 1)}
            className={`px-4 py-2 rounded ${
              currentPage === idx + 1 ? "bg-blue-500 text-white" : "bg-gray-100"
            }`}
          >
            {idx + 1}
          </button>
        ))}
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="bg-gray-200 px-4 py-2 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default CouponsTable;