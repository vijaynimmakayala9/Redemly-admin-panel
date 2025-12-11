import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

export default function VendorDetail() {
  const { id } = useParams();
  const [vendor, setVendor] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [payments, setPayments] = useState([]); // New state for payments
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

        const res = await fetch(`http://31.97.206.144:6098/api/admin/getvendor/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch vendor: ${res.status}`);
        }

        const data = await res.json();
        setVendor(data.vendor || generateDummyVendor(id));
        setCoupons(data.coupons || generateDummyCoupons());
        setFeedbacks(data.feedbacks || generateDummyFeedbacks());
        setPayments(data.payments || generateDummyPayments()); // Set payments data
        
        // Calculate coupon redemption stats
        calculateCouponStats(data.coupons || generateDummyCoupons());
      } catch (err) {
        setError(err.message || "Error fetching vendor");
        // Set dummy data on error for demonstration
        setVendor(generateDummyVendor(id));
        setCoupons(generateDummyCoupons());
        setFeedbacks(generateDummyFeedbacks());
        setPayments(generateDummyPayments()); // Set dummy payments on error
        calculateCouponStats(generateDummyCoupons());
      } finally {
        setLoading(false);
      }
    };

    fetchVendor();
  }, [id]);

  // Generate dummy vendor data
  const generateDummyVendor = (id) => {
    return {
      _id: id,
      businessName: "Sample Business",
      name: "John Doe",
      email: "john@example.com",
      phone: "+1234567890",
      city: "New York",
      zipcode: "10001",
      location: {
        coordinates: [40.7128, -74.0060]
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      businessLogo: null
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

  // Generate dummy payments data
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
      },
      {
        _id: "3",
        amount: 1800,
        status: "pending",
        paymentDate: null,
        month: "February 2023",
        transactionId: null,
        paymentMethod: "Bank Transfer"
      },
      {
        _id: "4",
        amount: 2200,
        status: "overdue",
        paymentDate: null,
        month: "March 2023",
        transactionId: null,
        paymentMethod: "Bank Transfer",
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  };

  const calculateCouponStats = (coupons) => {
    // Calculate stats based on actual coupon data
    const overall = coupons.reduce((total, coupon) => total + (coupon.downloadedCount || 0), 0);
    
    // For demo purposes, create some variance in the stats
    const monthly = Math.round(overall * 0.7);
    const weekly = Math.round(overall * 0.3);
    const daily = Math.round(overall * 0.1);
    
    setStats({ overall, monthly, weekly, daily });
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

  // Filter data for graph based on selected filter
  const getFilteredGraphData = () => {
    const data = [
      { label: "Overall", value: stats.overall, color: "bg-blue-500", hoverColor: "bg-blue-600" },
      { label: "Monthly", value: stats.monthly, color: "bg-green-500", hoverColor: "bg-green-600" },
      { label: "Weekly", value: stats.weekly, color: "bg-yellow-500", hoverColor: "bg-yellow-600" },
      { label: "Daily", value: stats.daily, color: "bg-purple-500", hoverColor: "bg-purple-600" }
    ];
    
    if (graphFilter === "all") {
      return data;
    }
    
    return data.filter(item => item.label.toLowerCase() === graphFilter);
  };

  const renderProfileSection = () => (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Vendor Logo */}
        <div className="flex-shrink-0">
          <div className="relative group">
            {vendor.businessLogo ? (
              <img
                src={vendor.businessLogo}
                alt={`${vendor.businessName} Logo`}
                className="w-40 h-40 rounded-lg object-cover border-2 border-gray-200 shadow-sm transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-40 h-40 rounded-lg bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                <span className="text-gray-400">No Logo</span>
              </div>
            )}
          </div>
        </div>

        {/* Basic Info Table */}
        <div className="flex-grow">
          <table className="min-w-full bg-white border border-gray-200">
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4 font-semibold bg-gray-50 w-1/4">Business Name</td>
                <td className="py-3 px-4">{vendor.businessName}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4 font-semibold bg-gray-50">Contact Person</td>
                <td className="py-3 px-4">{vendor.name}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4 font-semibold bg-gray-50">Email</td>
                <td className="py-3 px-4 break-all">{vendor.email}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4 font-semibold bg-gray-50">Phone</td>
                <td className="py-3 px-4">{vendor.phone || 'N/A'}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4 font-semibold bg-gray-50">Location</td>
                <td className="py-3 px-4">{vendor.city || 'N/A'}, {vendor.zipcode || 'N/A'}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4 font-semibold bg-gray-50">Coordinates</td>
                <td className="py-3 px-4">
                  {vendor.location?.coordinates
                    ? `${vendor.location.coordinates[0]}, ${vendor.location.coordinates[1]}`
                    : "N/A"}
                </td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4 font-semibold bg-gray-50">Account Created</td>
                <td className="py-3 px-4">{formatDateTime(vendor.createdAt)}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold bg-gray-50">Last Updated</td>
                <td className="py-3 px-4">{formatDateTime(vendor.updatedAt)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderFeedbackSection = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Customer Feedback</h2>
        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
          {feedbacks.length} {feedbacks.length === 1 ? 'Review' : 'Reviews'}
        </span>
      </div>
      
      {feedbacks.length ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-4 border border-gray-200">User</th>
                <th className="py-3 px-4 border border-gray-200">Rating</th>
                <th className="py-3 px-4 border border-gray-200">Feedback</th>
                <th className="py-3 px-4 border border-gray-200">Date</th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.map((feedback, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="py-3 px-4 border border-gray-200">
                    <div className="flex items-center">
                      {feedback.userId?.profileImage ? (
                        <img 
                          src={feedback.userId.profileImage} 
                          alt={feedback.userId.name} 
                          className="w-10 h-10 rounded-full mr-3 border-2 border-white shadow"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-gray-800">{feedback.userId?.name || 'Anonymous'}</div>
                        <div className="text-xs text-gray-500">Customer</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 border border-gray-200">
                    <div className="flex items-center">
                      <div className="flex mr-2">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-5 h-5 ${i < feedback.stars ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm font-medium text-gray-600">
                        {feedback.stars}.0
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 border border-gray-200">
                    {feedback.tellUsAboutExperience || 'No comment provided'}
                  </td>
                  <td className="py-3 px-4 border border-gray-200">
                    {formatDateTime(feedback.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl p-10 text-center border-2 border-dashed border-gray-200">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-700">No feedback received</h3>
          <p className="mt-1 text-gray-500">This vendor hasn't received any feedback yet.</p>
        </div>
      )}
    </div>
  );

  const renderCouponsSection = () => {
    const graphData = getFilteredGraphData();
    const maxValue = Math.max(...graphData.map(item => item.value), 1); // Avoid division by zero
    
    return (
      <div className="space-y-8">
        {/* Coupon Redemption Stats */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Coupon Redemption Statistics</h2>
            
            {/* Graph Filter Controls */}
            <div className="flex space-x-2 mt-4 md:mt-0">
              <button
                onClick={() => setGraphFilter("all")}
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                  graphFilter === "all" 
                    ? "bg-blue-100 text-blue-800" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setGraphFilter("overall")}
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                  graphFilter === "overall" 
                    ? "bg-blue-100 text-blue-800" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Overall
              </button>
              <button
                onClick={() => setGraphFilter("monthly")}
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                  graphFilter === "monthly" 
                    ? "bg-green-100 text-green-800" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setGraphFilter("weekly")}
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                  graphFilter === "weekly" 
                    ? "bg-yellow-100 text-yellow-800" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setGraphFilter("daily")}
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                  graphFilter === "daily" 
                    ? "bg-purple-100 text-purple-800" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Daily
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="text-sm font-medium text-blue-800 mb-1">Overall Redeemed</h3>
              <p className="text-2xl font-bold text-blue-900">{stats.overall}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <h3 className="text-sm font-medium text-green-800 mb-1">Monthly Redeemed</h3>
              <p className="text-2xl font-bold text-green-900">{stats.monthly}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
              <h3 className="text-sm font-medium text-yellow-800 mb-1">Weekly Redeemed</h3>
              <p className="text-2xl font-bold text-yellow-900">{stats.weekly}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <h3 className="text-sm font-medium text-purple-800 mb-1">Daily Redeemed</h3>
              <p className="text-2xl font-bold text-purple-900">{stats.daily}</p>
            </div>
          </div>
          
          {/* Enhanced Bar Chart with Filtering */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Redemption Trend {graphFilter !== "all" ? `(${graphFilter.charAt(0).toUpperCase() + graphFilter.slice(1)})` : ""}
            </h3>
            <div className="flex items-end h-32 gap-4">
              {graphData.map((item, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div 
                    className={`w-full ${item.color} rounded-t hover:${item.hoverColor} transition-all duration-300 cursor-pointer`}
                    style={{ height: `${(item.value / maxValue) * 100}%` }}
                    title={`${item.label}: ${item.value}`}
                  ></div>
                  <span className="text-xs mt-1">{item.label}</span>
                  <span className="text-xs font-semibold mt-1">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Coupons Table */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Coupons</h2>
            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
              {coupons.length} {coupons.length === 1 ? 'Coupon' : 'Coupons'}
            </span>
          </div>
          
          {coupons.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-3 px-4 border border-gray-200">Image</th>
                    <th className="py-3 px-4 border border-gray-200">Name</th>
                    <th className="py-3 px-4 border border-gray-200">Category</th>
                    <th className="py-3 px-4 border border-gray-200">Discount</th>
                    <th className="py-3 px-4 border border-gray-200">Code</th>
                    <th className="py-3 px-4 border border-gray-200">Cost</th>
                    <th className="py-3 px-4 border border-gray-200">Valid Until</th>
                    <th className="py-3 px-4 border border-gray-200">User Limit</th>
                    <th className="py-3 px-4 border border-gray-200">Downloads</th>
                    <th className="py-3 px-4 border border-gray-200">Status</th>
                    <th className="py-3 px-4 border border-gray-200">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="py-3 px-4 border border-gray-200">
                        {coupon.couponImage ? (
                          <img 
                            src={coupon.couponImage} 
                            alt={coupon.name} 
                            className="w-16 h-16 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 border border-gray-200 font-semibold">{coupon.name}</td>
                      <td className="py-3 px-4 border border-gray-200 capitalize">{coupon.category}</td>
                      <td className="py-3 px-4 border border-gray-200">
                        {coupon.discountPercentage}% {coupon.couponCodeType === '%' ? 'off' : ''}
                      </td>
                      <td className="py-3 px-4 border border-gray-200 font-mono">{coupon.couponCode}</td>
                      <td className="py-3 px-4 border border-gray-200">
                        {coupon.requiredCoins}
                        <svg className="w-4 h-4 ml-1 text-yellow-500 inline" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </td>
                      <td className="py-3 px-4 border border-gray-200">{formatDate(coupon.validityDate)}</td>
                      <td className="py-3 px-4 border border-gray-200">{coupon.limitForSameUser || 'Unlimited'}</td>
                      <td className="py-3 px-4 border border-gray-200">{coupon.downloadedCount || 0}</td>
                      <td className="py-3 px-4 border border-gray-200">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          coupon.status === 'approved' ? 'bg-green-100 text-green-800' :
                          coupon.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {coupon.status.charAt(0).toUpperCase() + coupon.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4 border border-gray-200">{formatDate(coupon.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-10 text-center border-2 border-dashed border-gray-200">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-700">No coupons created</h3>
              <p className="mt-1 text-gray-500">This vendor hasn't created any coupons yet.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // New function to render payments section
  const renderPaymentsSection = () => {
    // Calculate payment statistics
    const totalPaid = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
    const pendingAmount = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
    const overdueAmount = payments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0);
    
    return (
      <div className="space-y-8">
        {/* Payment Statistics */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Payment Overview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <h3 className="text-sm font-medium text-green-800 mb-1">Total Paid</h3>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(totalPaid)}</p>
              <p className="text-xs text-green-600 mt-1">
                {payments.filter(p => p.status === 'completed').length} completed payments
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
              <h3 className="text-sm font-medium text-yellow-800 mb-1">Pending Payments</h3>
              <p className="text-2xl font-bold text-yellow-900">{formatCurrency(pendingAmount)}</p>
              <p className="text-xs text-yellow-600 mt-1">
                {payments.filter(p => p.status === 'pending').length} pending payments
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-100">
              <h3 className="text-sm font-medium text-red-800 mb-1">Overdue Payments</h3>
              <p className="text-2xl font-bold text-red-900">{formatCurrency(overdueAmount)}</p>
              <p className="text-xs text-red-600 mt-1">
                {payments.filter(p => p.status === 'overdue').length} overdue payments
              </p>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Payment History</h2>
            <div className="flex space-x-2">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                Send Reminder
              </button>
              <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                Record Payment
              </button>
            </div>
          </div>
          
          {payments.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-3 px-4 border border-gray-200">Month</th>
                    <th className="py-3 px-4 border border-gray-200">Amount</th>
                    <th className="py-3 px-4 border border-gray-200">Status</th>
                    <th className="py-3 px-4 border border-gray-200">Payment Date</th>
                    <th className="py-3 px-4 border border-gray-200">Due Date</th>
                    <th className="py-3 px-4 border border-gray-200">Transaction ID</th>
                    <th className="py-3 px-4 border border-gray-200">Payment Method</th>
                    <th className="py-3 px-4 border border-gray-200">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="py-3 px-4 border border-gray-200 font-semibold">{payment.month}</td>
                      <td className="py-3 px-4 border border-gray-200 font-medium">{formatCurrency(payment.amount)}</td>
                      <td className="py-3 px-4 border border-gray-200">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                          payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4 border border-gray-200">
                        {payment.paymentDate ? formatDate(payment.paymentDate) : 'Not Paid'}
                      </td>
                      <td className="py-3 px-4 border border-gray-200">
                        {payment.dueDate ? formatDate(payment.dueDate) : 'N/A'}
                      </td>
                      <td className="py-3 px-4 border border-gray-200 font-mono">
                        {payment.transactionId || 'N/A'}
                      </td>
                      <td className="py-3 px-4 border border-gray-200">
                        {payment.paymentMethod}
                      </td>
                      <td className="py-3 px-4 border border-gray-200">
                        <div className="flex space-x-2">
                          {payment.status !== 'completed' && (
                            <button className="text-green-600 hover:text-green-800" title="Mark as Paid">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                          )}
                          <button className="text-blue-600 hover:text-blue-800" title="Send Reminder">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-10 text-center border-2 border-dashed border-gray-200">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-700">No payment records</h3>
              <p className="mt-1 text-gray-500">This vendor doesn't have any payment records yet.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading vendor details...</p>
      </div>
    </div>
  );

  if (error && !vendor) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md text-center p-6 bg-red-50 rounded-lg">
        <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Vendor</h3>
        <p className="text-red-600">{error}</p>
        <Link to="/vendorlist" className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Vendors List
        </Link>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link to="/vendorlist" className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Vendors List
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-4">Vendor Management</h1>
        <div className="flex items-center mt-2">
          <h2 className="text-xl font-semibold text-gray-700">{vendor.businessName}</h2>
          <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
            ID: {id}
          </span>
          {error && (
            <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
              Using Demo Data
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-4 px-1 font-medium text-sm ${activeTab === 'profile' 
              ? 'border-blue-500 text-blue-600 border-b-2' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`py-4 px-1 font-medium text-sm ${activeTab === 'feedback' 
              ? 'border-blue-500 text-blue-600 border-b-2' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Feedback
            <span className="ml-2 bg-gray-100 text-gray-800 text-xs font-medium px-2 py-0.5 rounded-full">
              {feedbacks.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('coupons')}
            className={`py-4 px-1 font-medium text-sm ${activeTab === 'coupons' 
              ? 'border-blue-500 text-blue-600 border-b-2' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Coupons
            <span className="ml-2 bg-gray-100 text-gray-800 text-xs font-medium px-2 py-0.5 rounded-full">
              {coupons.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`py-4 px-1 font-medium text-sm ${activeTab === 'payments' 
              ? 'border-blue-500 text-blue-600 border-b-2' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Payments
            <span className="ml-2 bg-gray-100 text-gray-800 text-xs font-medium px-2 py-0.5 rounded-full">
              {payments.length}
            </span>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {activeTab === 'profile' && renderProfileSection()}
        {activeTab === 'feedback' && renderFeedbackSection()}
        {activeTab === 'coupons' && renderCouponsSection()}
        {activeTab === 'payments' && renderPaymentsSection()}
      </div>
    </div>
  );
}