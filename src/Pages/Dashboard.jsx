import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import { useState } from "react";

const Dashboard = () => {
  const [timeframe, setTimeframe] = useState("Today");

  const vendorSalesData = {
    Today: [{ name: "Today", sales: 1200 }],
    "This Week": [
      { name: "Mon", sales: 300 },
      { name: "Tue", sales: 250 },
      { name: "Wed", sales: 450 },
      { name: "Thu", sales: 500 },
      { name: "Fri", sales: 400 },
      { name: "Sat", sales: 700 },
      { name: "Sun", sales: 600 },
    ],
    "Last Week": [
      { name: "Mon", sales: 250 },
      { name: "Tue", sales: 300 },
      { name: "Wed", sales: 350 },
      { name: "Thu", sales: 400 },
      { name: "Fri", sales: 450 },
      { name: "Sat", sales: 500 },
      { name: "Sun", sales: 550 },
    ],
    "Last Month": [
      { name: "Week 1", sales: 1200 },
      { name: "Week 2", sales: 1500 },
      { name: "Week 3", sales: 1800 },
      { name: "Week 4", sales: 2000 },
    ],
  };

  const handleTimeframeChange = (event) => {
    setTimeframe(event.target.value);
  };

  // Define a list of colors for the bars
  const barColors = [
    "#FF9800", "#4CAF50", "#2196F3", "#9C27B0", "#FF5722", "#FFC107", "#03A9F4",
  ];

  // Define the orders data
  const orders = [
    { orderId: "ORD12347", product: "Pizza Margherita", category: "Restaurant", price: "$15", status: "Pending" },
    { orderId: "ORD12346", product: "Organic Vegetables", category: "Groceries", price: "$25", status: "Completed" },
    { orderId: "ORD12347", product: "Pizza Margherita", category: "Restaurant", price: "$15", status: "Pending" },
    { orderId: "ORD12347", product: "Pizza Margherita", category: "Restaurant", price: "$15", status: "Pending" },
    { orderId: "ORD12349", product: "Frozen Vegetables", category: "Groceries", price: "$12", status: "Completed" },
    { orderId: "ORD12347", product: "Pizza Margherita", category: "Restaurant", price: "$15", status: "Pending" },
  ];

  // Filter pending orders
  const pendingOrders = orders.filter(order => order.status === "Pending");

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-gradient-to-r from-purple-200 to-pink-200">
      {/* Stats Cards */}
      <div className="md:col-span-4 p-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-teal-400 to-teal-600 shadow-lg rounded-lg p-4 text-center text-white">
          <div className="text-3xl font-bold">50</div>
          <h4 className="text-lg font-semibold">Total Orders</h4>
        </div>

        <div className="bg-gradient-to-r from-green-400 to-green-600 shadow-lg rounded-lg p-4 text-center text-white">
          <div className="text-3xl font-bold">45</div>
          <h4 className="text-lg font-semibold">Completed Orders</h4>
        </div>

        <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 shadow-lg rounded-lg p-4 text-center text-white">
          <div className="text-3xl font-bold">$8,000</div>
          <h4 className="text-lg font-semibold">Order Amount</h4>
        </div>

        <div className="bg-gradient-to-r from-indigo-400 to-indigo-600 shadow-lg rounded-lg p-4 text-center text-white">
          <div className="text-3xl font-bold">200</div>
          <h4 className="text-lg font-semibold">Total Products</h4>
        </div>
      </div>

      {/* Sales Chart */}
      <div className="md:col-span-4 p-4 bg-gradient-to-r from-blue-100 to-blue-200 rounded shadow-md">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">Sales Overview</h3>
        
        {/* Dropdown to select timeframe */}
        <div className="mb-4">
          <select
            className="border rounded p-2"
            value={timeframe}
            onChange={handleTimeframeChange}
          >
            <option value="Today">Today</option>
            <option value="This Week">This Week</option>
            <option value="Last Week">Last Week</option>
            <option value="Last Month">Last Month</option>
          </select>
        </div>

        {/* BarChart based on selected timeframe */}
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={vendorSalesData[timeframe]}>
            <CartesianGrid strokeDasharray="3 3" stroke="#dcdcdc" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            {vendorSalesData[timeframe].map((data, index) => (
              <Bar
                key={index}
                dataKey="sales"
                fill={barColors[index % barColors.length]}  // Cycle through colors if more bars
                name={data.name}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Orders & Products Table */}
      <div className="md:col-span-4 p-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg shadow-md mt-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Recent Orders & Products</h3>
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b text-left text-sm font-semibold text-gray-700">Order ID</th>
              <th className="px-4 py-2 border-b text-left text-sm font-semibold text-gray-700">Product Name</th>
              <th className="px-4 py-2 border-b text-left text-sm font-semibold text-gray-700">Category</th>
              <th className="px-4 py-2 border-b text-left text-sm font-semibold text-gray-700">Price</th>
              <th className="px-4 py-2 border-b text-left text-sm font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {/* Updated products & orders data */}
            {orders.map((order) => (
              <tr key={order.orderId}>
                <td className="px-4 py-2 border-b text-sm">{order.orderId}</td>
                <td className="px-4 py-2 border-b text-sm">{order.product}</td>
                <td className="px-4 py-2 border-b text-sm">{order.category}</td>
                <td className="px-4 py-2 border-b text-sm">{order.price}</td>
                <td className={`px-4 py-2 border-b text-sm ${order.status === 'Completed' ? 'text-green-500' : 'text-yellow-500'}`}>
                  {order.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pending Orders Table */}
      <div className="md:col-span-4 p-6 bg-gradient-to-r from-red-100 to-red-200 rounded-lg shadow-md mt-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Pending Orders</h3>
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b text-left text-sm font-semibold text-gray-700">Order ID</th>
              <th className="px-4 py-2 border-b text-left text-sm font-semibold text-gray-700">Product Name</th>
              <th className="px-4 py-2 border-b text-left text-sm font-semibold text-gray-700">Category</th>
              <th className="px-4 py-2 border-b text-left text-sm font-semibold text-gray-700">Price</th>
              <th className="px-4 py-2 border-b text-left text-sm font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {/* Pending orders data */}
            {pendingOrders.map((order) => (
              <tr key={order.orderId}>
                <td className="px-4 py-2 border-b text-sm">{order.orderId}</td>
                <td className="px-4 py-2 border-b text-sm">{order.product}</td>
                <td className="px-4 py-2 border-b text-sm">{order.category}</td>
                <td className="px-4 py-2 border-b text-sm">{order.price}</td>
                <td className="px-4 py-2 border-b text-sm text-yellow-500">
                  {order.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
