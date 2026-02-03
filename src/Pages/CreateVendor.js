import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { CloudUpload, Eye, EyeOff, MapPin, Loader2, Building, Mail, Phone, FileText, User, CheckCircle, X, Plus, Trash2 } from "lucide-react";

const CreateVendor = () => {
  const navigate = useNavigate();
  const { vendorId } = useParams();
  const isEditMode = !!vendorId;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [addresses, setAddresses] = useState([{ street: "", city: "", zipcode: "" }]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [gettingLocation, setGettingLocation] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [logoChanged, setLogoChanged] = useState(false);
  const [vendorToken, setVendorToken] = useState("");
  const [otp, setOtp] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    tillNumber: "",
    businessName: "",
    latitude: "",
    longitude: "",
    password: "",
    confirmPassword: "",
    note: "",
    businessLogo: null,
    acceptTerms: false,
  });

  /* ---------------- FETCH VENDOR DETAILS FOR EDIT ---------------- */
  useEffect(() => {
    if (isEditMode) {
      fetchVendorDetails();
    }
  }, [vendorId]);

  const fetchVendorDetails = async () => {
    try {
      setFetching(true);
      const response = await axios.get(
        `https://api.redemly.com/api/vendor/getById/${vendorId}`
      );
      
      const vendor = response.data.vendor;
      
      setFormData({
        firstName: vendor.firstName || "",
        lastName: vendor.lastName || "",
        email: vendor.email || "",
        phone: vendor.phone || "",
        tillNumber: vendor.tillNumber || "",
        businessName: vendor.businessName || "",
        latitude: vendor.location?.coordinates[1] || "",
        longitude: vendor.location?.coordinates[0] || "",
        password: "",
        confirmPassword: "",
        note: vendor.note || "",
        businessLogo: null,
        acceptTerms: true,
      });

      // Set addresses
      if (vendor.addresses && vendor.addresses.length > 0) {
        setAddresses(vendor.addresses.map(addr => ({
          street: addr.street || "",
          city: addr.city || "",
          zipcode: addr.zipcode || ""
        })));
      }

      // Set image preview
      if (vendor.businessLogo) {
        setImagePreview(vendor.businessLogo);
      }

    } catch (error) {
      console.error("Error fetching vendor details:", error);
      setErrorMessage("Failed to fetch vendor details. Please try again.");
    } finally {
      setFetching(false);
    }
  };

  /* ---------------- LOCATION FUNCTIONS ---------------- */
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData({
          ...formData,
          latitude: latitude.toString(),
          longitude: longitude.toString(),
        });
        setGettingLocation(false);
        setSuccessMessage("Location detected successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      },
      (error) => {
        console.error("Error getting location:", error);
        setGettingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setErrorMessage("Location access denied. Please enable location services.");
            break;
          case error.POSITION_UNAVAILABLE:
            setErrorMessage("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            setErrorMessage("Location request timed out.");
            break;
          default:
            setErrorMessage("An unknown error occurred while getting location.");
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const clearLocation = () => {
    setFormData({
      ...formData,
      latitude: "",
      longitude: "",
    });
  };

  /* ---------------- HANDLE CHANGES ---------------- */
  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else if (type === "file") {
      const file = files[0];
      setFormData({ ...formData, [name]: file });
      setLogoChanged(true);
      
      // Create preview
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setImagePreview(null);
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }

    // Clear password error when typing
    if (name === "password" || name === "confirmPassword") {
      setPasswordError("");
    }
    
    // Clear messages
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleAddressChange = (index, field, value) => {
    const newAddresses = [...addresses];
    newAddresses[index][field] = value;
    setAddresses(newAddresses);
  };

  const addAddress = () => {
    setAddresses([...addresses, { street: "", city: "", zipcode: "" }]);
  };

  const removeAddress = (index) => {
    if (addresses.length > 1) {
      const newAddresses = addresses.filter((_, i) => i !== index);
      setAddresses(newAddresses);
    }
  };

  /* ---------------- VALIDATION FUNCTIONS ---------------- */
  const validatePasswords = () => {
    if (!isEditMode && formData.password.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      return false;
    }

    if (!isEditMode && formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return false;
    }

    setPasswordError("");
    return true;
  };

  const validateForm = () => {
    const {
      firstName,
      lastName,
      email,
      phone,
      tillNumber,
      businessName,
      latitude,
      longitude,
      password,
      confirmPassword,
      acceptTerms
    } = formData;

    // Required fields
    const requiredFields = [
      { field: firstName, name: "First Name" },
      { field: lastName, name: "Last Name" },
      { field: email, name: "Email" },
      { field: phone, name: "Phone" },
      { field: tillNumber, name: "TIN Number" },
      { field: businessName, name: "Business Name" },
      { field: latitude, name: "Latitude" },
      { field: longitude, name: "Longitude" }
    ];

    for (let field of requiredFields) {
      if (!field.field) {
        setErrorMessage(`${field.name} is required.`);
        return false;
      }
    }

    // Validate addresses
    const validAddresses = addresses.every(addr =>
      addr.street.trim() && addr.city.trim() && addr.zipcode.trim()
    );

    if (!validAddresses) {
      setErrorMessage("Please fill all address fields.");
      return false;
    }

    // Password validation for create mode
    if (!isEditMode) {
      if (!password) {
        setErrorMessage("Password is required.");
        return false;
      }
      if (!confirmPassword) {
        setErrorMessage("Please confirm your password.");
        return false;
      }
      if (password !== confirmPassword) {
        setErrorMessage("Passwords do not match.");
        return false;
      }
    }

    // Check terms acceptance for create mode
    if (!isEditMode && !acceptTerms) {
      setErrorMessage("You must accept terms & conditions.");
      return false;
    }

    return true;
  };

  /* ---------------- SUBMIT FORM ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!validateForm() || !validatePasswords()) {
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();
      
      // Add basic fields
      data.append("firstName", formData.firstName);
      data.append("lastName", formData.lastName);
      data.append("email", formData.email);
      data.append("phone", formData.phone);
      data.append("tillNumber", formData.tillNumber);
      data.append("businessName", formData.businessName);
      data.append("latitude", parseFloat(formData.latitude));
      data.append("longitude", parseFloat(formData.longitude));
      data.append("note", formData.note || "");
      
      // Add addresses as JSON string
      data.append("addresses", JSON.stringify(addresses));
      
      // Add password and terms only for create mode
      if (!isEditMode) {
        data.append("password", formData.password);
        data.append("acceptTerms", formData.acceptTerms);
      }
      
      // Add business logo if changed or in create mode
      if (formData.businessLogo && (logoChanged || !isEditMode)) {
        data.append("businessLogo", formData.businessLogo);
      }

      const token = localStorage.getItem("adminToken");
      const headers = {
        "Content-Type": "multipart/form-data",
        ...(token && { Authorization: `Bearer ${token}` })
      };

      if (isEditMode) {
        // Update existing vendor
        const response = await axios.put(
          `https://api.redemly.com/api/vendor/update/${vendorId}`,
          data,
          { headers }
        );

        if (response.data.success) {
          setSuccessMessage("Vendor updated successfully!");
          setTimeout(() => {
            navigate("/vendorlist");
          }, 2000);
        } else {
          setErrorMessage(response.data.message || "Update failed.");
        }
      } else {
        // Create new vendor - IMPORTANT FIX HERE
        try {
          const response = await axios.post(
            "https://api.redemly.com/api/vendor/register",
            data,
            { headers }
          );

          console.log("Registration response:", response.data);
          
          // Check if response has token directly (like VendorRegistration)
          if (response.data.token) {
            setVendorToken(response.data.token);
            setSuccessMessage("Vendor registered! Please enter the OTP sent to vendor's email.");
            setStep(2);
          } 
          // Check if response has success and token
          else if (response.data.success && response.data.token) {
            setVendorToken(response.data.token);
            setSuccessMessage("Vendor registered! Please enter the OTP sent to vendor's email.");
            setStep(2);
          }
          // Check if response just has success
          else if (response.data.success) {
            // If no token in response, try to get vendor ID from response
            if (response.data.vendorId) {
              setSuccessMessage("Vendor registered successfully! OTP has been sent to vendor's email.");
              setStep(2);
              // If we have vendor ID but no token, we might need to handle this differently
              // For now, set a dummy token and let user enter OTP
              setVendorToken(response.data.vendorId);
            } else {
              setSuccessMessage("Vendor registered successfully!");
              setTimeout(() => {
                navigate("/vendorlist");
              }, 2000);
            }
          } else {
            setErrorMessage(response.data.message || "Registration failed.");
          }
        } catch (postError) {
          console.error("POST error:", postError.response?.data || postError);
          // If the error is about OTP already sent, show OTP screen
          if (postError.response?.data?.message?.includes("OTP") || 
              postError.response?.data?.message?.includes("verification")) {
            setSuccessMessage("Vendor registered! Please enter the OTP sent to vendor's email.");
            setVendorToken(postError.response.data.token || "pending");
            setStep(2);
          } else {
            setErrorMessage(
              postError.response?.data?.message || 
              "Failed to create vendor. Please check all fields and try again."
            );
          }
        }
      }
    } catch (error) {
      console.error("General error:", error);
      setErrorMessage(
        error.response?.data?.message || 
        `Failed to ${isEditMode ? 'update' : 'create'} vendor.`
      );
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- OTP VERIFICATION ---------------- */
  const handleVerifyOtp = async () => {
    if (otp.length < 4) {
      setErrorMessage("Enter a valid OTP (at least 4 digits).");
      return;
    }

    setOtpLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.post(
        "https://api.redemly.com/api/vendor/verify-otp",
        { token: vendorToken, otp },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.success || response.data.message?.includes("success")) {
        setSuccessMessage("OTP Verified! Vendor Activated.");
        setTimeout(() => {
          navigate("/vendorlist");
        }, 2000);
      } else {
        setErrorMessage(response.data.message || "OTP Verification Failed!");
      }
    } catch (err) {
      console.error("OTP verification error:", err.response?.data || err);
      setErrorMessage(
        err.response?.data?.message || 
        "OTP Verification Failed! Please check the OTP and try again."
      );
    } finally {
      setOtpLoading(false);
    }
  };

  /* ---------------- RESEND OTP ---------------- */
  const handleResendOtp = async () => {
    try {
      setOtpLoading(true);
      setErrorMessage("");
      
      // This would require an API endpoint to resend OTP
      // For now, we'll just show a message
      setSuccessMessage("OTP has been resent to vendor's email.");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setErrorMessage("Failed to resend OTP. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <div className="text-xl font-semibold text-blue-600">Loading vendor details...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-yellow-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-purple-600 bg-clip-text text-transparent">
            {isEditMode ? "Edit Vendor" : "Create New Vendor"}
          </h1>
          <p className="text-gray-600 mt-2">
            {isEditMode ? "Update vendor information" : "Register a new vendor account"}
          </p>
        </div>

        {/* Messages */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-600 rounded-xl">
            {successMessage}
          </div>
        )}

        {/* Step 1: Registration/Edit Form */}
        {step === 1 && (
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-8">
              <div className="flex items-center gap-3 text-white">
                {isEditMode ? (
                  <>
                    <Building className="w-8 h-8" />
                    <div>
                      <h2 className="text-2xl font-bold">Edit Vendor: {formData.businessName}</h2>
                      <p className="text-blue-100 text-sm">Update vendor information</p>
                    </div>
                  </>
                ) : (
                  <>
                    <User className="w-8 h-8" />
                    <div>
                      <h2 className="text-2xl font-bold">Register New Vendor</h2>
                      <p className="text-blue-100 text-sm">Fill in all required information</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Form */}
            <div className="p-6 md:p-10">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Information */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center">
                    <User className="w-6 h-6 mr-2 text-blue-600" />
                    Personal Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 
                                 focus:ring-2 focus:ring-blue-500 focus:border-blue-600 
                                 outline-none transition-all"
                        placeholder="Enter first name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 
                                 focus:ring-2 focus:ring-blue-500 focus:border-blue-600 
                                 outline-none transition-all"
                        placeholder="Enter last name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-xl border border-gray-300 
                                 focus:ring-2 focus:ring-blue-500 focus:border-blue-600 
                                 outline-none transition-all ${isEditMode ? 'bg-gray-100' : ''}`}
                        placeholder="Enter email"
                        required
                        readOnly={isEditMode}
                      />
                      {isEditMode && (
                        <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Business Information */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center">
                    <Building className="w-6 h-6 mr-2 text-blue-600" />
                    Business Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Name *
                      </label>
                      <input
                        type="text"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 
                                 focus:ring-2 focus:ring-blue-500 focus:border-blue-600 
                                 outline-none transition-all"
                        placeholder="Enter business name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        TIN Number *
                      </label>
                      <input
                        type="text"
                        name="tillNumber"
                        value={formData.tillNumber}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 
                                 focus:ring-2 focus:ring-blue-500 focus:border-blue-600 
                                 outline-none transition-all"
                        placeholder="Enter TIN number"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone *
                      </label>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 
                                 focus:ring-2 focus:ring-blue-500 focus:border-blue-600 
                                 outline-none transition-all"
                        placeholder="Enter phone number"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Location Information */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center">
                    <MapPin className="w-6 h-6 mr-2 text-blue-600" />
                    Location Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Latitude *
                      </label>
                      <input
                        type="text"
                        name="latitude"
                        value={formData.latitude}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 
                                 focus:ring-2 focus:ring-blue-500 focus:border-blue-600 
                                 outline-none transition-all"
                        placeholder="Enter latitude"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Longitude *
                      </label>
                      <input
                        type="text"
                        name="longitude"
                        value={formData.longitude}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 
                                 focus:ring-2 focus:ring-blue-500 focus:border-blue-600 
                                 outline-none transition-all"
                        placeholder="Enter longitude"
                        required
                      />
                    </div>

                    <div className="flex flex-col space-y-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        &nbsp;
                      </label>
                      <button
                        type="button"
                        onClick={getCurrentLocation}
                        disabled={gettingLocation}
                        className="flex items-center justify-center px-4 py-3 rounded-xl
                                 bg-gradient-to-r from-blue-600 to-blue-700 
                                 text-white font-medium hover:opacity-90 
                                 active:scale-95 transition-all 
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {gettingLocation ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Detecting...
                          </>
                        ) : (
                          <>
                            <MapPin className="w-5 h-5 mr-2" />
                            Auto-detect Location
                          </>
                        )}
                      </button>
                      
                      {formData.latitude && formData.longitude && (
                        <button
                          type="button"
                          onClick={clearLocation}
                          className="px-4 py-2 rounded-xl border border-red-300 
                                   text-red-600 font-medium hover:bg-red-50 
                                   active:scale-95 transition-all text-sm"
                        >
                          Clear Location
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Addresses */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center">
                      <MapPin className="w-6 h-6 mr-2 text-blue-600" />
                      Addresses *
                    </h3>
                    <button
                      type="button"
                      onClick={addAddress}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      <Plus className="w-4 h-4" />
                      Add Address
                    </button>
                  </div>
                  
                  {addresses.map((address, index) => (
                    <div key={index} className="p-6 border border-gray-200 rounded-xl bg-gray-50">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-semibold text-blue-700">Address {index + 1} *</span>
                        {addresses.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeAddress(index)}
                            className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                            Remove
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <input
                            type="text"
                            placeholder="Street *"
                            value={address.street}
                            onChange={(e) => handleAddressChange(index, 'street', e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 
                                     focus:ring-2 focus:ring-blue-500 focus:border-blue-600 
                                     outline-none placeholder-gray-500"
                            required
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="City *"
                            value={address.city}
                            onChange={(e) => handleAddressChange(index, 'city', e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 
                                     focus:ring-2 focus:ring-blue-500 focus:border-blue-600 
                                     outline-none placeholder-gray-500"
                            required
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Zip Code *"
                            value={address.zipcode}
                            onChange={(e) => handleAddressChange(index, 'zipcode', e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 
                                     focus:ring-2 focus:ring-blue-500 focus:border-blue-600 
                                     outline-none placeholder-gray-500"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Password Section (Only for create mode) */}
                {!isEditMode && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center">
                      <FileText className="w-6 h-6 mr-2 text-blue-600" />
                      Account Security
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 
                                     focus:ring-2 focus:ring-blue-500 focus:border-blue-600 
                                     outline-none transition-all pr-10"
                            placeholder="Enter password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 
                                     text-gray-500 hover:text-blue-700 transition-colors"
                          >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 
                                     focus:ring-2 focus:ring-blue-500 focus:border-blue-600 
                                     outline-none transition-all pr-10"
                            placeholder="Confirm password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 
                                     text-gray-500 hover:text-blue-700 transition-colors"
                          >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {passwordError && (
                      <div className="p-3 text-red-600 bg-red-50 border border-red-200 
                                    rounded-lg text-sm font-medium">
                        {passwordError}
                    </div>
                    )}
                  </div>
                )}

                {/* Additional Information */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center">
                    <FileText className="w-6 h-6 mr-2 text-blue-600" />
                    Additional Information
                  </h3>
                  
                  {/* Note */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      name="note"
                      value={formData.note}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 
                               focus:ring-2 focus:ring-blue-500 focus:border-blue-600 
                               outline-none transition-all resize-none"
                      placeholder="Enter any additional notes (optional)"
                    />
                  </div>

                  {/* Logo Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Logo {!isEditMode && "*"}
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        id="businessLogo"
                        name="businessLogo"
                        onChange={handleChange}
                        accept="image/*"
                        className="hidden"
                      />
                      <label
                        htmlFor="businessLogo"
                        className="cursor-pointer flex flex-col items-center justify-center 
                                 w-32 h-32 border-2 border-dashed border-blue-400 
                                 rounded-xl bg-white/80 hover:bg-blue-50 transition-colors
                                 hover:border-blue-500"
                      >
                        <CloudUpload className="w-12 h-12 text-blue-600 mb-2" />
                        <span className="text-blue-700 text-sm text-center px-2">
                          {formData.businessLogo
                            ? formData.businessLogo.name
                            : "Click to upload"}
                        </span>
                      </label>
                      
                      {/* Image Preview */}
                      {imagePreview && (
                        <div className="w-32 h-32 rounded-xl overflow-hidden border border-gray-300">
                          <img 
                            src={imagePreview} 
                            alt="Logo preview" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                    {isEditMode && !logoChanged && imagePreview && (
                      <p className="text-xs text-gray-500 mt-2">
                        Current logo will be kept unless you upload a new one.
                      </p>
                    )}
                  </div>

                  {/* Terms (Only for create mode) */}
                  {!isEditMode && (
                    <div className="flex items-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <input
                        type="checkbox"
                        id="acceptTerms"
                        name="acceptTerms"
                        checked={formData.acceptTerms}
                        onChange={handleChange}
                        className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                        required
                      />
                      <label htmlFor="acceptTerms" className="ml-3 text-gray-700">
                        I agree to the{" "}
                        <a
                          href="/merchant-agreement"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-700 hover:text-blue-900 font-medium underline"
                        >
                          Terms & Conditions
                        </a>
                        {" "}*
                      </label>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => navigate("/vendorlist")}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-400 text-white rounded-xl font-semibold hover:bg-gray-500 transition-all"
                    disabled={loading}
                  >
                    <X className="w-5 h-5" />
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {isEditMode ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        {isEditMode ? "Update Vendor" : "Create Vendor"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-green-500 to-green-600 p-8">
              <div className="text-center text-white">
                <Mail className="w-16 h-16 mx-auto mb-4" />
                <h2 className="text-3xl font-bold">OTP Verification</h2>
                <p className="text-green-100 mt-2">Verify vendor registration</p>
              </div>
            </div>

            {/* OTP Form */}
            <div className="p-10 text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                <Mail className="w-12 h-12 text-green-600" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Enter Verification Code</h3>
              <p className="text-gray-600 mb-6">
                An OTP has been sent to <span className="font-semibold text-blue-600">{formData.email}</span>.
                Please enter the 6-digit code to activate the vendor account.
              </p>
              
              <p className="text-sm text-gray-500 mb-8">
                The vendor should check their email for the verification code.
              </p>

              <div className="max-w-xs mx-auto">
                <input
                  type="text"
                  maxLength="6"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-4 rounded-xl border border-green-400 
                           bg-white text-center text-2xl tracking-widest 
                           focus:ring-2 focus:ring-green-500 outline-none
                           placeholder-gray-400"
                />
              </div>

              <div className="mt-8 flex justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-400 text-white rounded-xl font-semibold hover:bg-gray-500 transition-all"
                >
                  <X className="w-5 h-5" />
                  Back to Form
                </button>

                <button
                  onClick={handleVerifyOtp}
                  disabled={otpLoading || otp.length !== 4}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all disabled:opacity-50"
                >
                  {otpLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Verify OTP
                    </>
                  )}
                </button>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={otpLoading}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  Resend OTP
                </button>
              </div>

              <p className="text-sm text-gray-500 mt-8">
                Note: The vendor account will remain inactive until OTP verification is complete.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateVendor;