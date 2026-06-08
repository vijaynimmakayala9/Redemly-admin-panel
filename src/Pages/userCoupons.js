import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AllUserCoupons = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedUsers, setExpandedUsers] = useState({});

  // User pagination
  const USER_PAGE_SIZE = 10;
  const [currentUserPage, setCurrentUserPage] = useState(1);

  // Active coupons pagination per user
  const COUPON_PAGE_SIZE = 5;
  const [activeCouponPages, setActiveCouponPages] = useState({});
  const [historyCouponPages, setHistoryCouponPages] = useState({});

  // Category colors mapping
  const categoryColorMap = {
    Food: 'bg-red-100 text-red-800',
    Fashion: 'bg-blue-100 text-blue-800',
    Restaurant: 'bg-yellow-100 text-yellow-800',
    Groceries: 'bg-green-100 text-green-800',
    Electronics: 'bg-purple-100 text-purple-800',
    Travel: 'bg-indigo-100 text-indigo-800',
    Entertainment: 'bg-pink-100 text-pink-800',
    Health: 'bg-teal-100 text-teal-800',
  };

  useEffect(() => {
    const fetchUserCoupons = async () => {
      try {
        const response = await axios.get('https://api.redemly.com/api/admin/getalluserscoupons');
        setUsers(response.data.users);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUserCoupons();
  }, []);

  // Generate pagination with ellipsis
  const getPaginationRange = (currentPage, totalPages) => {
    if (totalPages <= 1) return [1];

    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  // User pagination
  const totalUserPages = Math.ceil(users.length / USER_PAGE_SIZE);

  const paginatedUsers = users.slice(
    (currentUserPage - 1) * USER_PAGE_SIZE,
    currentUserPage * USER_PAGE_SIZE
  );

  const changeUserPage = (page) => {
    if (page < 1 || page > totalUserPages) return;
    setCurrentUserPage(page);
  };

  // Toggle user expansion
  const toggleUserExpansion = (userId) => {
    setExpandedUsers(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
    // Reset coupon pages when expanding user
    if (!expandedUsers[userId]) {
      setActiveCouponPages(prev => ({ ...prev, [userId]: 1 }));
      setHistoryCouponPages(prev => ({ ...prev, [userId]: 1 }));
    }
  };

  // Get current page for user's active coupons
  const getActiveCouponPage = (userId) => {
    return activeCouponPages[userId] || 1;
  };

  // Get current page for user's history coupons
  const getHistoryCouponPage = (userId) => {
    return historyCouponPages[userId] || 1;
  };

  // Change active coupon page
  const changeActiveCouponPage = (userId, page, totalPages) => {
    if (page < 1 || page > totalPages) return;
    setActiveCouponPages(prev => ({ ...prev, [userId]: page }));
  };

  // Change history coupon page
  const changeHistoryCouponPage = (userId, page, totalPages) => {
    if (page < 1 || page > totalPages) return;
    setHistoryCouponPages(prev => ({ ...prev, [userId]: page }));
  };

  // Pagination component
  const Pagination = ({ currentPage, totalPages, onPageChange, className = "" }) => {
    if (totalPages <= 1) return null;

    const paginationRange = getPaginationRange(currentPage, totalPages);

    return (
      <div className={`flex justify-center gap-2 flex-wrap items-center ${className}`}>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
        >
          Prev
        </button>

        {paginationRange.map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === "number" && onPageChange(page)}
            className={`px-3 py-1 border rounded ${currentPage === page
                ? "bg-blue-600 text-white"
                : page === "..."
                  ? "bg-transparent cursor-default border-none"
                  : "hover:bg-gray-100"
              }`}
            disabled={page === "..."}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
        >
          Next
        </button>
      </div>
    );
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
            {paginatedUsers.map((user) => {
              const activeCoupons = user.activeCoupons || [];
              const historyCoupons = user.couponHistory || [];

              const activeTotalPages = Math.ceil(activeCoupons.length / COUPON_PAGE_SIZE);
              const historyTotalPages = Math.ceil(historyCoupons.length / COUPON_PAGE_SIZE);

              const currentActivePage = getActiveCouponPage(user._id);
              const currentHistoryPage = getHistoryCouponPage(user._id);

              const paginatedActiveCoupons = activeCoupons.slice(
                (currentActivePage - 1) * COUPON_PAGE_SIZE,
                currentActivePage * COUPON_PAGE_SIZE
              );

              const paginatedHistoryCoupons = historyCoupons.slice(
                (currentHistoryPage - 1) * COUPON_PAGE_SIZE,
                currentHistoryPage * COUPON_PAGE_SIZE
              );

              return (
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
                        {user.stats?.totalActiveCoupons || 0}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {user.stats?.totalCouponsClaimed || 0}
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
                        {/* Active Coupons Section */}
                        <div className="mb-8">
                          <h3 className="text-lg font-semibold mb-4">Active Coupons</h3>
                          {activeCoupons.length > 0 ? (
                            <>
                              <div className="overflow-x-auto">
                                <table className="min-w-full bg-white rounded-lg overflow-hidden mb-4">
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
                                    {paginatedActiveCoupons.map((coupon) => (
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
                                          <span className={`text-xs px-2 py-1 rounded ${coupon.status === 'Active'
                                              ? 'bg-green-100 text-green-800'
                                              : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {coupon.status}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>

                              {/* Active Coupons Pagination */}
                              <Pagination
                                currentPage={currentActivePage}
                                totalPages={activeTotalPages}
                                onPageChange={(page) => changeActiveCouponPage(user._id, page, activeTotalPages)}
                              />
                            </>
                          ) : (
                            <p className="text-gray-500 italic">No active coupons</p>
                          )}
                        </div>

                        {/* Coupon History Section */}
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Coupon Usage History</h3>
                          {historyCoupons.length > 0 ? (
                            <>
                              <div className="overflow-x-auto">
                                <table className="min-w-full bg-white rounded-lg overflow-hidden mb-4">
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
                                    {paginatedHistoryCoupons.map((coupon) => (
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
                                          <span className={`text-xs px-2 py-1 rounded-full ${coupon.status === 'Used'
                                              ? 'bg-red-100 text-red-800'
                                              : 'bg-gray-100'
                                            }`}>
                                            {coupon.status}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>

                              {/* History Coupons Pagination */}
                              <Pagination
                                currentPage={currentHistoryPage}
                                totalPages={historyTotalPages}
                                onPageChange={(page) => changeHistoryCouponPage(user._id, page, historyTotalPages)}
                              />
                            </>
                          ) : (
                            <p className="text-gray-500 italic">No coupon history</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* User Pagination */}
      <Pagination
        currentPage={currentUserPage}
        totalPages={totalUserPages}
        onPageChange={changeUserPage}
        className="mt-8"
      />
    </div>
  );
};

export default AllUserCoupons;