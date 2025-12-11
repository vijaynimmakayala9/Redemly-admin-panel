import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AllUserCoupons = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedUsers, setExpandedUsers] = useState({});

  // Category colors mapping
  const categoryColorMap = {
    Food: 'bg-red-100 text-red-800',
    Fashion: 'bg-blue-100 text-blue-800',
    Restaurant: 'bg-yellow-100 text-yellow-800',
    Groceries: 'bg-green-100 text-green-800',
    // Add more categories as needed
  };

  useEffect(() => {
    const fetchUserCoupons = async () => {
      try {
        const response = await axios.get('http://31.97.206.144:6098/api/admin/getalluserscoupons');
        setUsers(response.data.users);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUserCoupons();
  }, []);

  const toggleUserExpansion = (userId) => {
    setExpandedUsers(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-500">
        Error loading data: {error}
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-8">
        All User Coupons Dashboard
      </h1>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-3 px-4 text-left">User</th>
              <th className="py-3 px-4 text-left">Coins</th>
              <th className="py-3 px-4 text-left">Active Coupons</th>
              <th className="py-3 px-4 text-left">Used Coupons</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <React.Fragment key={user._id}>
                <tr className="hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <img 
                        src={user.profileImage} 
                        alt={user.name} 
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {user.coins}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {user.stats.totalActiveCoupons}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {user.stats.totalCouponsClaimed}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <button 
                      onClick={() => toggleUserExpansion(user._id)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      {expandedUsers[user._id] ? 'Hide Details' : 'Show Details'}
                    </button>
                  </td>
                </tr>
                
                {/* Expanded user details */}
                {expandedUsers[user._id] && (
                  <tr>
                    <td colSpan="5" className="px-4 py-4 bg-gray-100">
                      {/* Active Coupons Table */}
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-4">Active Coupons</h3>
                        <div className="overflow-x-auto">
                          <table className="min-w-full bg-white rounded-lg overflow-hidden mb-6">
                            <thead className="bg-gray-200">
                              <tr>
                                <th className="py-2 px-4 text-left">Image</th>
                                <th className="py-2 px-4 text-left">Name</th>
                                <th className="py-2 px-4 text-left">Category</th>
                                <th className="py-2 px-4 text-left">Code</th>
                                <th className="py-2 px-4 text-left">Discount</th>
                                <th className="py-2 px-4 text-left">Cost</th>
                                <th className="py-2 px-4 text-left">Valid Until</th>
                                <th className="py-2 px-4 text-left">Claimed At</th>
                                <th className="py-2 px-4 text-left">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {user.activeCoupons.map((coupon) => (
                                <tr key={`${user._id}-active-${coupon._id}`}>
                                  <td className="py-3 px-4">
                                    {coupon.image && (
                                      <img
                                        src={coupon.image}
                                        alt={coupon.name}
                                        className="w-12 h-12 object-cover rounded"
                                      />
                                    )}
                                  </td>
                                  <td className="py-3 px-4">{coupon.name}</td>
                                  <td className="py-3 px-4">
                                    <span className={`text-xs px-2 py-1 rounded-full ${categoryColorMap[coupon.category] || 'bg-gray-200'}`}>
                                      {coupon.category}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 font-mono text-sm">{coupon.code}</td>
                                  <td className="py-3 px-4">{coupon.discount}</td>
                                  <td className="py-3 px-4">{coupon.coinsCost} coins</td>
                                  <td className="py-3 px-4">
                                    {new Date(coupon.validUntil).toLocaleDateString()}
                                  </td>
                                  <td className="py-3 px-4">
                                    {new Date(coupon.claimedAt).toLocaleDateString()}
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className={`text-xs px-2 py-1 rounded ${
                                      coupon.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                      {coupon.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Coupon History Table */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Coupon Usage History</h3>
                        <div className="overflow-x-auto">
                          <table className="min-w-full bg-white rounded-lg overflow-hidden">
                            <thead className="bg-gray-200">
                              <tr>
                                <th className="py-2 px-4 text-left">Image</th>
                                <th className="py-2 px-4 text-left">Name</th>
                                <th className="py-2 px-4 text-left">Category</th>
                                <th className="py-2 px-4 text-left">Code</th>
                                <th className="py-2 px-4 text-left">Discount</th>
                                <th className="py-2 px-4 text-left">Coins Used</th>
                                <th className="py-2 px-4 text-left">Used On</th>
                                <th className="py-2 px-4 text-left">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {user.couponHistory.map((coupon) => (
                                <tr key={`${user._id}-history-${coupon._id}`}>
                                  <td className="py-3 px-4">
                                    {coupon.image && (
                                      <img
                                        src={coupon.image}
                                        alt={coupon.name}
                                        className="w-12 h-12 object-cover rounded"
                                      />
                                    )}
                                  </td>
                                  <td className="py-3 px-4">{coupon.name}</td>
                                  <td className="py-3 px-4">
                                    <span className={`text-xs px-2 py-1 rounded-full ${categoryColorMap[coupon.category] || 'bg-gray-200'}`}>
                                      {coupon.category}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 font-mono text-sm">{coupon.code}</td>
                                  <td className="py-3 px-4">{coupon.discount}</td>
                                  <td className="py-3 px-4">{coupon.coinsUsed}</td>
                                  <td className="py-3 px-4">
                                    {new Date(coupon.usedOn).toLocaleDateString()}
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                      coupon.status === 'Used' ? 'bg-red-100 text-red-800' : 'bg-gray-100'
                                    }`}>
                                      {coupon.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllUserCoupons;