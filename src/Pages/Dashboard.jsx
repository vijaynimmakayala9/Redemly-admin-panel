import { useState, useEffect } from "react";
import {
  FiUsers,
  FiTag,
  FiShoppingBag,
  FiGrid,
  FiPlusCircle,
  FiActivity,
  FiBarChart2,
  FiTrendingUp,
  FiCalendar,
  FiClock,
  FiStar,
  FiChevronRight,
  FiDollarSign,
  FiShoppingCart,
  FiLayers,
} from "react-icons/fi";
import { 
  AreaChart, 
  Area, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip,
  Cell,
  CartesianGrid
} from "recharts";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [revenueFilter, setRevenueFilter] = useState("weekly");
  const [redemptionFilter, setRedemptionFilter] = useState("weekly");
  const [restaurantFilter, setRestaurantFilter] = useState("weekly");
  const [topRestaurantsFilter, setTopRestaurantsFilter] = useState("weekly");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentRestPage, setCurrentRestPage] = useState(1);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  const navigate = useNavigate();

  const usersPerPage = 5;
  const restaurantsPerPage = 5;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch("https://api.redemly.com/api/admin/dashboard");
        
        if (!response.ok) {
          throw new Error(`Failed to fetch dashboard data: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          setDashboardData(data.data);
        } else {
          throw new Error("API returned unsuccessful response");
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // API से मिले डेटा को चार्ट के लिए फॉर्मेट करें
  const formatEarningsData = (data) => {
    if (!data) return [];
    
    const formatted = data.map(item => ({
      name: item.day || item.week,
      revenue: item.revenue || 0
    }));
    
    return formatted;
  };

  const formatRedemptionData = (data) => {
    if (!data) return [];
    
    const formatted = data.map(item => ({
      name: item.day || item.week,
      redeemed: item.redeemed || 0
    }));
    
    return formatted;
  };

  const formatRestaurantData = (data) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return [{ name: "No Data", redeemed: 0 }];
    }
    
    return data.map((item, index) => ({
      name: item.name || `Restaurant ${index + 1}`,
      redeemed: item.redeemed || 0
    }));
  };

  const formatTopRestaurantsData = (data) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return [{ name: "No Data", revenue: 0, coupons: 0 }];
    }
    
    return data.slice(0, 10).map((item, index) => ({
      name: item.name || `Restaurant ${index + 1}`,
      revenue: item.revenue || 0,
      coupons: item.coupons || 0
    }));
  };

  // Stat cards navigation configuration
  const statCardsConfig = [
    {
      icon: FiUsers,
      label: "Total Users",
      value: dashboardData?.totals?.users || 0,
      color: "blue",
      path: "/users",
      gradient: "from-blue-500 to-blue-600",
      hoverGradient: "from-blue-600 to-blue-700",
      description: "View all registered users"
    },
    {
      icon: FiTag,
      label: "Total Coupons",
      value: dashboardData?.totals?.coupons || 0,
      color: "green",
      path: "/coupons",
      gradient: "from-green-500 to-emerald-600",
      hoverGradient: "from-green-600 to-emerald-700",
      description: "Manage all coupon offers"
    },
    {
      icon: FiShoppingBag,
      label: "Total Vendors",
      value: dashboardData?.totals?.vendors || 0,
      color: "purple",
      path: "/vendorlist",
      gradient: "from-purple-500 to-violet-600",
      hoverGradient: "from-purple-600 to-violet-700",
      description: "Manage restaurant vendors"
    },
    {
      icon: FiGrid,
      label: "Total Categories",
      value: dashboardData?.totals?.categories || 0,
      color: "amber",
      path: "/categorylist",
      gradient: "from-amber-500 to-orange-600",
      hoverGradient: "from-amber-600 to-orange-700",
      description: "Browse product categories"
    }
  ];

  const todayStatsConfig = [
    {
      icon: FiPlusCircle,
      label: "Today's Coupons",
      value: dashboardData?.todayStats?.todaysCoupons || 0,
      color: "orange",
      path: "/coupons?filter=today",
      gradient: "from-orange-500 to-red-500",
      hoverGradient: "from-orange-600 to-red-600",
      description: "Coupons created today"
    },
    {
      icon: FiActivity,
      label: "Redeemed Coupons",
      value: dashboardData?.todayStats?.redeemedCouponsToday || 0,
      color: "rose",
      path: "/redeemed-coupons",
      gradient: "from-rose-500 to-pink-600",
      hoverGradient: "from-rose-600 to-pink-700",
      description: "Coupons redeemed today"
    },
    {
      icon: FiDollarSign,
      label: "Revenue from Coupons",
      value: `₹${dashboardData?.todayStats?.revenueToday || 0}`,
      color: "emerald",
      path: "/dashboard",
      gradient: "from-emerald-500 to-teal-600",
      hoverGradient: "from-emerald-600 to-teal-700",
      description: "Today's total revenue"
    }
  ];

  const activeUsersConfig = [
    {
      icon: FiClock,
      label: "Daily Active Users",
      value: dashboardData?.activeUsers?.daily || 0,
      color: "blue",
      path: "/users",
      gradient: "from-blue-400 to-cyan-500",
      hoverGradient: "from-blue-500 to-cyan-600",
      description: "Users active today"
    },
    {
      icon: FiTrendingUp,
      label: "Weekly Active Users",
      value: dashboardData?.activeUsers?.weekly || 0,
      color: "green",
      path: "/users",
      gradient: "from-green-400 to-lime-500",
      hoverGradient: "from-green-500 to-lime-600",
      description: "Users active this week"
    },
    {
      icon: FiCalendar,
      label: "Monthly Active Users",
      value: dashboardData?.activeUsers?.monthly || 0,
      color: "purple",
      path: "/users",
      gradient: "from-purple-400 to-indigo-500",
      hoverGradient: "from-purple-500 to-indigo-600",
      description: "Users active this month"
    }
  ];

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-purple-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-24 h-24 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="mt-6 text-xl font-semibold text-gray-700">Loading Dashboard...</p>
        <p className="text-gray-500">Fetching latest analytics</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-red-100 p-6 rounded-2xl shadow-lg max-w-md text-center">
          <div className="text-5xl text-red-500 mb-4">⚠️</div>
          <h3 className="text-2xl font-bold text-red-700 mb-2">Error Loading Dashboard</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="text-5xl text-gray-400 mb-4">📊</div>
          <p className="text-xl text-gray-600">No dashboard data available</p>
        </div>
      </div>
    );
  }

  // Pagination logic for users
  const userInsightsData = dashboardData.tables?.userInsightsData || [];
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = userInsightsData.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(userInsightsData.length / usersPerPage);

  // Pagination logic for restaurants
  const restaurantInsightsData = dashboardData.tables?.restaurantInsightsData || [];
  const indexOfLastRest = currentRestPage * restaurantsPerPage;
  const indexOfFirstRest = indexOfLastRest - restaurantsPerPage;
  const currentRestaurants = restaurantInsightsData.slice(indexOfFirstRest, indexOfLastRest);
  const totalRestPages = Math.ceil(restaurantInsightsData.length / restaurantsPerPage);

  // Chart data preparation
  const earningsChartData = formatEarningsData(dashboardData.charts?.earningsData?.[revenueFilter] || []);
  const redemptionChartData = formatRedemptionData(dashboardData.charts?.redemptionData?.[redemptionFilter] || []);
  const restaurantChartData = formatRestaurantData(dashboardData.charts?.restaurantRedemptionData?.[restaurantFilter] || []);
  const topRestaurantsChartData = formatTopRestaurantsData(dashboardData.charts?.topRestaurantsData?.[topRestaurantsFilter] || []);

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Analytics Dashboard
        </h1>
        <p className="text-gray-500 mt-2">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Top Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {statCardsConfig.map((stat, index) => (
          <ClickableStatCard
            key={index}
            {...stat}
            isHovered={hoveredCard === `stat-${index}`}
            onMouseEnter={() => setHoveredCard(`stat-${index}`)}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => navigate(stat.path)}
          />
        ))}
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
        {todayStatsConfig.map((stat, index) => (
          <ClickableStatCard
            key={index}
            {...stat}
            isHovered={hoveredCard === `today-${index}`}
            onMouseEnter={() => setHoveredCard(`today-${index}`)}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => navigate(stat.path)}
          />
        ))}
      </div>

      {/* Active Users Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
        {activeUsersConfig.map((stat, index) => (
          <ClickableStatCard
            key={index}
            {...stat}
            isHovered={hoveredCard === `active-${index}`}
            onMouseEnter={() => setHoveredCard(`active-${index}`)}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => navigate(stat.path)}
          />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 md:p-6 transition-transform hover:shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Revenue Overview</h3>
              <p className="text-gray-500 text-sm">Track your earnings over time</p>
            </div>
            <select
              className="border border-gray-300 rounded-xl px-4 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={revenueFilter}
              onChange={(e) => setRevenueFilter(e.target.value)}
            >
              <option value="today">Today</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={earningsChartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value) => [`₹${value}`, 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fill="url(#colorRevenue)"
                  dot={{ stroke: '#3b82f6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Redemption Trends Chart */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 md:p-6 transition-transform hover:shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Redemption Trends</h3>
              <p className="text-gray-500 text-sm">Coupon redemption patterns</p>
            </div>
            <select
              className="border border-gray-300 rounded-xl px-4 py-2 text-sm bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={redemptionFilter}
              onChange={(e) => setRedemptionFilter(e.target.value)}
            >
              <option value="today">Today</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={redemptionChartData}>
                <defs>
                  <linearGradient id="colorRedeem" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="redeemed"
                  stroke="#10b981"
                  strokeWidth={3}
                  fill="url(#colorRedeem)"
                  dot={{ stroke: '#10b981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Restaurant Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
        {/* Restaurant Performance Chart */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 md:p-6 transition-transform hover:shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Restaurant Performance</h3>
              <p className="text-gray-500 text-sm">Redemption across venues</p>
            </div>
            <select
              className="border border-gray-300 rounded-xl px-4 py-2 text-sm bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={restaurantFilter}
              onChange={(e) => setRestaurantFilter(e.target.value)}
            >
              <option value="today">Today</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="h-80">
            {restaurantChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={restaurantChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar
                    dataKey="redeemed"
                    name="Coupons Redeemed"
                    radius={[8, 8, 0, 0]}
                  >
                    {restaurantChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index % 2 === 0 ? '#8884d8' : '#a78bfa'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <FiShoppingBag className="text-4xl mb-2" />
                <p>No restaurant data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Performing Restaurants Chart */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 md:p-6 transition-transform hover:shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Top Performing Restaurants</h3>
              <p className="text-gray-500 text-sm">Revenue vs Coupons Redeemed</p>
            </div>
            <select
              className="border border-gray-300 rounded-xl px-4 py-2 text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              value={topRestaurantsFilter}
              onChange={(e) => setTopRestaurantsFilter(e.target.value)}
            >
              <option value="today">Today</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="h-80">
            {topRestaurantsChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topRestaurantsChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    formatter={(value, name) => {
                      if (name === 'Revenue') return [`₹${value}`, name];
                      return [value, name];
                    }}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="revenue"
                    name="Revenue"
                    radius={[8, 8, 0, 0]}
                    fill="#8884d8"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="coupons"
                    name="Coupons Redeemed"
                    radius={[8, 8, 0, 0]}
                    fill="#82ca9d"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <FiStar className="text-4xl mb-2" />
                <p>No top restaurant data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Activity Insights Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 md:p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">User Activity Insights</h3>
            <p className="text-gray-500">Detailed user engagement metrics</p>
          </div>
          {userInsightsData.length > 0 && (
            <button 
              onClick={() => navigate("/users")}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md"
            >
              View All Users
              <FiChevronRight className="ml-2" />
            </button>
          )}
        </div>
        
        {userInsightsData.length > 0 ? (
          <>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="min-w-full text-sm">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">User</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Last Login</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Account Created</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Offer Redeemed</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Activities</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map((user, idx) => (
                    <tr 
                      key={idx} 
                      className="border-t border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/user/${user.id || idx}`)}
                    >
                      <td className="px-6 py-4 font-medium">{user.user}</td>
                      <td className="px-6 py-4">{user.lastLogin}</td>
                      <td className="px-6 py-4">{user.accountCreated}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          {user.offerRedeemed}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-xs">
                            <span className="font-medium">Steps:</span> {user.activities?.steps || 0}
                          </div>
                          <div className="text-xs">
                            <span className="font-medium">Quiz:</span> {user.activities?.quiz || 0}
                          </div>
                          <div className="text-xs">
                            <span className="font-medium">News:</span> {user.activities?.news || 0}
                          </div>
                          <div className="text-xs">
                            <span className="font-medium">Facts:</span> {user.activities?.facts || 0}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6">
                <p className="text-gray-500">
                  Showing {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, userInsightsData.length)} of {userInsightsData.length} users
                </p>
                <div className="flex space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-4 py-2 rounded-lg transition-all ${
                        currentPage === i + 1 
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md" 
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FiUsers className="text-4xl mx-auto mb-2" />
            <p>No user data available</p>
          </div>
        )}
      </div>

      {/* Restaurant Insights Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 md:p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Restaurant Insights</h3>
            <p className="text-gray-500">Performance metrics for restaurant partners</p>
          </div>
          {restaurantInsightsData.length > 0 && (
            <button 
              onClick={() => navigate("/vendorlist")}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all shadow-md"
            >
              View All Restaurants
              <FiChevronRight className="ml-2" />
            </button>
          )}
        </div>
        
        {restaurantInsightsData.length > 0 ? (
          <>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="min-w-full text-sm">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Restaurant</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Redemption</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Avg Rating</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Active Offer</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Joined Date</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRestaurants.map((rest, idx) => (
                    <tr 
                      key={idx} 
                      className="border-t border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/vendor/${rest.id || idx}`)}
                    >
                      <td className="px-6 py-4 font-medium">{rest.restaurant}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                          {rest.redemption}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <FiStar className="text-yellow-500 mr-1" />
                          {rest.avgRating || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          rest.activeOffer === 1 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {rest.activeOffer === 1 ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-4">{rest.joinedDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalRestPages > 1 && (
              <div className="flex justify-between items-center mt-6">
                <p className="text-gray-500">
                  Showing {indexOfFirstRest + 1}-{Math.min(indexOfLastRest, restaurantInsightsData.length)} of {restaurantInsightsData.length} restaurants
                </p>
                <div className="flex space-x-2">
                  {Array.from({ length: totalRestPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentRestPage(i + 1)}
                      className={`px-4 py-2 rounded-lg transition-all ${
                        currentRestPage === i + 1 
                          ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md" 
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FiShoppingBag className="text-4xl mx-auto mb-2" />
            <p>No restaurant data available</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-xl p-6 md:p-8">
        <h3 className="text-2xl font-bold text-white mb-6">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate("/create-coupon")}
            className="group bg-white hover:bg-gray-50 text-gray-800 py-4 px-4 rounded-xl flex flex-col items-center justify-center transition-all hover:shadow-xl hover:-translate-y-1"
          >
            <FiPlusCircle className="text-3xl text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="font-semibold">Create Coupon</span>
            <span className="text-xs text-gray-500 mt-1">Add new offers</span>
          </button>
          <button
            onClick={() => navigate("/vendorlist")}
            className="group bg-white hover:bg-gray-50 text-gray-800 py-4 px-4 rounded-xl flex flex-col items-center justify-center transition-all hover:shadow-xl hover:-translate-y-1"
          >
            <FiShoppingBag className="text-3xl text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="font-semibold">Manage Vendors</span>
            <span className="text-xs text-gray-500 mt-1">View restaurants</span>
          </button>
          <button
            onClick={() => navigate("/create-category")}
            className="group bg-white hover:bg-gray-50 text-gray-800 py-4 px-4 rounded-xl flex flex-col items-center justify-center transition-all hover:shadow-xl hover:-translate-y-1"
          >
            <FiLayers className="text-3xl text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="font-semibold">Add Category</span>
            <span className="text-xs text-gray-500 mt-1">Create new</span>
          </button>
          <button
            onClick={() => navigate("/coupons")}
            className="group bg-white hover:bg-gray-50 text-gray-800 py-4 px-4 rounded-xl flex flex-col items-center justify-center transition-all hover:shadow-xl hover:-translate-y-1"
          >
            <FiTag className="text-3xl text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="font-semibold">View Coupons</span>
            <span className="text-xs text-gray-500 mt-1">All offers</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Clickable Stat Card Component
const ClickableStatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  gradient, 
  hoverGradient, 
  description, 
  isHovered, 
  onClick,
  onMouseEnter,
  onMouseLeave 
}) => {
  return (
    <div
      className="relative bg-white rounded-2xl shadow-lg border border-gray-200 p-5 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 ${isHovered ? 'opacity-10' : ''} transition-opacity`}></div>
      
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} ${isHovered ? 'opacity-100' : 'opacity-0'} transition-opacity`}></div>
      
      <div className="relative flex items-center justify-between">
        <div className="flex items-center">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-md`}>
            <Icon className="text-2xl" />
          </div>
          <div className="ml-4">
            <p className="text-gray-500 text-sm font-medium">{label}</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
            <p className="text-gray-400 text-xs mt-1">{description}</p>
          </div>
        </div>
        
        <div className={`transition-transform ${isHovered ? 'translate-x-1' : ''}`}>
          <FiChevronRight className={`text-gray-400 ${isHovered ? 'text-gray-600' : ''}`} />
        </div>
      </div>
      
      <div className={`absolute bottom-2 right-4 text-xs text-gray-400 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
        Click to view →
      </div>
    </div>
  );
};

export default Dashboard;