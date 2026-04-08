import { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaImage, FaUpload, FaTimes, FaCamera, FaTag, FaCoins, FaUsers, FaCalendarAlt } from "react-icons/fa";
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
  
  // Expanded edit form with all editable fields
  const [editForm, setEditForm] = useState({
    name: "",
    category: "",
    discountPercentage: "",
    couponCodeType: "%",
    requiredCoins: "",
    limitForSameUser: "",
    maxUsage: "",
    validityDate: "",
    status: ""
  });
  const [editLoading, setEditLoading] = useState(false);
  
  // Categories state
  const [categories, setCategories] = useState([]);

  // Image Upload States
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageCoupon, setImageCoupon] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);

  // Number of coupons per page based on downloadLimit
  const couponsPerPage = downloadLimit;

  // Fetch coupons and categories on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch coupons
        const couponsRes = await axios.get("https://api.redemly.com/api/admin/getallcoupons");
        if (couponsRes.data && couponsRes.data.coupons) {
          setCoupons(couponsRes.data.coupons);
        }
        
        // Fetch categories
        const categoriesRes = await axios.get("https://api.redemly.com/api/admin/categories");
        if (categoriesRes.data && categoriesRes.data.categories) {
          setCategories(categoriesRes.data.categories);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        alert("Failed to fetch data from server.");
      }
    };
    fetchData();
  }, []);

  // Open edit modal with coupon data (for full details update)
  const openEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setEditForm({
      name: coupon.name || "",
      category: coupon.category || "",
      discountPercentage: coupon.discountPercentage || "",
      couponCodeType: coupon.couponCodeType || "%",
      requiredCoins: coupon.requiredCoins || "",
      limitForSameUser: coupon.limitForSameUser || "",
      maxUsage: coupon.maxUsage || "",
      validityDate: coupon.validityDate ? new Date(coupon.validityDate).toISOString().split("T")[0] : "",
      status: coupon.status || "pending"
    });
    setIsEditModalOpen(true);
  };

  // Open image upload modal
  const openImageModal = (coupon) => {
    setImageCoupon(coupon);
    setSelectedImage(null);
    setImagePreview(coupon.couponImage || null);
    setIsImageModalOpen(true);
  };

  // Handle edit form changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert("Please select a valid image file (JPG, PNG, GIF, WebP)");
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }
      setSelectedImage(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // Handle image upload API call
  const handleImageUpload = async () => {
    if (!imageCoupon?._id || !selectedImage) return;

    setImageUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append('couponImage', selectedImage);

      const res = await axios.put(
        `https://api.redemly.com/api/vendor/update-coupon-image/${imageCoupon._id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (res.data.success || res.data.message || res.data.coupon) {
        // Update local state with new image URL
        const newImageUrl = res.data.coupon?.couponImage || res.data.imageUrl;
        
        setCoupons((prev) =>
          prev.map((c) =>
            c._id === imageCoupon._id
              ? { ...c, couponImage: newImageUrl }
              : c
          )
        );
        
        // Update imageCoupon state as well
        setImageCoupon(prev => prev ? { ...prev, couponImage: newImageUrl } : null);
        
        setSelectedImage(null);
        // Reset file input
        const fileInput = document.getElementById('coupon-image-input');
        if (fileInput) fileInput.value = '';
        alert("Coupon image updated successfully! ✅");
        setIsImageModalOpen(false);
      } else {
        alert("Failed to update coupon image.");
      }
    } catch (error) {
      console.error("Failed to upload coupon image:", error);
      alert(error.response?.data?.message || "Error uploading image.");
    } finally {
      setImageUploadLoading(false);
    }
  };

  // Handle update coupon API call (full details update)
  const handleUpdateCoupon = async () => {
    if (!editingCoupon?._id) return;

    // Basic validation
    if (!editForm.name || !editForm.discountPercentage || !editForm.validityDate) {
      alert("Name, discount percentage and validity date are required");
      return;
    }

    setEditLoading(true);
    try {
      const res = await axios.put(
        `https://api.redemly.com/api/vendor/update-coupon/${editingCoupon._id}`,
        {
          name: editForm.name,
          category: editForm.category,
          discountPercentage: Number(editForm.discountPercentage),
          couponCodeType: editForm.couponCodeType,
          requiredCoins: Number(editForm.requiredCoins),
          limitForSameUser: Number(editForm.limitForSameUser),
          maxUsage: Number(editForm.maxUsage),
          validityDate: editForm.validityDate,
          status: editForm.status
        }
      );

      if (res.data && res.data.coupon) {
        // Update local state with new data
        setCoupons((prev) =>
          prev.map((c) => 
            c._id === editingCoupon._id 
              ? { 
                  ...c, 
                  name: editForm.name,
                  category: editForm.category,
                  discountPercentage: Number(editForm.discountPercentage),
                  couponCodeType: editForm.couponCodeType,
                  requiredCoins: Number(editForm.requiredCoins),
                  limitForSameUser: Number(editForm.limitForSameUser),
                  maxUsage: Number(editForm.maxUsage),
                  validityDate: editForm.validityDate,
                  status: editForm.status
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

  const filterCategories = ["All", "Food", "Restaurant", "Meat Shop", "Groceries"];
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
            {filterCategories.map((cat) => (
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
              <th className="p-2 border">Actions</th>
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
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => openEditModal(coupon)} 
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition"
                        title="Edit Coupon Details"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        onClick={() => openImageModal(coupon)} 
                        className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded transition"
                        title="Update Image"
                      >
                        <FaImage />
                      </button>
                      <button 
                        onClick={() => handleDelete(coupon._id)} 
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition"
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

      {/* Edit Modal (Full Coupon Details Update) */}
      {isEditModalOpen && editingCoupon && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-800">Edit Coupon</h2>
              <p className="text-sm text-gray-500 mt-1">
                Update details for: <span className="font-semibold">{editingCoupon.name}</span>
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Coupon Code (Read-only) */}
              <div className="p-3 bg-gray-50 rounded border border-gray-200">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Coupon Code:</span>{" "}
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded">{editingCoupon.couponCode}</span>
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Coupon Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Enter coupon name"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={editForm.category}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat.categoryName}>
                        {cat.categoryName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Discount Percentage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <FaTag className="text-blue-500" /> Discount Percentage *
                  </label>
                  <input
                    type="number"
                    name="discountPercentage"
                    value={editForm.discountPercentage}
                    onChange={handleEditChange}
                    min="1"
                    max="100"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Enter discount %"
                  />
                </div>

                {/* Coupon Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Coupon Type
                  </label>
                  <select
                    name="couponCodeType"
                    value={editForm.couponCodeType}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="%">Percentage (%)</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>

                {/* Required Coins */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <FaCoins className="text-purple-500" /> Required Coins *
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
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <FaUsers className="text-green-500" /> Limit Per User *
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
                    Max Usage *
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

                {/* Validity Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <FaCalendarAlt className="text-yellow-500" /> Validity Date *
                  </label>
                  <input
                    type="date"
                    name="validityDate"
                    value={editForm.validityDate}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                {/* Status */}
                <div className="md:col-span-2">
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
              </div>

              {/* Current Info Summary */}
              <div className="p-3 bg-blue-50 rounded border border-blue-200">
                <p className="text-sm text-blue-700">
                  <span className="font-semibold">Current Values:</span>{" "}
                  {editingCoupon.discountPercentage}% off • Category: {editingCoupon.category} • 
                  Status: {editingCoupon.status} • Valid till: {new Date(editingCoupon.validityDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0 bg-white">
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

      {/* Image Upload Modal */}
      {isImageModalOpen && imageCoupon && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Update Coupon Image</h2>
                <p className="text-sm text-gray-500 mt-1">
                  For: <span className="font-semibold">{imageCoupon.name}</span>
                </p>
              </div>
              <button
                onClick={() => {
                  setIsImageModalOpen(false);
                  setImageCoupon(null);
                  setSelectedImage(null);
                  setImagePreview(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Image Preview & Upload */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <FaImage /> Coupon Image
                </label>
                <div className="flex flex-col gap-4">
                  {/* Image Preview */}
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Coupon preview"
                          className="w-24 h-24 rounded-lg object-cover border-2 border-blue-200"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-lg bg-gray-200 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                          <FaCamera className="text-2xl" />
                        </div>
                      )}
                      {imagePreview && (
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setSelectedImage(null);
                            const fileInput = document.getElementById('coupon-image-input');
                            if (fileInput) fileInput.value = '';
                          }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition shadow"
                          title="Remove image"
                        >
                          <FaTimes className="text-xs" />
                        </button>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        id="coupon-image-input"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="coupon-image-input"
                        className="inline-flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-600 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition"
                      >
                        <FaUpload />
                        {selectedImage ? selectedImage.name : "Choose Image"}
                      </label>
                      <p className="text-xs text-gray-400 mt-1">
                        Max 5MB • JPG, PNG, GIF, WebP
                      </p>
                    </div>
                  </div>
                  
                  {/* Upload Button */}
                  {selectedImage && (
                    <button
                      onClick={handleImageUpload}
                      disabled={imageUploadLoading}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaUpload />
                      {imageUploadLoading ? "Uploading..." : "Upload Image"}
                    </button>
                  )}
                </div>
              </div>

              {/* Current Image Info */}
              {imageCoupon.couponImage && !selectedImage && (
                <div className="p-3 bg-blue-50 rounded border border-blue-200">
                  <p className="text-sm text-blue-700">
                    <span className="font-semibold">Current Image:</span> Set • 
                    Click "Choose Image" to replace
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsImageModalOpen(false);
                  setImageCoupon(null);
                  setSelectedImage(null);
                  setImagePreview(null);
                }}
                className="px-5 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponsTable;