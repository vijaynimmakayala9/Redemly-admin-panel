import { useState, useEffect } from "react";
import { FaPlus, FaCopy, FaUpload } from "react-icons/fa";

const CreateCoupon = () => {
  const [vendors, setVendors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [errorVendors, setErrorVendors] = useState(null);
  const [errorCategories, setErrorCategories] = useState(null);
  const [creationMode, setCreationMode] = useState("single");
  const [couponImage, setCouponImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    vendorId: "",
    name: "",
    discountPercentage: "",
    requiredCoins: "",
    validityDate: "",
    category: "",
    couponCodeType: "%",
    limitForSameUser: 1,
  });

  const [bulkFormData, setBulkFormData] = useState({
    count: 1,
    namePrefix: "",
    nameSuffix: "COUPON",
  });

  // Fetch vendors and categories on mount
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await fetch("http://31.97.206.144:6098/api/admin/getvendors");
        const data = await res.json();
        if (res.ok) {
          setVendors(data.vendors);
          if (data.vendors.length > 0) {
            setFormData((prev) => ({ ...prev, vendorId: data.vendors[0]._id }));
          }
        } else {
          setErrorVendors(data.message || "Failed to fetch vendors");
        }
      } catch (error) {
        setErrorVendors(error.message);
      } finally {
        setLoadingVendors(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await fetch("http://31.97.206.144:6098/api/admin/categories");
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

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    const val = ["discountPercentage", "requiredCoins", "limitForSameUser"].includes(name)
      ? Number(value)
      : value;

    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleBulkFormChange = (e) => {
    const { name, value } = e.target;
    const val = name === "count" ? Number(value) : value;
    
    setBulkFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCouponImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateCouponName = (index) => {
    const { namePrefix, nameSuffix } = bulkFormData;
    const paddedIndex = String(index).padStart(String(bulkFormData.count).length, '0');
    
    return `${namePrefix}${namePrefix ? '_' : ''}${nameSuffix}_${paddedIndex}`;
  };

  const handleAddCoupon = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.vendorId) {
      alert("Please select a vendor");
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      
      // Add image if provided
      if (couponImage) {
        formDataToSend.append('couponImage', couponImage);
      }

      const res = await fetch(`http://31.97.206.144:6098/api/vendor/create-coupon/${formData.vendorId}`, {
        method: "POST",
        body: formDataToSend,
      });

      const data = await res.json();

      if (res.ok) {
        alert("Coupon created successfully!");
        setFormData({
          vendorId: vendors.length > 0 ? vendors[0]._id : "",
          name: "",
          discountPercentage: "",
          requiredCoins: "",
          validityDate: "",
          category: categories.length > 0 ? categories[0].categoryName : "",
          couponCodeType: "%",
          limitForSameUser: 1,
        });
        setCouponImage(null);
        setImagePreview(null);
      } else {
        alert("Error creating coupon: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      alert("Server error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkCreate = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.vendorId) {
      alert("Please select a vendor");
      setLoading(false);
      return;
    }

    if (bulkFormData.count < 1 || bulkFormData.count > 1000) {
      alert("Please enter a count between 1 and 1000");
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      
      // Add bulk data fields
      Object.keys(bulkFormData).forEach(key => {
        formDataToSend.append(key, bulkFormData[key]);
      });
      
      // Add image if provided
      if (couponImage) {
        formDataToSend.append('couponImage', couponImage);
      }

      const res = await fetch(`http://31.97.206.144:6098/api/vendor/create-bulkcoupon/${formData.vendorId}`, {
        method: "POST",
        body: formDataToSend,
      });

      const data = await res.json();

      if (res.ok) {
        alert(`Successfully created ${data.created} coupons! ${data.failed > 0 ? `${data.failed} failed.` : ''}`);
        
        // Reset form
        setFormData({
          vendorId: vendors.length > 0 ? vendors[0]._id : "",
          name: "",
          discountPercentage: "",
          requiredCoins: "",
          validityDate: "",
          category: categories.length > 0 ? categories[0].categoryName : "",
          couponCodeType: "%",
          limitForSameUser: 1,
        });
        
        setBulkFormData({
          count: 1,
          namePrefix: "",
          nameSuffix: "COUPON",
        });
        
        setCouponImage(null);
        setImagePreview(null);
      } else {
        alert("Error creating coupons: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      alert("Server error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-2xl font-semibold text-center mb-6 text-blue-900 mt-10">Create Coupons</h1>

      {/* Mode selector */}
      <div className="flex justify-center mb-6">
        <div className="bg-white p-1 rounded-md shadow-sm">
          <button
            type="button"
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              creationMode === "single" 
                ? "bg-purple-900 text-white" 
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setCreationMode("single")}
          >
            Single Coupon
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              creationMode === "bulk" 
                ? "bg-purple-900 text-white" 
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setCreationMode("bulk")}
          >
            Bulk Create
          </button>
        </div>
      </div>

      <form
        onSubmit={creationMode === "single" ? handleAddCoupon : handleBulkCreate}
        className="bg-white p-6 rounded-md shadow-md max-w-4xl mx-auto"
        encType="multipart/form-data"
      >
        <h2 className="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2">
          {creationMode === "single" ? <FaPlus /> : <FaCopy />} 
          {creationMode === "single" ? "Add Coupon" : "Bulk Create Coupons"}
        </h2>

        {/* Vendor Dropdown */}
        <div className="mb-4">
          <label className="block mb-1 text-gray-600 font-medium">Select Vendor</label>
          {loadingVendors ? (
            <p>Loading vendors...</p>
          ) : errorVendors ? (
            <p className="text-red-600">Error: {errorVendors}</p>
          ) : (
            <select
              name="vendorId"
              value={formData.vendorId}
              onChange={handleFormChange}
              required
              className="px-3 py-2 border border-gray-300 rounded w-full max-w-sm"
            >
              {vendors.map((vendor) => (
                <option key={vendor._id} value={vendor._id}>
                  {vendor.businessName} ({vendor.name})
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          {creationMode === "single" ? (
            <div className="flex flex-col">
              <label className="mb-1 text-gray-600 font-medium">Coupon Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                required
                placeholder="e.g. Summer Feast"
                className="px-3 py-2 border border-gray-300 rounded"
              />
            </div>
          ) : (
            <>
              <div className="flex flex-col">
                <label className="mb-1 text-gray-600 font-medium">Number of Coupons</label>
                <input
                  type="number"
                  name="count"
                  value={bulkFormData.count}
                  onChange={handleBulkFormChange}
                  required
                  min="1"
                  max="1000"
                  placeholder="e.g. 100"
                  className="px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-gray-600 font-medium">Name Prefix (Optional)</label>
                <input
                  type="text"
                  name="namePrefix"
                  value={bulkFormData.namePrefix}
                  onChange={handleBulkFormChange}
                  placeholder="e.g. SUMMER"
                  className="px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-gray-600 font-medium">Name Suffix</label>
                <input
                  type="text"
                  name="nameSuffix"
                  value={bulkFormData.nameSuffix}
                  onChange={handleBulkFormChange}
                  required
                  placeholder="e.g. COUPON"
                  className="px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <div className="flex flex-col justify-end">
                <p className="text-xs text-gray-500 mb-1">
                  Example: {generateCouponName(1)}
                </p>
              </div>
            </>
          )}

          <div className="flex flex-col">
            <label className="mb-1 text-gray-600 font-medium">Discount ({formData.couponCodeType})</label>
            <input
              type="number"
              name="discountPercentage"
              value={formData.discountPercentage}
              onChange={handleFormChange}
              required
              min="1"
              max={formData.couponCodeType === "%" ? "100" : ""}
              placeholder={formData.couponCodeType === "%" ? "e.g. 20" : "e.g. 500"}
              className="px-3 py-2 border border-gray-300 rounded"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-gray-600 font-medium">Valid Till</label>
            <input
              type="date"
              name="validityDate"
              value={formData.validityDate}
              onChange={handleFormChange}
              required
              className="px-3 py-2 border border-gray-300 rounded"
            />
          </div>

          {/* Category Dropdown (from API) */}
          <div className="flex flex-col">
            <label className="mb-1 text-gray-600 font-medium">Category</label>
            {loadingCategories ? (
              <p>Loading categories...</p>
            ) : errorCategories ? (
              <p className="text-red-600">Error: {errorCategories}</p>
            ) : (
              <select
                name="category"
                value={formData.category}
                onChange={handleFormChange}
                className="px-3 py-2 border border-gray-300 rounded"
              >
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.categoryName}>
                    {cat.categoryName}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-gray-600 font-medium">Coupon Code Type</label>
            <select
              name="couponCodeType"
              value={formData.couponCodeType}
              onChange={handleFormChange}
              className="px-3 py-2 border border-gray-300 rounded"
            >
              <option value="%">Percentage (%)</option>
              <option value="₹">Fixed Amount (₹)</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-gray-600 font-medium">Limit For Same User</label>
            <input
              type="number"
              name="limitForSameUser"
              value={formData.limitForSameUser}
              onChange={handleFormChange}
              required
              min="1"
              className="px-3 py-2 border border-gray-300 rounded"
            />
          </div>

          {/* Image Upload */}
          <div className="flex flex-col md:col-span-2">
            <label className="mb-1 text-gray-600 font-medium">Coupon Image</label>
            <div className="flex items-center gap-4">
              <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:bg-gray-50">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded" />
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FaUpload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-xs text-gray-500">Upload Image</p>
                  </div>
                )}
                <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
              </label>
              <div>
                <p className="text-xs text-gray-500 mb-1">Upload an image for your coupon</p>
                {couponImage && (
                  <button
                    type="button"
                    onClick={() => {
                      setCouponImage(null);
                      setImagePreview(null);
                    }}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Remove Image
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {creationMode === "bulk" && (
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> The same image will be used for all coupons in bulk creation.
            </p>
          </div>
        )}

        <div className="text-right mt-6">
          <button
            type="submit"
            disabled={loading}
            className="bg-purple-900 hover:bg-purple-700 text-white px-6 py-2 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : creationMode === "single" ? "Create Coupon" : `Create ${bulkFormData.count} Coupons`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCoupon;