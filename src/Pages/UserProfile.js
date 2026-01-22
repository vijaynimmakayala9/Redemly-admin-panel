import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

function UserDetail() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (!userId) {
      setError("User ID is missing");
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await fetch(`https://api.redemly.com/api/admin/getsingleuser/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch user: ${res.status}`);
        }

        const data = await res.json();

        if (!data.user) {
          throw new Error('User data not found in response');
        }

        setUser(data.user);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) return <div className="p-4 text-center">Loading user details...</div>;
  if (error) return <div className="p-4 text-red-600 text-center">Error: {error}</div>;
  if (!user) return <div className="p-4 text-center">No user data found</div>;

  // Helper functions
  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleDateString() : 'N/A';
  };

  const formatDateTime = (dateString) => {
    return dateString ? new Date(dateString).toLocaleString() : 'N/A';
  };

  const formatTimeSpent = (seconds) => {
    if (!seconds) return '0s';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const renderProfileSection = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Profile Image */}
        <div className="flex-shrink-0">
          {user.profileImage ? (
            <img
              src={user.profileImage}
              alt={`${user.name}'s profile`}
              className="w-32 h-32 rounded-full object-cover border border-gray-300"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">No Image</span>
            </div>
          )}
        </div>

        {/* Basic Info Table */}
        <div className="flex-grow">
          <table className="min-w-full bg-white border border-gray-200">
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="py-2 px-4 font-semibold bg-gray-50 w-1/4">Name</td>
                <td className="py-2 px-4">{user.name}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-2 px-4 font-semibold bg-gray-50">Email</td>
                <td className="py-2 px-4">{user.email}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-2 px-4 font-semibold bg-gray-50">Phone</td>
                <td className="py-2 px-4">{user.phone || 'N/A'}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-2 px-4 font-semibold bg-gray-50">Date of Birth</td>
                <td className="py-2 px-4">{formatDate(user.dateOfBirth)}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-2 px-4 font-semibold bg-gray-50">Location</td>
                <td className="py-2 px-4">{user.city || 'N/A'}, {user.zipcode || 'N/A'}</td>
              </tr>
              <tr>
                <td className="py-2 px-4 font-semibold bg-gray-50">Account Created</td>
                <td className="py-2 px-4">{formatDateTime(user.createdAt)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border border-gray-200">Coins</th>
              <th className="py-2 px-4 border border-gray-200">Coupons</th>
              <th className="py-2 px-4 border border-gray-200">Favorite Coupons</th>
              <th className="py-2 px-4 border border-gray-200">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2 px-4 border border-gray-200 text-center text-2xl font-bold">{user.coins ?? 0}</td>
              <td className="py-2 px-4 border border-gray-200 text-center text-2xl font-bold">{user.coupons ?? 0}</td>
              <td className="py-2 px-4 border border-gray-200 text-center text-2xl font-bold">{user.favoriteCoupons?.length ?? 0}</td>
              <td className="py-2 px-4 border border-gray-200 text-center text-2xl font-bold">{user.onlineStatus ? 'Online' : 'Offline'}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderStepsSection = () => (
    <div>
      <h2 className="text-xl font-bold mb-4">Steps History</h2>
      {user.steps?.length ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border border-gray-200">Date</th>
                <th className="py-2 px-4 border border-gray-200">Day</th>
                <th className="py-2 px-4 border border-gray-200">Steps</th>
                <th className="py-2 px-4 border border-gray-200">Distance (km)</th>
                <th className="py-2 px-4 border border-gray-200">Calories</th>
                <th className="py-2 px-4 border border-gray-200">Time Spent</th>
              </tr>
            </thead>
            <tbody>
              {user.steps.map((step, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="py-2 px-4 border border-gray-200">{formatDate(step.date)}</td>
                  <td className="py-2 px-4 border border-gray-200">{step.day}</td>
                  <td className="py-2 px-4 border border-gray-200">{step.stepsCount || step.count || 'N/A'}</td>
                  <td className="py-2 px-4 border border-gray-200">{step.distance || 'N/A'}</td>
                  <td className="py-2 px-4 border border-gray-200">{step.kcal || 'N/A'}</td>
                  <td className="py-2 px-4 border border-gray-200">{step.timeSpent || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center py-4">No steps data available</p>
      )}
    </div>
  );

  const renderCouponsSection = () => (
    <div>
      <h2 className="text-xl font-bold mb-6">Coupons</h2>

      <div className="mb-8">
        <h3 className="font-semibold mb-4 text-lg">Active Coupon Code</h3>
        {user.couponCode ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 inline-block">
            <span className="font-mono font-bold text-blue-700 text-lg">{user.couponCode}</span>
          </div>
        ) : (
          <p className="text-gray-500">No active coupon code</p>
        )}
      </div>

      <div className="mb-8">
        <h3 className="font-semibold mb-4 text-lg">My Coupons ({user.MyCoupons?.length || 0})</h3>
        {user.MyCoupons?.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border border-gray-200">Image</th>
                  <th className="py-2 px-4 border border-gray-200">Name</th>
                  <th className="py-2 px-4 border border-gray-200">Category</th>
                  <th className="py-2 px-4 border border-gray-200">Discount</th>
                  <th className="py-2 px-4 border border-gray-200">Code</th>
                  <th className="py-2 px-4 border border-gray-200">Valid Until</th>
                  <th className="py-2 px-4 border border-gray-200">Downloads</th>
                  <th className="py-2 px-4 border border-gray-200">Status</th>
                  <th className="py-2 px-4 border border-gray-200">Claimed At</th>
                </tr>
              </thead>
              <tbody>
                {user.MyCoupons.map((myCoupon, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="py-2 px-4 border border-gray-200">
                      {myCoupon.couponId?.couponImage ? (
                        <img
                          src={myCoupon.couponId.couponImage}
                          alt={myCoupon.couponId.name}
                          className="w-16 h-16 object-cover"
                        />
                      ) : (
                        'No Image'
                      )}
                    </td>
                    <td className="py-2 px-4 border border-gray-200">{myCoupon.couponId?.name || 'Unnamed Coupon'}</td>
                    <td className="py-2 px-4 border border-gray-200 capitalize">{myCoupon.couponId?.category || 'No category'}</td>
                    <td className="py-2 px-4 border border-gray-200">{myCoupon.couponId?.discountPercentage}% {myCoupon.couponId?.couponCodeType === '%' ? 'off' : ''}</td>
                    <td className="py-2 px-4 border border-gray-200 font-mono">{myCoupon.couponId?.couponCode}</td>
                    <td className="py-2 px-4 border border-gray-200">{formatDate(myCoupon.couponId?.validityDate)}</td>
                    <td className="py-2 px-4 border border-gray-200">{myCoupon.downloadedCount || 0} / {myCoupon.couponId?.limitForSameUser || '∞'}</td>
                    <td className="py-2 px-4 border border-gray-200">
                      <span className={`px-2 py-1 text-xs rounded-full ${myCoupon.status === 'Active' ? 'bg-green-100 text-green-800' :
                          myCoupon.status === 'Expired' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                        }`}>
                        {myCoupon.status}
                      </span>
                    </td>
                    <td className="py-2 px-4 border border-gray-200">{formatDateTime(myCoupon.claimedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-500">No coupons claimed yet</p>
          </div>
        )}
      </div>

      <div>
        <h3 className="font-semibold mb-4 text-lg">Favorite Coupons ({user.favoriteCoupons?.length || 0})</h3>
        {user.favoriteCoupons?.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border border-gray-200">Image</th>
                  <th className="py-2 px-4 border border-gray-200">Name</th>
                  <th className="py-2 px-4 border border-gray-200">Category</th>
                  <th className="py-2 px-4 border border-gray-200">Discount</th>
                  <th className="py-2 px-4 border border-gray-200">Cost</th>
                  <th className="py-2 px-4 border border-gray-200">Valid Until</th>
                  <th className="py-2 px-4 border border-gray-200">Status</th>
                  <th className="py-2 px-4 border border-gray-200">Created</th>
                </tr>
              </thead>
              <tbody>
                {user.favoriteCoupons.map((coupon, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="py-2 px-4 border border-gray-200">
                      {coupon.couponImage ? (
                        <img
                          src={coupon.couponImage}
                          alt={coupon.name}
                          className="w-16 h-16 object-cover"
                        />
                      ) : (
                        'No Image'
                      )}
                    </td>
                    <td className="py-2 px-4 border border-gray-200">{coupon.name}</td>
                    <td className="py-2 px-4 border border-gray-200 capitalize">{coupon.category}</td>
                    <td className="py-2 px-4 border border-gray-200">{coupon.discountPercentage}% {coupon.couponCodeType === '%' ? 'off' : ''}</td>
                    <td className="py-2 px-4 border border-gray-200">{coupon.requiredCoins} coins</td>
                    <td className="py-2 px-4 border border-gray-200">{formatDate(coupon.validityDate)}</td>
                    <td className="py-2 px-4 border border-gray-200">
                      <span className={`px-2 py-1 text-xs rounded-full ${coupon.status === 'approved' ? 'bg-green-100 text-green-800' :
                          coupon.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                        }`}>
                        {coupon.status}
                      </span>
                    </td>
                    <td className="py-2 px-4 border border-gray-200">{formatDate(coupon.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-500">No favorite coupons added yet</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderCoinHistorySection = () => (
    <div>
      <h2 className="text-xl font-bold mb-4">Coin History</h2>
      {user.coinHistory?.length ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border border-gray-200">Type</th>
                <th className="py-2 px-4 border border-gray-200">Amount</th>
                <th className="py-2 px-4 border border-gray-200">Message</th>
                <th className="py-2 px-4 border border-gray-200">Recipient</th>
                <th className="py-2 px-4 border border-gray-200">Date</th>
              </tr>
            </thead>
            <tbody>
              {user.coinHistory.map((entry, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="py-2 px-4 border border-gray-200 capitalize">{entry.type}</td>
                  <td className="py-2 px-4 border border-gray-200">{entry.amount || 'N/A'}</td>
                  <td className="py-2 px-4 border border-gray-200">{entry.message || 'N/A'}</td>
                  <td className="py-2 px-4 border border-gray-200">
                    {entry.toUser ? (entry.toUser.name || entry.toUser._id) : 'N/A'}
                  </td>
                  <td className="py-2 px-4 border border-gray-200">{formatDateTime(entry.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center py-4">No coin history available</p>
      )}
    </div>
  );

  const renderNotificationsSection = () => (
    <div>
      <h2 className="text-xl font-bold mb-4">Notifications ({user.notifications?.length || 0})</h2>
      {user.notifications?.length ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border border-gray-200">Sender</th>
                <th className="py-2 px-4 border border-gray-200">Message</th>
                <th className="py-2 px-4 border border-gray-200">Type</th>
                <th className="py-2 px-4 border border-gray-200">Status</th>
                <th className="py-2 px-4 border border-gray-200">Date</th>
              </tr>
            </thead>
            <tbody>
              {user.notifications.map((notification, index) => (
                <tr key={index} className={notification.read ? 'bg-white' : 'bg-blue-50'}>
                  <td className="py-2 px-4 border border-gray-200">{notification.vendorName || 'System'}</td>
                  <td className="py-2 px-4 border border-gray-200">{notification.message}</td>
                  <td className="py-2 px-4 border border-gray-200">{notification.type}</td>
                  <td className="py-2 px-4 border border-gray-200">
                    <span className={`px-2 py-1 text-xs rounded-full ${notification.read ? 'bg-gray-200' : 'bg-blue-200'}`}>
                      {notification.read ? 'Read' : 'Unread'}
                    </span>
                  </td>
                  <td className="py-2 px-4 border border-gray-200">{formatDateTime(notification.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center py-4">No notifications available</p>
      )}
    </div>
  );

  const renderChatMembersSection = () => (
    <div>
      <h2 className="text-xl font-bold mb-6">Chat Members ({user.MyChatMembers?.length || 0})</h2>

      {user.MyChatMembers?.length ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border border-gray-200">Profile</th>
                <th className="py-2 px-4 border border-gray-200">Name</th>
                <th className="py-2 px-4 border border-gray-200">Email</th>
                <th className="py-2 px-4 border border-gray-200">Phone</th>
                <th className="py-2 px-4 border border-gray-200">Location</th>
                <th className="py-2 px-4 border border-gray-200">Coins</th>
                <th className="py-2 px-4 border border-gray-200">Member Since</th>
                <th className="py-2 px-4 border border-gray-200">Status</th>
              </tr>
            </thead>
            <tbody>
              {user.MyChatMembers.map((member, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="py-2 px-4 border border-gray-200">
                    {member.userId.profileImage ? (
                      <img
                        src={member.userId.profileImage}
                        alt={`${member.userId.name}'s profile`}
                        className="w-12 h-12 rounded-full object-cover border border-gray-300"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-sm">
                          {member.userId.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="py-2 px-4 border border-gray-200">{member.userId.name}</td>
                  <td className="py-2 px-4 border border-gray-200">{member.userId.email}</td>
                  <td className="py-2 px-4 border border-gray-200">{member.userId.phone || 'N/A'}</td>
                  <td className="py-2 px-4 border border-gray-200">
                    {member.userId.city || 'N/A'}, {member.userId.zipcode || 'N/A'}
                  </td>
                  <td className="py-2 px-4 border border-gray-200">{member.userId.coins || 0}</td>
                  <td className="py-2 px-4 border border-gray-200">{formatDate(member.userId.createdAt)}</td>
                  <td className="py-2 px-4 border border-gray-200">
                    <span className={`px-2 py-1 text-xs rounded-full ${member.status === 'Accepted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {member.status === 'Accepted' ? 'Connected' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-500">No chat members found</p>
        </div>
      )}
    </div>
  );

  const renderCategoryTimeSpentSection = () => {
    // Check if user has category data
    const hasCategoryData = user.categoryTimeSpent || user.categoryCoins || user.categorySessions;

    if (!hasCategoryData) {
      return (
        <div className="text-center py-8">
          <h2 className="text-xl font-bold mb-4">Category Time Spent</h2>
          <p className="text-gray-500">No category activity data available</p>
        </div>
      );
    }

    return (
      <div>
        <h2 className="text-xl font-bold mb-4">Category Time Spent</h2>
        <p className="text-gray-500 text-center py-8">
          Category time spent data will be displayed here when available from the API
        </p>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <Link to="/users" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Users List
      </Link>

      <h1 className="text-2xl font-bold mb-6">User Details: {user.name}</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2 px-4 font-medium whitespace-nowrap ${activeTab === 'profile' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('steps')}
            className={`py-2 px-4 font-medium whitespace-nowrap ${activeTab === 'steps' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Steps
          </button>
          <button
            onClick={() => setActiveTab('coupons')}
            className={`py-2 px-4 font-medium whitespace-nowrap ${activeTab === 'coupons' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Coupons
          </button>
          <button
            onClick={() => setActiveTab('coins')}
            className={`py-2 px-4 font-medium whitespace-nowrap ${activeTab === 'coins' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Coin History
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-2 px-4 font-medium whitespace-nowrap ${activeTab === 'notifications' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`py-2 px-4 font-medium whitespace-nowrap ${activeTab === 'chat' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Chat Members
          </button>
          <button
            onClick={() => setActiveTab('category')}
            className={`py-2 px-4 font-medium whitespace-nowrap ${activeTab === 'category' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Category Time
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white p-6 rounded-lg shadow">
        {activeTab === 'profile' && renderProfileSection()}
        {activeTab === 'steps' && renderStepsSection()}
        {activeTab === 'coupons' && renderCouponsSection()}
        {activeTab === 'coins' && renderCoinHistorySection()}
        {activeTab === 'notifications' && renderNotificationsSection()}
        {activeTab === 'chat' && renderChatMembersSection()}
        {activeTab === 'category' && renderCategoryTimeSpentSection()}
      </div>
    </div>
  );
}

export default UserDetail;