import { useState } from "react";
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

// Dummy data
const earningsData = {
  today: [
    { day: "Today", revenue: 220 },
  ],
  weekly: [
    { day: "Mon", revenue: 200 },
    { day: "Tue", revenue: 350 },
    { day: "Wed", revenue: 500 },
    { day: "Thu", revenue: 750 },
    { day: "Fri", revenue: 600 },
    { day: "Sat", revenue: 900 },
    { day: "Sun", revenue: 650 },
  ],
  monthly: [
    { day: "Week 1", revenue: 1800 },
    { day: "Week 2", revenue: 2200 },
    { day: "Week 3", revenue: 2500 },
    { day: "Week 4", revenue: 2700 },
  ],
};

const redemptionData = {
  today: [
    { day: "Today", redeemed: 8 },
  ],
  weekly: [
    { day: "Mon", redeemed: 12 },
    { day: "Tue", redeemed: 18 },
    { day: "Wed", redeemed: 25 },
    { day: "Thu", redeemed: 20 },
    { day: "Fri", redeemed: 30 },
    { day: "Sat", redeemed: 35 },
    { day: "Sun", redeemed: 28 },
  ],
  monthly: [
    { day: "Week 1", redeemed: 120 },
    { day: "Week 2", redeemed: 140 },
    { day: "Week 3", redeemed: 160 },
    { day: "Week 4", redeemed: 180 },
  ],
};

// New data for restaurant redemption
const restaurantRedemptionData = {
  today: [
    { name: "Burger King", redeemed: 15 },
    { name: "McDonald's", redeemed: 12 },
    { name: "KFC", redeemed: 8 },
    { name: "Subway", redeemed: 6 },
    { name: "Pizza Hut", redeemed: 10 },
  ],
  weekly: [
    { name: "Burger King", redeemed: 85 },
    { name: "McDonald's", redeemed: 72 },
    { name: "KFC", redeemed: 58 },
    { name: "Subway", redeemed: 46 },
    { name: "Pizza Hut", redeemed: 60 },
    { name: "Domino's", redeemed: 55 },
    { name: "Taco Bell", redeemed: 42 },
  ],
  monthly: [
    { name: "Burger King", redeemed: 320 },
    { name: "McDonald's", redeemed: 280 },
    { name: "KFC", redeemed: 210 },
    { name: "Subway", redeemed: 180 },
    { name: "Pizza Hut", redeemed: 240 },
    { name: "Domino's", redeemed: 220 },
    { name: "Taco Bell", redeemed: 190 },
    { name: "Starbucks", redeemed: 170 },
    { name: "Dunkin'", redeemed: 150 },
  ],
};


const userInsightsData = [
  {
    user: "Rahul Sharma",
    lastLogin: "2025-06-10",
    offerRedeemed: 4,
    reviewGiven: 2,
    accountCreated: "2024-12-01",
    activities: {
      steps: 120,
      quiz: 3,
      news: 15,
      facts: 10,
    },
  },
  {
    user: "Anjali Verma",
    lastLogin: "2025-06-09",
    offerRedeemed: 6,
    reviewGiven: 3,
    accountCreated: "2024-11-15",
    activities: {
      steps: 200,
      quiz: 5,
      news: 25,
      facts: 14,
    },
  },
  {
    user: "Vikram Singh",
    lastLogin: "2025-06-08",
    offerRedeemed: 2,
    reviewGiven: 1,
    accountCreated: "2024-10-20",
    activities: {
      steps: 150,
      quiz: 2,
      news: 10,
      facts: 5,
    },
  },
  {
    user: "Priya Mehta",
    lastLogin: "2025-06-07",
    offerRedeemed: 3,
    reviewGiven: 2,
    accountCreated: "2023-09-25",
    activities: {
      steps: 180,
      quiz: 4,
      news: 18,
      facts: 9,
    },
  },
  {
    user: "Amit Patel",
    lastLogin: "2025-06-06",
    offerRedeemed: 5,
    reviewGiven: 3,
    accountCreated: "2023-12-12",
    activities: {
      steps: 210,
      quiz: 6,
      news: 22,
      facts: 11,
    },
  },
];




const restaurantInsightsData = [
  {
    restaurant: "The Spice House",
    redemption: 120,
    avgRating: 4.5,
    activeOffer: 3,
    joinedDate: "2023-05-10",
  },
  {
    restaurant: "Ocean's Delight",
    redemption: 85,
    avgRating: 4.2,
    activeOffer: 2,
    joinedDate: "2023-07-15",
  },
  {
    restaurant: "Green Garden",
    redemption: 95,
    avgRating: 4.7,
    activeOffer: 4,
    joinedDate: "2023-06-20",
  },
  {
    restaurant: "Burger Town",
    redemption: 150,
    avgRating: 4.0,
    activeOffer: 1,
    joinedDate: "2023-08-01",
  },
  {
    restaurant: "Pizza Palace",
    redemption: 110,
    avgRating: 4.3,
    activeOffer: 5,
    joinedDate: "2023-04-30",
  },
  {
    restaurant: "Sushi World",
    redemption: 70,
    avgRating: 4.6,
    activeOffer: 2,
    joinedDate: "2023-09-05",
  },
];


// Data for top performing restaurants
const topRestaurantsData = {
  today: [
    { name: "Burger King", revenue: 4500, coupons: 15 },
    { name: "McDonald's", revenue: 3800, coupons: 12 },
    { name: "KFC", revenue: 2900, coupons: 8 },
    { name: "Pizza Hut", revenue: 3200, coupons: 10 },
    { name: "Subway", revenue: 2100, coupons: 6 },
  ],
  weekly: [
    { name: "Burger King", revenue: 28500, coupons: 85 },
    { name: "McDonald's", revenue: 23800, coupons: 72 },
    { name: "Pizza Hut", revenue: 18200, coupons: 60 },
    { name: "KFC", revenue: 17500, coupons: 58 },
    { name: "Domino's", revenue: 16500, coupons: 55 },
    { name: "Subway", revenue: 14600, coupons: 46 },
    { name: "Taco Bell", revenue: 14200, coupons: 42 },
  ],
  monthly: [
    { name: "Burger King", revenue: 112000, coupons: 320 },
    { name: "McDonald's", revenue: 98000, coupons: 280 },
    { name: "Pizza Hut", revenue: 78200, coupons: 240 },
    { name: "Domino's", revenue: 72200, coupons: 220 },
    { name: "KFC", revenue: 71000, coupons: 210 },
    { name: "Taco Bell", revenue: 69000, coupons: 190 },
    { name: "Subway", revenue: 61800, coupons: 180 },
    { name: "Starbucks", revenue: 57000, coupons: 170 },
    { name: "Dunkin'", revenue: 51000, coupons: 150 },
  ],
};

const Dashboard = () => {
  const [revenueFilter, setRevenueFilter] = useState("weekly");
  const [redemptionFilter, setRedemptionFilter] = useState("weekly");
  const [restaurantFilter, setRestaurantFilter] = useState("weekly");
  const [topRestaurantsFilter, setTopRestaurantsFilter] = useState("weekly");


  const [currentPage, setCurrentPage] = useState(1);
const usersPerPage = 5;

// Pagination logic
const indexOfLastUser = currentPage * usersPerPage;
const indexOfFirstUser = indexOfLastUser - usersPerPage;
const currentUsers = userInsightsData.slice(indexOfFirstUser, indexOfLastUser);

const totalPages = Math.ceil(userInsightsData.length / usersPerPage);


const [currentRestPage, setCurrentRestPage] = useState(1);
const restaurantsPerPage = 5;

// Pagination logic for restaurant table
const indexOfLastRest = currentRestPage * restaurantsPerPage;
const indexOfFirstRest = indexOfLastRest - restaurantsPerPage;
const currentRestaurants = restaurantInsightsData.slice(indexOfFirstRest, indexOfLastRest);

const totalRestPages = Math.ceil(restaurantInsightsData.length / restaurantsPerPage);

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      {/* Top Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={FiUsers} label="Total Users" value="1,250" color="blue" />
        <StatCard icon={FiTag} label="Total Coupons" value="340" color="green" />
        <StatCard icon={FiShoppingBag} label="Total Vendors" value="48" color="purple" />
        <StatCard icon={FiGrid} label="Total Categories" value="12" color="yellow" />
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard icon={FiPlusCircle} label="Today's Coupons" value="25" color="orange" />
        <StatCard icon={FiActivity} label="Redeemed Coupons" value="18" color="red" />
        <StatCard icon={FiBarChart2} label="Revenue from Coupons" value="₹1,450" color="emerald" />
      </div>

      {/* Active Users Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard icon={FiClock} label="Daily Active Users" value="215" color="blue" />
        <StatCard icon={FiTrendingUp} label="Weekly Active Users" value="780" color="green" />
        <StatCard icon={FiCalendar} label="Monthly Active Users" value="1,150" color="purple" />
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
              <AreaChart data={earningsData[revenueFilter]}>
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
              <AreaChart data={redemptionData[redemptionFilter]}>
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
                data={restaurantRedemptionData[restaurantFilter]}
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
                data={topRestaurantsData[topRestaurantsFilter].slice(0, 10)}
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
        {userInsightsData.map((user, idx) => (
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
        className={`px-3 py-1 rounded ${
          currentPage === i + 1 ? "bg-blue-500 text-white" : "bg-gray-200"
        }`}
      >
        {i + 1}
      </button>
    ))}
  </div>
</div>


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
        className={`px-3 py-1 rounded ${
          currentRestPage === i + 1 ? "bg-blue-500 text-white" : "bg-gray-200"
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
          <QuickActionButton label="Create Coupon" />
          <QuickActionButton label="Manage Vendors" />
          <QuickActionButton label="Add Category" />
          <QuickActionButton label="View Reports" />
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