import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  FaStar, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaCalendarAlt,
  FaEdit,
  FaToggleOn,
  FaToggleOff,
  FaChartLine,
  FaMoneyBillWave,
  FaReceipt,
  FaShoppingCart,
  FaUserCheck,
  FaUserTimes,
  FaDownload,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaBusinessTime,
  FaEye
} from "react-icons/fa";

export default function VendorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [stats, setStats] = useState({
    overall: 0,
    monthly: 0,
    weekly: 0,
    daily: 0
  });
  const [graphFilter, setGraphFilter] = useState("overall");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!id) {
      setError("Vendor ID is missing");
      setLoading(false);
      return;
    }

    const fetchVendor = async () => {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("adminToken");

        // Fetch vendor details
        const res = await fetch(`https://api.redemly.com/api/admin/getvendor/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch vendor: ${res.status}`);
        }

        const data = await res.json();
        
        // If vendor data exists in response, use it
        if (data.vendor) {
          setVendor(data.vendor);
          
          // Check if vendor is approved
          if (!data.vendor.isApproved) {
            setError("This vendor account is not yet approved");
          }
        } else {
          // If no vendor in response, create from what we have
          const vendorData = {
            _id: id,
            ...data,
            // Ensure isApproved field exists
            isApproved: data.isApproved || false
          };
          setVendor(vendorData);
        }
        
        // Set other data
        setCoupons(data.coupons || generateDummyCoupons());
        setFeedbacks(data.feedbacks || generateDummyFeedbacks());
        setPayments(data.payments || generateDummyPayments());
        
        // Calculate stats
        calculateCouponStats(data.coupons || generateDummyCoupons());
      } catch (err) {
        setError(err.message || "Error fetching vendor");
        // Set demo data for testing
        setVendor(generateDummyVendor(id));
        setCoupons(generateDummyCoupons());
        setFeedbacks(generateDummyFeedbacks());
        setPayments(generateDummyPayments());
        calculateCouponStats(generateDummyCoupons());
      } finally {
        setLoading(false);
      }
    };

    fetchVendor();
  }, [id]);

  // Generate complete dummy vendor data matching your API response
  const generateDummyVendor = (vendorId) => {
    return {
      location: {
        type: "Point",
        coordinates: [40.7128, -74.0060]
      },
      _id: vendorId,
      firstName: "Shiva",
      lastName: "kotturi",
      name: "Shiva kotturi",
      email: "shivak1811@gmail.com",
      phone: "2015391234",
      tillNumber: "1223",
      businessName: "redemly",
      businessLogo: "https://res.cloudinary.com/dokfnv3vy/image/upload/v1766166986/vendorLogos/tttfgcansgjugeba43zl.svg",
      note: "",
      addresses: [
        {
          street: "1900 East Parmer Lane",
          city: "Austin",
          zipcode: "78754",
          _id: "694591cc81f29abb326f6d76"
        }
      ],
      isApproved: true, // This is the field we need to show
      MyFeedback: [],
      documents: [],
      createdAt: "2025-12-19T17:56:28.603Z",
      updatedAt: "2025-12-30T11:50:55.412Z",
      __v: 0,
      acceptTerms: false
    };
  };

  // Generate dummy coupons
  const generateDummyCoupons = () => {
    return [
      {
        _id: "1",
        name: "Summer Discount",
        category: "food",
        discountPercentage: 20,
        couponCode: "SUMMER20",
        requiredCoins: 50,
        validityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        limitForSameUser: 2,
        downloadedCount: 15,
        status: "approved",
        createdAt: new Date().toISOString(),
        couponImage: null
      },
      {
        _id: "2",
        name: "Welcome Offer",
        category: "shopping",
        discountPercentage: 15,
        couponCode: "WELCOME15",
        requiredCoins: 30,
        validityDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        limitForSameUser: 1,
        downloadedCount: 8,
        status: "approved",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        couponImage: null
      }
    ];
  };

  // Generate dummy feedbacks
  const generateDummyFeedbacks = () => {
    return [
      {
        _id: "1",
        stars: 4,
        tellUsAboutExperience: "Great service and products!",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        userId: {
          name: "Alice Johnson",
          profileImage: null
        }
      },
      {
        _id: "2",
        stars: 5,
        tellUsAboutExperience: "Excellent experience, will visit again.",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        userId: {
          name: "Bob Smith",
          profileImage: null
        }
      }
    ];
  };

  // Generate dummy payments
  const generateDummyPayments = () => {
    return [
      {
        _id: "1",
        amount: 1500,
        status: "completed",
        paymentDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        month: "January 2023",
        transactionId: "TXN0012345",
        paymentMethod: "Bank Transfer"
      },
      {
        _id: "2",
        amount: 2000,
        status: "completed",
        paymentDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        month: "December 2022",
        transactionId: "TXN0012346",
        paymentMethod: "Bank Transfer"
      }
    ];
  };

  const calculateCouponStats = (coupons) => {
    const overall = coupons.reduce((total, coupon) => total + (coupon.downloadedCount || 0), 0);
    const monthly = Math.round(overall * 0.7);
    const weekly = Math.round(overall * 0.3);
    const daily = Math.round(overall * 0.1);
    
    setStats({ overall, monthly, weekly, daily });
  };

  // Toggle vendor approval status
  const toggleApproval = async () => {
    if (!window.confirm(`Are you sure you want to ${vendor.isApproved ? "disapprove" : "approve"} this vendor?`)) return;
    
    setActionLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      
      // API call to toggle approval
      const res = await fetch(`https://api.redemly.com/api/admin/toggle-vendor-approval/${vendor._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isApproved: !vendor.isApproved }),
      });

      if (res.ok) {
        // Update local state
        setVendor(prev => ({
          ...prev,
          isApproved: !prev.isApproved
        }));
      } else {
        throw new Error("Failed to update approval status");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Edit vendor function
  const handleEditVendor = () => {
    navigate(`/vendor/edit/${vendor._id}`, { state: { vendor } });
  };

  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }) : 'N/A';
  };

  const formatDateTime = (dateString) => {
    return dateString ? new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : 'N/A';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Get primary address
  const getPrimaryAddress = () => {
    if (vendor?.addresses && vendor.addresses.length > 0) {
      return vendor.addresses[0];
    }
    return { street: "", city: "", zipcode: "" };
  };

  // Get status badge
  const getStatusBadge = () => {
    if (vendor?.isApproved) {
      return {
        text: "Approved",
        color: "bg-green-100 text-green-800 border-green-200",
        icon: <FaUserCheck className="mr-1" />
      };
    } else {
      return {
        text: "Pending Approval",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: <FaUserTimes className="mr-1" />
      };
    }
  };

  const renderProfileSection = () => {
    if (!vendor) return null;
    
    const address = getPrimaryAddress();
    const statusBadge = getStatusBadge();

    return (
      <div className="space-y-6">
        {/* Header with Approval Status */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center space-x-3">
            {vendor.businessLogo ? (
              <img
                src={vendor.businessLogo}
                alt={vendor.businessName}
                className="w-16 h-16 rounded-lg border-2 border-white shadow-md"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                {vendor.businessName?.charAt(0) || vendor.name?.charAt(0) || 'V'}
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{vendor.businessName}</h2>
              <div className="flex items-center mt-1">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusBadge.color}`}>
                  {statusBadge.icon}
                  {statusBadge.text}
                </span>
                <button
                  onClick={toggleApproval}
                  disabled={actionLoading}
                  className="ml-3 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {vendor.isApproved ? <FaToggleOn className="mr-1" /> : <FaToggleOff className="mr-1" />}
                  {actionLoading ? "Processing..." : (vendor.isApproved ? "Disapprove" : "Approve")}
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleEditVendor}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaEdit className="mr-2" />
              Edit Vendor
            </button>
            <button
              onClick={() => navigate('/vendorlist')}
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Back to List
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaShoppingCart className="text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">Total Coupons</p>
                <p className="text-2xl font-bold text-blue-900">{coupons.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FaDownload className="text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">Total Downloads</p>
                <p className="text-2xl font-bold text-green-900">{stats.overall}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FaStar className="text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-purple-700">Avg Rating</p>
                <p className="text-2xl font-bold text-purple-900">
                  {feedbacks.length > 0 
                    ? (feedbacks.reduce((sum, f) => sum + f.stars, 0) / feedbacks.length).toFixed(1)
                    : "N/A"
                  }
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FaBusinessTime className="text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">Member Since</p>
                <p className="text-lg font-bold text-yellow-900">{formatDate(vendor.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaUserCheck className="mr-2 text-blue-600" />
              Personal Information
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-gray-600">Full Name</span>
                <span className="font-medium">{vendor.name}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-gray-600">First Name</span>
                <span className="font-medium">{vendor.firstName || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-gray-600">Last Name</span>
                <span className="font-medium">{vendor.lastName || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-gray-600 flex items-center">
                  <FaEnvelope className="mr-2" />
                  Email
                </span>
                <a href={`mailto:${vendor.email}`} className="font-medium text-blue-600 hover:text-blue-800">
                  {vendor.email}
                </a>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-gray-600 flex items-center">
                  <FaPhone className="mr-2" />
                  Phone
                </span>
                <a href={`tel:${vendor.phone}`} className="font-medium">
                  {vendor.phone || "N/A"}
                </a>
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaShoppingCart className="mr-2 text-green-600" />
              Business Information
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-gray-600">Business Name</span>
                <span className="font-medium">{vendor.businessName}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-gray-600">Till Number</span>
                <span className="font-medium">{vendor.tillNumber || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-gray-600 flex items-center">
                  <FaMapMarkerAlt className="mr-2" />
                  Address
                </span>
                <div className="text-right">
                  <div className="font-medium">{address.street || "N/A"}</div>
                  <div className="text-sm text-gray-500">
                    {address.city || ""} {address.zipcode ? `, ${address.zipcode}` : ""}
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-gray-600">Coordinates</span>
                <span className="font-mono text-sm">
                  {vendor.location?.coordinates 
                    ? `${vendor.location.coordinates[0].toFixed(4)}, ${vendor.location.coordinates[1].toFixed(4)}`
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-gray-600 flex items-center">
                  <FaCalendarAlt className="mr-2" />
                  Account Created
                </span>
                <span className="font-medium">{formatDateTime(vendor.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Notes */}
        {vendor.note && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2 flex items-center">
              <FaExclamationTriangle className="mr-2" />
              Admin Notes
            </h3>
            <p className="text-yellow-800">{vendor.note}</p>
          </div>
        )}

        {/* Terms Acceptance */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Terms & Conditions</h3>
          <div className="flex items-center">
            <div className={`p-2 rounded-lg mr-3 ${vendor.acceptTerms ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {vendor.acceptTerms ? <FaCheckCircle /> : <FaClock />}
            </div>
            <div>
              <p className="font-medium">{vendor.acceptTerms ? "Terms Accepted" : "Terms Not Accepted"}</p>
              <p className="text-sm text-gray-600">
                {vendor.acceptTerms 
                  ? "Vendor has accepted all terms and conditions" 
                  : "Vendor has not accepted the terms and conditions yet"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFeedbackSection = () => {
    const averageRating = feedbacks.length > 0 
      ? (feedbacks.reduce((sum, f) => sum + f.stars, 0) / feedbacks.length).toFixed(1)
      : 0;

    return (
      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Customer Feedback</h2>
              <p className="text-gray-600 mt-1">What customers are saying about this vendor</p>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">{averageRating}</div>
                <div className="flex items-center justify-center mt-1">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className={`w-5 h-5 ${i < Math.floor(averageRating) ? 'text-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-1">Average Rating</p>
              </div>
              <div className="h-12 w-px bg-gray-300"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{feedbacks.length}</div>
                <p className="text-sm text-gray-600 mt-1">Total Reviews</p>
              </div>
            </div>
          </div>

          {feedbacks.length > 0 ? (
            <div className="space-y-4">
              {feedbacks.map((feedback) => (
                <div key={feedback._id} className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      {feedback.userId?.profileImage ? (
                        <img
                          src={feedback.userId.profileImage}
                          alt={feedback.userId.name}
                          className="w-12 h-12 rounded-full border-2 border-white shadow"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                          {feedback.userId?.name?.charAt(0) || 'U'}
                        </div>
                      )}
                      <div className="ml-4">
                        <h4 className="font-semibold text-gray-900">{feedback.userId?.name || 'Anonymous User'}</h4>
                        <div className="flex items-center mt-1">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <FaStar key={i} className={`w-4 h-4 ${i < feedback.stars ? 'text-yellow-400' : 'text-gray-300'}`} />
                            ))}
                          </div>
                          <span className="ml-2 text-sm text-gray-600">{feedback.stars}.0</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{formatDateTime(feedback.createdAt)}</span>
                  </div>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                    "{feedback.tellUsAboutExperience || 'No comment provided'}"
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaStar className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
              <p className="text-gray-600">This vendor hasn't received any customer feedback yet.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCouponsSection = () => {
    const graphData = [
      { label: "Overall", value: stats.overall, color: "bg-blue-500", hoverColor: "bg-blue-600" },
      { label: "Monthly", value: stats.monthly, color: "bg-green-500", hoverColor: "bg-green-600" },
      { label: "Weekly", value: stats.weekly, color: "bg-yellow-500", hoverColor: "bg-yellow-600" },
      { label: "Daily", value: stats.daily, color: "bg-purple-500", hoverColor: "bg-purple-600" }
    ];
    
    const filteredData = graphFilter === "all" 
      ? graphData 
      : graphData.filter(item => item.label.toLowerCase() === graphFilter);
    
    const maxValue = Math.max(...filteredData.map(item => item.value), 1);

    return (
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {graphData.map((stat, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label} Downloads</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color.replace('bg-', 'bg-').replace('-500', '-100')}`}>
                  <FaDownload className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                </div>
              </div>
              <div className="mt-4">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${stat.color} transition-all duration-500`}
                    style={{ width: `${(stat.value / (stats.overall || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chart Visualization */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Download Trends</h3>
              <p className="text-gray-600 text-sm">Visual representation of coupon downloads</p>
            </div>
            <div className="flex space-x-2 mt-4 md:mt-0">
              {["all", "overall", "monthly", "weekly", "daily"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setGraphFilter(filter)}
                  className={`px-3 py-1 rounded-full text-sm font-medium capitalize transition-colors ${
                    graphFilter === filter
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-end h-48 gap-6 mt-8">
            {filteredData.map((item, index) => (
              <div key={index} className="flex flex-col items-center flex-1 group">
                <div className="w-full">
                  <div
                    className={`${item.color} rounded-t-lg transition-all duration-300 cursor-pointer group-hover:opacity-90`}
                    style={{ height: `${(item.value / maxValue) * 100}%`, minHeight: "20px" }}
                    title={`${item.label}: ${item.value} downloads`}
                  ></div>
                </div>
                <div className="mt-4 text-center">
                  <div className="font-semibold text-gray-900">{item.value}</div>
                  <div className="text-sm text-gray-600 mt-1">{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coupons List */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Active Coupons</h3>
                <p className="text-gray-600 text-sm">Manage and view all vendor coupons</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{coupons.length}</div>
                  <div className="text-sm text-gray-600">Total Coupons</div>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coupon</th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Validity</th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {coupons.map((coupon) => (
                  <tr key={coupon._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        {coupon.couponImage ? (
                          <img
                            src={coupon.couponImage}
                            alt={coupon.name}
                            className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-gradient-to-r from-blue-100 to-blue-50 border border-blue-200 flex items-center justify-center">
                            <FaShoppingCart className="w-8 h-8 text-blue-400" />
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">{coupon.name}</div>
                          <div className="text-sm text-gray-500 capitalize">{coupon.category}</div>
                          <div className="text-xs text-gray-400 mt-1">{coupon._id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-2">
                        <div>
                          <div className="text-sm text-gray-600">Code</div>
                          <div className="font-mono font-medium bg-gray-100 px-2 py-1 rounded inline-block">
                            {coupon.couponCode}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Discount</div>
                          <div className="font-semibold text-green-600">{coupon.discountPercentage}% OFF</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Cost</div>
                          <div className="flex items-center">
                            <span className="font-medium">{coupon.requiredCoins}</span>
                            <FaStar className="w-4 h-4 text-yellow-500 ml-1" />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-2">
                        <div>
                          <div className="text-sm text-gray-600">Valid Until</div>
                          <div className="font-medium">{formatDate(coupon.validityDate)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">User Limit</div>
                          <div className="font-medium">{coupon.limitForSameUser || 'Unlimited'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Created</div>
                          <div className="font-medium">{formatDate(coupon.createdAt)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-2">
                        <div>
                          <div className="text-sm text-gray-600">Downloads</div>
                          <div className="flex items-center">
                            <FaDownload className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="font-medium">{coupon.downloadedCount || 0}</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Redemption Rate</div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${Math.min((coupon.downloadedCount || 0) * 10, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        coupon.status === 'approved' 
                          ? 'bg-green-100 text-green-800' 
                          : coupon.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {coupon.status === 'approved' && <FaCheckCircle className="mr-1" />}
                        {coupon.status.charAt(0).toUpperCase() + coupon.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {coupons.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaShoppingCart className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Coupons Created</h3>
                <p className="text-gray-600">This vendor hasn't created any coupons yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderPaymentsSection = () => {
    const totalPaid = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
    const pendingAmount = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
    const overdueAmount = payments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0);

    return (
      <div className="space-y-6">
        {/* Payment Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Total Paid</p>
                <p className="text-2xl font-bold text-green-900 mt-1">{formatCurrency(totalPaid)}</p>
                <p className="text-xs text-green-600 mt-2">
                  {payments.filter(p => p.status === 'completed').length} completed payments
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FaMoneyBillWave className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700">Pending Payments</p>
                <p className="text-2xl font-bold text-yellow-900 mt-1">{formatCurrency(pendingAmount)}</p>
                <p className="text-xs text-yellow-600 mt-2">
                  {payments.filter(p => p.status === 'pending').length} pending
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <FaClock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700">Overdue Payments</p>
                <p className="text-2xl font-bold text-red-900 mt-1">{formatCurrency(overdueAmount)}</p>
                <p className="text-xs text-red-600 mt-2">
                  {payments.filter(p => p.status === 'overdue').length} overdue
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <FaExclamationTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
                <p className="text-gray-600 text-sm">All payment records for this vendor</p>
              </div>
              <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <FaReceipt className="mr-2" />
                Record New Payment
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Date</th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-900">{payment.month}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-900">{formatCurrency(payment.amount)}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        payment.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : payment.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {payment.status === 'completed' && <FaCheckCircle className="mr-1" />}
                        {payment.status === 'pending' && <FaClock className="mr-1" />}
                        {payment.status === 'overdue' && <FaExclamationTriangle className="mr-1" />}
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-gray-900">{formatDate(payment.paymentDate)}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded inline-block">
                        {payment.transactionId || 'N/A'}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="p-2 bg-gray-100 rounded-lg mr-3">
                          <FaMoneyBillWave className="text-gray-600" />
                        </div>
                        <span className="font-medium">{payment.paymentMethod}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        {payment.status !== 'completed' && (
                          <button className="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded-lg transition-colors" title="Mark as Paid">
                            <FaCheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        <button className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors" title="Send Reminder">
                          <FaEnvelope className="w-5 h-5" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-800 p-2 hover:bg-gray-50 rounded-lg transition-colors" title="View Details">
                          <FaEye className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {payments.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaMoneyBillWave className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Payment Records</h3>
                <p className="text-gray-600">This vendor doesn't have any payment records yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <p className="text-lg font-medium text-gray-700">Loading vendor details...</p>
          <p className="text-gray-500 mt-2">Please wait while we fetch the information</p>
        </div>
      </div>
    );
  }

  if (error && !vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaExclamationTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Error Loading Vendor</h3>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <div className="flex flex-col space-y-3">
            <button
              onClick={() => navigate('/vendorlist')}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Back to Vendors List
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2">
                  <li>
                    <Link to="/dashboard" className="text-gray-400 hover:text-gray-600 transition-colors">
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </li>
                  <li>
                    <Link to="/vendorlist" className="text-gray-400 hover:text-gray-600 transition-colors">
                      Vendors
                    </Link>
                  </li>
                  <li>
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </li>
                  <li>
                    <span className="text-gray-900 font-medium">{vendor.businessName}</span>
                  </li>
                </ol>
              </nav>
              <h1 className="text-3xl font-bold text-gray-900 mt-2">{vendor.businessName}</h1>
              <div className="flex items-center mt-2 space-x-3">
                <div className="flex items-center text-sm text-gray-600">
                  <FaEnvelope className="w-4 h-4 mr-1" />
                  {vendor.email}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <FaPhone className="w-4 h-4 mr-1" />
                  {vendor.phone || "N/A"}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusBadge().color}`}>
                {getStatusBadge().icon}
                {getStatusBadge().text}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === 'profile'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaUserCheck className="mr-2" />
                Profile
              </button>
              <button
                onClick={() => setActiveTab('feedback')}
                className={`flex items-center px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === 'feedback'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaStar className="mr-2" />
                Feedback
                {feedbacks.length > 0 && (
                  <span className="ml-2 bg-gray-100 text-gray-800 text-xs font-medium px-2 py-0.5 rounded-full">
                    {feedbacks.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('coupons')}
                className={`flex items-center px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === 'coupons'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaShoppingCart className="mr-2" />
                Coupons
                {coupons.length > 0 && (
                  <span className="ml-2 bg-gray-100 text-gray-800 text-xs font-medium px-2 py-0.5 rounded-full">
                    {coupons.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={`flex items-center px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === 'payments'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaMoneyBillWave className="mr-2" />
                Payments
                {payments.length > 0 && (
                  <span className="ml-2 bg-gray-100 text-gray-800 text-xs font-medium px-2 py-0.5 rounded-full">
                    {payments.length}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'profile' && renderProfileSection()}
            {activeTab === 'feedback' && renderFeedbackSection()}
            {activeTab === 'coupons' && renderCouponsSection()}
            {activeTab === 'payments' && renderPaymentsSection()}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Note</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}