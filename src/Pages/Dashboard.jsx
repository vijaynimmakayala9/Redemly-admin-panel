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
  FiCoffee,
} from "react-icons/fi";
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
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

  const navigate = useNavigate();

  const usersPerPage = 5;
  const restaurantsPerPage = 5;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("http://31.97.206.144:6098/api/admin/dashboard");
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }
        const data = await response.json();
        setDashboardData(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;
  }

  if (!dashboardData) {
    return <div className="flex justify-center items-center h-screen">No data available</div>;
  }

  // Pagination logic for users
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = dashboardData.tables.userInsightsData.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(dashboardData.tables.userInsightsData.length / usersPerPage);

  // Pagination logic for restaurants
  const indexOfLastRest = currentRestPage * restaurantsPerPage;
  const indexOfFirstRest = indexOfLastRest - restaurantsPerPage;
  const currentRestaurants = dashboardData.tables.restaurantInsightsData.slice(indexOfFirstRest, indexOfLastRest);
  const totalRestPages = Math.ceil(dashboardData.tables.restaurantInsightsData.length / restaurantsPerPage);

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      {/* Top Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={FiUsers} label="Total Users" value={dashboardData.totals.users} color="blue" />
        <StatCard icon={FiTag} label="Total Coupons" value={dashboardData.totals.coupons} color="green" />
        <StatCard icon={FiShoppingBag} label="Total Vendors" value={dashboardData.totals.vendors} color="purple" />
        <StatCard icon={FiGrid} label="Total Categories" value={dashboardData.totals.categories} color="yellow" />
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard icon={FiPlusCircle} label="Today's Coupons" value={dashboardData.todayStats.todaysCoupons} color="orange" />
        <StatCard icon={FiActivity} label="Redeemed Coupons" value={dashboardData.todayStats.redeemedCouponsToday} color="red" />
        <StatCard icon={FiBarChart2} label="Revenue from Coupons" value={`₹${dashboardData.todayStats.revenueToday}`} color="emerald" />
      </div>

      {/* Active Users Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard icon={FiClock} label="Daily Active Users" value={dashboardData.activeUsers.daily} color="blue" />
        <StatCard icon={FiTrendingUp} label="Weekly Active Users" value={dashboardData.activeUsers.weekly} color="green" />
        <StatCard icon={FiCalendar} label="Monthly Active Users" value={dashboardData.activeUsers.monthly} color="purple" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-semibold">Revenue</h3>
            <select
              className="border border-gray-300 rounded px-2 py-1 text-sm"
              value={revenueFilter}
              onChange={(e) => setRevenueFilter(e.target.value)}
            >
              <option value="today">Today</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboardData.charts.earningsData[revenueFilter]}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#colorRevenue)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Redemption Trends Chart */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-semibold">Coupon Redemption Trends</h3>
            <select
              className="border border-gray-300 rounded px-2 py-1 text-sm"
              value={redemptionFilter}
              onChange={(e) => setRedemptionFilter(e.target.value)}
            >
              <option value="today">Today</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboardData.charts.redemptionData[redemptionFilter]}>
                <defs>
                  <linearGradient id="colorRedeem" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="redeemed"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#colorRedeem)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* New Restaurant Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Redemption at Restaurants Chart */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-semibold">Redemption at Restaurants</h3>
            <select
              className="border border-gray-300 rounded px-2 py-1 text-sm"
              value={restaurantFilter}
              onChange={(e) => setRestaurantFilter(e.target.value)}
            >
              <option value="today">Today</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dashboardData.charts.restaurantRedemptionData[restaurantFilter]}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar
                  dataKey="redeemed"
                  name="Coupons Redeemed"
                  fill="#8884d8"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 10 Performing Restaurants Chart */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-semibold">Top Performing Restaurants</h3>
            <select
              className="border border-gray-300 rounded px-2 py-1 text-sm"
              value={topRestaurantsFilter}
              onChange={(e) => setTopRestaurantsFilter(e.target.value)}
            >
              <option value="today">Today</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dashboardData.charts.topRestaurantsData[topRestaurantsFilter].slice(0, 10)}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar
                  yAxisId="left"
                  dataKey="revenue"
                  name="Revenue (₹)"
                  fill="#8884d8"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  yAxisId="right"
                  dataKey="coupons"
                  name="Coupons Redeemed"
                  fill="#82ca9d"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* User Activity Insights Table */}
      <div className="bg-white rounded-lg shadow-md p-4 mt-6">
        <h3 className="text-2xl font-bold mb-4">User Activity Insights</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-2">User</th>
                <th className="px-4 py-2">Last Login</th>
                <th className="px-4 py-2">Account Created</th>
                <th className="px-4 py-2">Offer Redeemed</th>
                <th className="px-4 py-2">Review Given</th>
                <th className="px-4 py-2">Steps</th>
                <th className="px-4 py-2">Quiz</th>
                <th className="px-4 py-2">News</th>
                <th className="px-4 py-2">Facts</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-4 py-2">{user.user}</td>
                  <td className="px-4 py-2">{user.lastLogin}</td>
                  <td className="px-4 py-2">{user.accountCreated}</td>
                  <td className="px-4 py-2">{user.offerRedeemed}</td>
                  <td className="px-4 py-2">{user.reviewGiven}</td>
                  <td className="px-4 py-2">{user.activities.steps}</td>
                  <td className="px-4 py-2">{user.activities.quiz}</td>
                  <td className="px-4 py-2">{user.activities.news}</td>
                  <td className="px-4 py-2">{user.activities.facts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-end mt-4 space-x-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded ${currentPage === i + 1 ? "bg-blue-500 text-white" : "bg-gray-200"
                }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Restaurant Insights Table */}
      <div className="bg-white rounded-lg shadow-md p-4 mt-8">
        <h3 className="text-2xl font-bold mb-4">Restaurant Insights</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-2">Restaurant</th>
                <th className="px-4 py-2">Redemption</th>
                <th className="px-4 py-2">Avg Rating</th>
                <th className="px-4 py-2">Active Offer</th>
                <th className="px-4 py-2">Joined Date</th>
              </tr>
            </thead>
            <tbody>
              {currentRestaurants.map((rest, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-4 py-2">{rest.restaurant}</td>
                  <td className="px-4 py-2">{rest.redemption}</td>
                  <td className="px-4 py-2">{rest.avgRating}</td>
                  <td className="px-4 py-2">{rest.activeOffer}</td>
                  <td className="px-4 py-2">{rest.joinedDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-end mt-4 space-x-2">
          {Array.from({ length: totalRestPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentRestPage(i + 1)}
              className={`px-3 py-1 rounded ${currentRestPage === i + 1 ? "bg-blue-500 text-white" : "bg-gray-200"
                }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-4 mt-8">
        <h3 className="text-2xl font-bold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate("/create-coupon")}
            className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition"
          >
            Create Coupon
          </button>
          <button
            onClick={() => navigate("/vendorlist")}
            className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition"
          >
            Manage Vendors
          </button>
          <button
            onClick={() => navigate("/create-category")}
            className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition"
          >
            Add Category
          </button>
          <button
            onClick={() => navigate("/coupons")}
            className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition"
          >
            View Coupons
          </button>
        </div>
      </div>
    </div>
  );
};

// Reusable Stat Card Component
const StatCard = ({ icon: Icon, label, value, color }) => {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-100",
    green: "text-green-600 bg-green-100",
    purple: "text-purple-600 bg-purple-100",
    yellow: "text-yellow-600 bg-yellow-100",
    orange: "text-orange-600 bg-orange-100",
    red: "text-red-600 bg-red-100",
    emerald: "text-emerald-600 bg-emerald-100",
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
      <div className={`p-3 rounded-full ${colorClasses[color]}`}>
        <Icon className="text-2xl" />
      </div>
      <div className="text-right">
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
};

// Quick Action Button Component
const QuickActionButton = ({ label }) => (
  <button className="bg-gray-100 hover:bg-gray-200 text-center py-4 rounded text-lg font-medium">
    {label}
  </button>
);

export default Dashboard;