import { useState } from "react";
import {
  FiUsers,
  FiTag,
  FiShoppingBag,
  FiGrid,
  FiPlusCircle,
  FiActivity,
  FiBarChart2,
} from "react-icons/fi";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

// Dummy revenue data for earnings chart
const earningsData = [
  { day: "Mon", revenue: 200 },
  { day: "Tue", revenue: 350 },
  { day: "Wed", revenue: 500 },
  { day: "Thu", revenue: 750 },
  { day: "Fri", revenue: 600 },
  { day: "Sat", revenue: 900 },
  { day: "Sun", revenue: 650 },
];

// Dummy redemption trend data
const redemptionData = [
  { day: "Mon", redeemed: 12 },
  { day: "Tue", redeemed: 18 },
  { day: "Wed", redeemed: 25 },
  { day: "Thu", redeemed: 20 },
  { day: "Fri", redeemed: 30 },
  { day: "Sat", redeemed: 35 },
  { day: "Sun", redeemed: 28 },
];

const Dashboard = () => {
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard icon={FiPlusCircle} label="Today's Coupons" value="25" color="orange" />
        <StatCard icon={FiActivity} label="Redeemed Coupons" value="18" color="red" />
        <StatCard icon={FiBarChart2} label="Revenue from Coupons" value="₹1,450" color="emerald" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-xl font-semibold mb-2">Weekly Revenue</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={earningsData}>
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

        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-xl font-semibold mb-2">Coupon Redemption Trends</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={redemptionData}>
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

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-4">
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

const QuickActionButton = ({ label }) => (
  <button className="bg-gray-100 hover:bg-gray-200 text-center py-4 rounded text-lg font-medium">
    {label}
  </button>
);

export default Dashboard;
