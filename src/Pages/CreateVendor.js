import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaCloudUploadAlt } from "react-icons/fa"; // 👈 Add this at the top

const CreateVendor = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    zipcode: "",
    businessName: "",
    latitude: "",
    longitude: "",
    businessLogo: null,
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "businessLogo") {
      setFormData({ ...formData, businessLogo: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const {
      name,
      email,
      phone,
      city,
      zipcode,
      businessName,
      latitude,
      longitude,
      businessLogo,
    } = formData;

    if (
      !name ||
      !email ||
      !phone ||
      !city ||
      !zipcode ||
      !businessName ||
      !latitude ||
      !longitude ||
      !businessLogo
    ) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);
      const data = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, key === "latitude" || key === "longitude" ? parseFloat(value) : value);
      });

      const token = localStorage.getItem("adminToken");

      await axios.post("http://31.97.206.144:6098/api/vendor/vendor-register", data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Vendor registered successfully!");
      navigate("/vendorlist");
    } catch (error) {
      console.error("Error registering vendor:", error);
      setErrorMessage(
        error.response?.data?.message || "Failed to create vendor. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/vendorlist");
  };

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-md rounded p-6">
      <h2 className="text-2xl font-semibold mb-6 text-blue-900">Create New Vendor</h2>

      {errorMessage && <p className="text-red-600 mb-4">{errorMessage}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Two fields per row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" name="name" placeholder="Vendor Name" className="p-3 border rounded" onChange={handleChange} />
          <input type="email" name="email" placeholder="Email" className="p-3 border rounded" onChange={handleChange} />

          <input type="tel" name="phone" placeholder="Phone" className="p-3 border rounded" onChange={handleChange} />
          <input type="text" name="city" placeholder="City" className="p-3 border rounded" onChange={handleChange} />

          <input type="text" name="zipcode" placeholder="Zipcode" className="p-3 border rounded" onChange={handleChange} />
          <input type="text" name="businessName" placeholder="Business Name" className="p-3 border rounded" onChange={handleChange} />

          <input
            type="number"
            name="latitude"
            step="any"
            placeholder="Latitude (e.g. 28.6139)"
            className="p-3 border rounded"
            onChange={handleChange}
          />
          <input
            type="number"
            name="longitude"
            step="any"
            placeholder="Longitude (e.g. 77.2090)"
            className="p-3 border rounded"
            onChange={handleChange}
          />
        </div>

        {/* Logo Upload */}
        {/* Logo Upload */}
        <div>
          <label className="block mb-2 font-medium text-gray-700">Business Logo (Image)</label>

          <div className="flex items-center gap-3">
            <label
              htmlFor="businessLogo"
              className="cursor-pointer flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition"
              title="Upload Logo"
            >
              <FaCloudUploadAlt className="text-2xl" />
            </label>

            {formData.businessLogo && (
              <span className="text-sm text-gray-700 truncate max-w-xs">
                {formData.businessLogo.name}
              </span>
            )}
          </div>

          <input
            type="file"
            id="businessLogo"
            name="businessLogo"
            accept="image/*"
            className="hidden"
            onChange={handleChange}
          />
        </div>

        {/* Submit & Cancel Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500 transition"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="bg-blue-900 text-white px-6 py-2 rounded hover:bg-blue-800 transition"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateVendor;
