import { useState, useEffect } from "react";
import { FaPlus, FaCopy, FaUpload, FaSpinner, FaImage, FaCalendarAlt, FaTag, FaPercent, FaCoins, FaUserCheck, FaStore, FaLayerGroup } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// FIXED: Moved InputField outside main component to prevent remounts on keystrokes
const InputField = ({ icon: Icon, label, children, className = "" }) => (
  <div className={`flex flex-col ${className}`}>
    <label className="mb-2 text-sm font-semibold text-gray-700 flex items-center gap-2">
      <Icon className="w-4 h-4 text-purple-600" />
      {label}
    </label>
    {children}
  </div>
);

// FIXED: Moved StatCard outside main component to prevent remounts
const StatCard = ({ icon: Icon, label, value, color = "purple" }) => (
  <div className={`bg-gradient-to-br from-${color}-50 to-white p-4 rounded-xl border border-${color}-100 shadow-sm`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-full bg-${color}-100`}>
        <Icon className={`w-6 h-6 text-${color}-600`} />
      </div>
    </div>
  </div>
);

const CreateCoupon = () => {
  const [vendors, setVendors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [errorVendors, setErrorVendors] = useState(null);
  const [errorCategories, setErrorCategories] = useState(null);
  const [creationMode, setCreationMode] = useState("single");
  const [loading, setLoading] = useState(false);
  const [previewCoupons, setPreviewCoupons] = useState([]);

  const [formData, setFormData] = useState({
    vendorId: "",
    name: "",
    discountPercentage: "",
    requiredCoins: "",
    validityDate: "",
    category: "",
    couponCodeType: "%",
    limitForSameUser: "",
    maxUsage: ""
  });

  const [bulkFormData, setBulkFormData] = useState({
    count: "",
    namePrefix: "",
    nameSuffix: "COUPON",
  });

  // Fetch vendors and categories on mount
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await fetch("https://api.redemly.com/api/admin/getvendors  ");
        const data = await res.json();
        if (res.ok) {
          setVendors(data.vendors);
          if (data.vendors.length > 0) {
            setFormData((prev) => ({ ...prev, vendorId: data.vendors[0]._id }));
          }
        } else {
          setErrorVendors(data.message || "Failed to fetch vendors");
          toast.error(data.message || "Failed to fetch vendors");
        }
      } catch (error) {
        setErrorVendors(error.message);
        toast.error("Network error while fetching vendors");
      } finally {
        setLoadingVendors(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await fetch("https://api.redemly.com/api/admin/categories  ");
        const data = await res.json();
        if (res.ok && data.categories.length > 0) {
          setCategories(data.categories);
          setFormData((prev) => ({ ...prev, category: data.categories[0].categoryName }));
        } else {
          setErrorCategories("No categories found");
        }
      } catch (error) {
        setErrorCategories(error.message);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchVendors();
    fetchCategories();
  }, []);

  // Generate preview coupons for bulk creation
  useEffect(() => {
    if (creationMode === "bulk" && bulkFormData.count > 0 && bulkFormData.count <= 5) {
      const previews = [];
      for (let i = 1; i <= Math.min(bulkFormData.count, 5); i++) {
        previews.push(generateCouponName(i));
      }
      setPreviewCoupons(previews);
    } else {
      setPreviewCoupons([]);
    }
  }, [creationMode, bulkFormData.count, bulkFormData.namePrefix, bulkFormData.nameSuffix]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    
    // For numeric fields, allow empty string, then convert to number when needed
    if (["discountPercentage", "requiredCoins", "limitForSameUser", "maxUsage"].includes(name)) {
      // Allow empty string or valid numbers
      if (value === "" || /^\d*$/.test(value)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleBulkFormChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "count") {
      // Allow empty string or valid numbers
      if (value === "" || /^\d*$/.test(value)) {
        setBulkFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setBulkFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const generateCouponName = (index) => {
    const { namePrefix, nameSuffix } = bulkFormData;
    const paddedIndex = String(index).padStart(String(bulkFormData.count || 1).length, '0');

    if (namePrefix && nameSuffix) {
      return `${namePrefix}_${nameSuffix}_${paddedIndex}`;
    } else if (namePrefix) {
      return `${namePrefix}_${paddedIndex}`;
    } else if (nameSuffix) {
      return `${nameSuffix}_${paddedIndex}`;
    }
    return `COUPON_${paddedIndex}`;
  };

  const validateForm = () => {
    if (!formData.vendorId) {
      toast.error("Please select a vendor");
      return false;
    }

    if (!formData.validityDate) {
      toast.error("Please select a validity date");
      return false;
    }

    // Check if date is in future
    const selectedDate = new Date(formData.validityDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate <= today) {
      toast.error("Validity date must be in the future");
      return false;
    }

    // Convert string values to numbers for validation
    const discountPercentage = Number(formData.discountPercentage);
    const requiredCoins = Number(formData.requiredCoins);
    const limitForSameUser = Number(formData.limitForSameUser);
    const maxUsage = Number(formData.maxUsage);
    const bulkCount = Number(bulkFormData.count);

    if (requiredCoins < 0 || isNaN(requiredCoins)) {
      toast.error("Required coins must be a valid number");
      return false;
    }

    if (formData.couponCodeType === "%" && (discountPercentage < 1 || discountPercentage > 100 || isNaN(discountPercentage))) {
      toast.error("Discount percentage must be between 1 and 100");
      return false;
    }

    if (discountPercentage <= 0 || isNaN(discountPercentage)) {
      toast.error("Discount amount must be greater than 0");
      return false;
    }

    if (limitForSameUser < 1 || isNaN(limitForSameUser)) {
      toast.error("Limit per user must be at least 1");
      return false;
    }

    if (maxUsage < 1 || isNaN(maxUsage)) {
      toast.error("Max usage must be at least 1");
      return false;
    }

    if (creationMode === "single" && !formData.name.trim()) {
      toast.error("Please enter a coupon name");
      return false;
    }

    if (creationMode === "bulk" && (bulkCount < 1 || bulkCount > 1000 || isNaN(bulkCount))) {
      toast.error("Please enter a count between 1 and 1000");
      return false;
    }

    return true;
  };

  const handleAddCoupon = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        vendorId: formData.vendorId,
        name: formData.name,
        category: formData.category,
        discountPercentage: Number(formData.discountPercentage),
        requiredCoins: Number(formData.requiredCoins),
        validityDate: formData.validityDate,
        couponCodeType: formData.couponCodeType,
        limitForSameUser: Number(formData.limitForSameUser),
        maxUsage: Number(formData.maxUsage)
      };

      const res = await fetch('https://api.redemly.com/api/admin/createcouponbyadmin  ', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("🎉 Coupon created successfully!");

        // Show coupon details in console for debugging
        console.log("Created coupon:", data.coupon);

        // Reset form but keep vendor and category
        setFormData(prev => ({
          ...prev,
          name: "",
          discountPercentage: "",
          requiredCoins: "",
          validityDate: "",
          limitForSameUser: "",
          maxUsage: ""
        }));
      } else {
        toast.error("Error creating coupon: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      toast.error("Server error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkCreate = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        vendorId: formData.vendorId,
        count: Number(bulkFormData.count),
        namePrefix: bulkFormData.namePrefix,
        nameSuffix: bulkFormData.nameSuffix,
        category: formData.category,
        discountPercentage: Number(formData.discountPercentage),
        requiredCoins: Number(formData.requiredCoins),
        validityDate: formData.validityDate,
        couponCodeType: formData.couponCodeType,
        limitForSameUser: Number(formData.limitForSameUser),
        maxUsage: Number(formData.maxUsage)
      };

      const res = await fetch('https://api.redemly.com/api/admin/bulk-create-coupons  ', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`✅ Successfully created ${data.created} coupons! ${data.failed > 0 ? `${data.failed} failed.` : ''}`);

        // Log first coupon for reference
        if (data.coupons && data.coupons.length > 0) {
          console.log("Sample coupon created:", data.coupons[0]);
        }

        // Reset form but keep vendor and category
        setFormData(prev => ({
          ...prev,
          discountPercentage: "",
          requiredCoins: "",
          validityDate: "",
          limitForSameUser: "",
          maxUsage: ""
        }));

        setBulkFormData({
          count: "",
          namePrefix: "",
          nameSuffix: "COUPON",
        });
      } else {
        toast.error("Error creating coupons: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      toast.error("Server error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Set minimum date to tomorrow
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Create Coupons</h1>
            <p className="text-gray-600 mt-2">Create single or bulk coupons for vendors</p>
          </div>
          <div className="flex items-center gap-4">
            <StatCard
              icon={FaStore}
              label="Total Vendors"
              value={vendors.length}
              color="blue"
            />
            <StatCard
              icon={FaLayerGroup}
              label="Categories"
              value={categories.length}
              color="green"
            />
          </div>
        </div>

        {/* Mode selector with premium design */}
        <div className="mt-8 flex justify-center">
          <div className="bg-white p-2 rounded-2xl shadow-lg border border-gray-200">
            <div className="flex gap-1">
              <button
                type="button"
                className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${creationMode === "single"
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
                    : "text-gray-700 hover:bg-gray-50"
                  }`}
                onClick={() => setCreationMode("single")}
              >
                <FaPlus className="w-4 h-4" />
                Single Coupon
              </button>
              <button
                type="button"
                className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${creationMode === "bulk"
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
                    : "text-gray-700 hover:bg-gray-50"
                  }`}
                onClick={() => setCreationMode("bulk")}
              >
                <FaCopy className="w-4 h-4" />
                Bulk Create
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-purple-700 to-indigo-700 p-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              {creationMode === "single" ? (
                <>
                  <div className="p-2 bg-white/20 rounded-lg">
                    <FaPlus className="w-5 h-5" />
                  </div>
                  Create Single Coupon
                </>
              ) : (
                <>
                  <div className="p-2 bg-white/20 rounded-lg">
                    <FaCopy className="w-5 h-5" />
                  </div>
                  Bulk Create Coupons
                </>
              )}
            </h2>
            <p className="text-purple-100 mt-2">
              {creationMode === "single"
                ? "Create a single coupon with custom details"
                : "Create multiple coupons with sequential naming"}
            </p>
          </div>

          <form
            onSubmit={creationMode === "single" ? handleAddCoupon : handleBulkCreate}
            className="p-6 md:p-8"
          >
            {/* Vendor Selection */}
            <div className="mb-8">
              <InputField icon={FaStore} label="Select Vendor">
                {loadingVendors ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <FaSpinner className="w-4 h-4 animate-spin" />
                    Loading vendors...
                  </div>
                ) : errorVendors ? (
                  <p className="text-red-600">{errorVendors}</p>
                ) : (
                  <select
                    name="vendorId"
                    value={formData.vendorId}
                    onChange={handleFormChange}
                    required
                    className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 bg-white shadow-sm w-full"
                  >
                    {vendors.map((vendor) => (
                      <option key={vendor._id} value={vendor._id}>
                        {vendor.businessName} ({vendor.name})
                      </option>
                    ))}
                  </select>
                )}
              </InputField>
            </div>

            {/* Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Coupon Name / Bulk Fields */}
              {creationMode === "single" ? (
                <InputField icon={FaTag} label="Coupon Name">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                    placeholder="e.g. Summer Feast 2024"
                    className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 bg-white shadow-sm"
                  />
                </InputField>
              ) : (
                <>
                  <InputField icon={FaCopy} label="Number of Coupons">
                    <input
                      type="text"
                      name="count"
                      value={bulkFormData.count}
                      onChange={handleBulkFormChange}
                      required
                      placeholder="e.g. 100"
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 bg-white shadow-sm"
                    />
                  </InputField>
                  <InputField icon={FaTag} label="Name Prefix (Optional)">
                    <input
                      type="text"
                      name="namePrefix"
                      value={bulkFormData.namePrefix}
                      onChange={handleBulkFormChange}
                      placeholder="e.g. SUMMER"
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 bg-white shadow-sm"
                    />
                  </InputField>
                  <InputField icon={FaTag} label="Name Suffix">
                    <input
                      type="text"
                      name="nameSuffix"
                      value={bulkFormData.nameSuffix}
                      onChange={handleBulkFormChange}
                      required
                      placeholder="e.g. COUPON"
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 bg-white shadow-sm"
                    />
                  </InputField>
                </>
              )}

              {/* Discount Percentage */}
              <InputField icon={FaPercent} label={`Discount ${formData.couponCodeType}`}>
                <div className="flex gap-3">
                  <input
                    type="text"
                    name="discountPercentage"
                    value={formData.discountPercentage}
                    onChange={handleFormChange}
                    required
                    placeholder={formData.couponCodeType === "%" ? "e.g. 20" : "e.g. 500"}
                    className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 bg-white shadow-sm flex-1"
                  />
                  <select
                    name="couponCodeType"
                    value={formData.couponCodeType}
                    onChange={handleFormChange}
                    className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 bg-white shadow-sm w-32"
                  >
                    <option value="%">% Off</option>
                    <option value="₹">₹ Off</option>
                  </select>
                </div>
              </InputField>

              {/* Required Coins */}
              <InputField icon={FaCoins} label="Required Coins">
                <input
                  type="text"
                  name="requiredCoins"
                  value={formData.requiredCoins}
                  onChange={handleFormChange}
                  required
                  placeholder="e.g. 50"
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 bg-white shadow-sm"
                />
              </InputField>

              {/* Validity Date */}
              <InputField icon={FaCalendarAlt} label="Valid Till">
                <input
                  type="date"
                  name="validityDate"
                  value={formData.validityDate}
                  onChange={handleFormChange}
                  required
                  min={getMinDate()}
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 bg-white shadow-sm"
                />
              </InputField>

              {/* Category */}
              <InputField icon={FaLayerGroup} label="Category">
                {loadingCategories ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <FaSpinner className="w-4 h-4 animate-spin" />
                    Loading categories...
                  </div>
                ) : errorCategories ? (
                  <p className="text-red-600">{errorCategories}</p>
                ) : (
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                    className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 bg-white shadow-sm"
                  >
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat.categoryName}>
                        {cat.categoryName}
                      </option>
                    ))}
                  </select>
                )}
              </InputField>

              {/* Limit For Same User */}
              <InputField icon={FaUserCheck} label="Limit Per User">
                <input
                  type="text"
                  name="limitForSameUser"
                  value={formData.limitForSameUser}
                  onChange={handleFormChange}
                  required
                  placeholder="e.g. 2"
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 bg-white shadow-sm"
                />
              </InputField>

              {/* Max Usage */}
              <InputField icon={FaUserCheck} label="Max Usage Limit">
                <input
                  type="text"
                  name="maxUsage"
                  value={formData.maxUsage}
                  onChange={handleFormChange}
                  required
                  placeholder="e.g. 500"
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 bg-white shadow-sm"
                />
              </InputField>
            </div>

            {/* Bulk Creation Preview */}
            {creationMode === "bulk" && previewCoupons.length > 0 && (
              <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FaCopy className="w-4 h-4 text-blue-600" />
                  Preview Names (First 5)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {previewCoupons.map((name, index) => (
                    <div
                      key={index}
                      className="bg-white p-3 rounded-xl border border-blue-100 text-center shadow-sm"
                    >
                      <div className="text-xs text-blue-600 font-medium mb-1">#{index + 1}</div>
                      <div className="text-sm font-semibold text-gray-700 truncate">{name}</div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  Total coupons to create: <span className="font-bold text-purple-600">{bulkFormData.count || 0}</span>
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
              >
                {loading ? (
                  <>
                    <FaSpinner className="w-5 h-5 animate-spin" />
                    {creationMode === "single" ? "Creating Coupon..." : "Creating Coupons..."}
                  </>
                ) : creationMode === "single" ? (
                  <>
                    <FaPlus className="w-5 h-5" />
                    Create Single Coupon
                  </>
                ) : (
                  <>
                    <FaCopy className="w-5 h-5" />
                    Create {bulkFormData.count || 0} Coupons
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCoupon;