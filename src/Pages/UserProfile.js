// import React, { useState, useEffect } from 'react';
// import { useParams, Link } from 'react-router-dom';

// function UserDetail() {
//   const { userId } = useParams();
//   const [user, setUser] = useState(null);
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState('profile');

//   useEffect(() => {
//     if (!userId) {
//       setError("User ID is missing");
//       setLoading(false);
//       return;
//     }

//     const fetchUser = async () => {
//       try {
//         const token = localStorage.getItem("adminToken");
//         const res = await fetch(`https://api.redemly.com/api/admin/getsingleuser/${userId}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         if (!res.ok) {
//           throw new Error(`Failed to fetch user: ${res.status}`);
//         }

//         const data = await res.json();

//         if (!data.user) {
//           throw new Error('User data not found in response');
//         }

//         setUser(data.user);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUser();
//   }, [userId]);

//   if (loading) return <div className="p-4 text-center">Loading user details...</div>;
//   if (error) return <div className="p-4 text-red-600 text-center">Error: {error}</div>;
//   if (!user) return <div className="p-4 text-center">No user data found</div>;

//   // Helper functions
//   const formatDate = (dateString) => {
//     return dateString ? new Date(dateString).toLocaleDateString() : 'N/A';
//   };

//   const formatDateTime = (dateString) => {
//     return dateString ? new Date(dateString).toLocaleString() : 'N/A';
//   };

//   const formatTimeSpent = (seconds) => {
//     if (!seconds) return '0s';
//     const hours = Math.floor(seconds / 3600);
//     const minutes = Math.floor((seconds % 3600) / 60);
//     const secs = seconds % 60;
    
//     if (hours > 0) {
//       return `${hours}h ${minutes}m ${secs}s`;
//     } else if (minutes > 0) {
//       return `${minutes}m ${secs}s`;
//     } else {
//       return `${secs}s`;
//     }
//   };

//   const renderProfileSection = () => (
//     <div className="space-y-6">
//       <div className="flex flex-col md:flex-row gap-6">
//         {/* Profile Image */}
//         <div className="flex-shrink-0">
//           {user.profileImage ? (
//             <img
//               src={user.profileImage}
//               alt={`${user.name}'s profile`}
//               className="w-32 h-32 rounded-full object-cover border border-gray-300"
//             />
//           ) : (
//             <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
//               <span className="text-gray-500">No Image</span>
//             </div>
//           )}
//         </div>

//         {/* Basic Info Table */}
//         <div className="flex-grow">
//           <table className="min-w-full bg-white border border-gray-200">
//             <tbody>
//               <tr className="border-b border-gray-200">
//                 <td className="py-2 px-4 font-semibold bg-gray-50 w-1/4">Name</td>
//                 <td className="py-2 px-4">{user.name}</td>
//               </tr>
//               <tr className="border-b border-gray-200">
//                 <td className="py-2 px-4 font-semibold bg-gray-50">Email</td>
//                 <td className="py-2 px-4">{user.email}</td>
//               </tr>
//               <tr className="border-b border-gray-200">
//                 <td className="py-2 px-4 font-semibold bg-gray-50">Phone</td>
//                 <td className="py-2 px-4">{user.phone || 'N/A'}</td>
//               </tr>
//               <tr className="border-b border-gray-200">
//                 <td className="py-2 px-4 font-semibold bg-gray-50">Date of Birth</td>
//                 <td className="py-2 px-4">{formatDate(user.dateOfBirth)}</td>
//               </tr>
//               <tr className="border-b border-gray-200">
//                 <td className="py-2 px-4 font-semibold bg-gray-50">Location</td>
//                 <td className="py-2 px-4">{user.city || 'N/A'}, {user.zipcode || 'N/A'}</td>
//               </tr>
//               <tr>
//                 <td className="py-2 px-4 font-semibold bg-gray-50">Account Created</td>
//                 <td className="py-2 px-4">{formatDateTime(user.createdAt)}</td>
//               </tr>
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Stats Table */}
//       <div className="overflow-x-auto">
//         <table className="min-w-full bg-white border border-gray-200">
//           <thead>
//             <tr className="bg-gray-100">
//               <th className="py-2 px-4 border border-gray-200">Coins</th>
//               <th className="py-2 px-4 border border-gray-200">Coupons</th>
//               <th className="py-2 px-4 border border-gray-200">Favorite Coupons</th>
//               <th className="py-2 px-4 border border-gray-200">Status</th>
//             </tr>
//           </thead>
//           <tbody>
//             <tr>
//               <td className="py-2 px-4 border border-gray-200 text-center text-2xl font-bold">{user.coins ?? 0}</td>
//               <td className="py-2 px-4 border border-gray-200 text-center text-2xl font-bold">{user.coupons ?? 0}</td>
//               <td className="py-2 px-4 border border-gray-200 text-center text-2xl font-bold">{user.favoriteCoupons?.length ?? 0}</td>
//               <td className="py-2 px-4 border border-gray-200 text-center text-2xl font-bold">{user.onlineStatus ? 'Online' : 'Offline'}</td>
//             </tr>
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );

//   const renderStepsSection = () => (
//     <div>
//       <h2 className="text-xl font-bold mb-4">Steps History</h2>
//       {user.steps?.length ? (
//         <div className="overflow-x-auto">
//           <table className="min-w-full bg-white border border-gray-200">
//             <thead>
//               <tr className="bg-gray-100">
//                 <th className="py-2 px-4 border border-gray-200">Date</th>
//                 <th className="py-2 px-4 border border-gray-200">Day</th>
//                 <th className="py-2 px-4 border border-gray-200">Steps</th>
//                 <th className="py-2 px-4 border border-gray-200">Distance (km)</th>
//                 <th className="py-2 px-4 border border-gray-200">Calories</th>
//                 <th className="py-2 px-4 border border-gray-200">Time Spent</th>
//               </tr>
//             </thead>
//             <tbody>
//               {user.steps.map((step, index) => (
//                 <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
//                   <td className="py-2 px-4 border border-gray-200">{formatDate(step.date)}</td>
//                   <td className="py-2 px-4 border border-gray-200">{step.day}</td>
//                   <td className="py-2 px-4 border border-gray-200">{step.stepsCount || step.count || 'N/A'}</td>
//                   <td className="py-2 px-4 border border-gray-200">{step.distance || 'N/A'}</td>
//                   <td className="py-2 px-4 border border-gray-200">{step.kcal || 'N/A'}</td>
//                   <td className="py-2 px-4 border border-gray-200">{step.timeSpent || 'N/A'}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       ) : (
//         <p className="text-center py-4">No steps data available</p>
//       )}
//     </div>
//   );

//   const renderCouponsSection = () => (
//     <div>
//       <h2 className="text-xl font-bold mb-6">Coupons</h2>

//       <div className="mb-8">
//         <h3 className="font-semibold mb-4 text-lg">Active Coupon Code</h3>
//         {user.couponCode ? (
//           <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 inline-block">
//             <span className="font-mono font-bold text-blue-700 text-lg">{user.couponCode}</span>
//           </div>
//         ) : (
//           <p className="text-gray-500">No active coupon code</p>
//         )}
//       </div>

//       <div className="mb-8">
//         <h3 className="font-semibold mb-4 text-lg">My Coupons ({user.MyCoupons?.length || 0})</h3>
//         {user.MyCoupons?.length ? (
//           <div className="overflow-x-auto">
//             <table className="min-w-full bg-white border border-gray-200">
//               <thead>
//                 <tr className="bg-gray-100">
//                   <th className="py-2 px-4 border border-gray-200">Image</th>
//                   <th className="py-2 px-4 border border-gray-200">Name</th>
//                   <th className="py-2 px-4 border border-gray-200">Category</th>
//                   <th className="py-2 px-4 border border-gray-200">Discount</th>
//                   <th className="py-2 px-4 border border-gray-200">Code</th>
//                   <th className="py-2 px-4 border border-gray-200">Valid Until</th>
//                   <th className="py-2 px-4 border border-gray-200">Downloads</th>
//                   <th className="py-2 px-4 border border-gray-200">Status</th>
//                   <th className="py-2 px-4 border border-gray-200">Claimed At</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {user.MyCoupons.map((myCoupon, index) => (
//                   <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
//                     <td className="py-2 px-4 border border-gray-200">
//                       {myCoupon.couponId?.couponImage ? (
//                         <img
//                           src={myCoupon.couponId.couponImage}
//                           alt={myCoupon.couponId.name}
//                           className="w-16 h-16 object-cover"
//                         />
//                       ) : (
//                         'No Image'
//                       )}
//                     </td>
//                     <td className="py-2 px-4 border border-gray-200">{myCoupon.couponId?.name || 'Unnamed Coupon'}</td>
//                     <td className="py-2 px-4 border border-gray-200 capitalize">{myCoupon.couponId?.category || 'No category'}</td>
//                     <td className="py-2 px-4 border border-gray-200">{myCoupon.couponId?.discountPercentage}% {myCoupon.couponId?.couponCodeType === '%' ? 'off' : ''}</td>
//                     <td className="py-2 px-4 border border-gray-200 font-mono">{myCoupon.couponId?.couponCode}</td>
//                     <td className="py-2 px-4 border border-gray-200">{formatDate(myCoupon.couponId?.validityDate)}</td>
//                     <td className="py-2 px-4 border border-gray-200">{myCoupon.downloadedCount || 0} / {myCoupon.couponId?.limitForSameUser || '∞'}</td>
//                     <td className="py-2 px-4 border border-gray-200">
//                       <span className={`px-2 py-1 text-xs rounded-full ${myCoupon.status === 'Active' ? 'bg-green-100 text-green-800' :
//                           myCoupon.status === 'Expired' ? 'bg-red-100 text-red-800' :
//                             'bg-gray-100 text-gray-800'
//                         }`}>
//                         {myCoupon.status}
//                       </span>
//                     </td>
//                     <td className="py-2 px-4 border border-gray-200">{formatDateTime(myCoupon.claimedAt)}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         ) : (
//           <div className="bg-gray-50 rounded-lg p-8 text-center">
//             <p className="text-gray-500">No coupons claimed yet</p>
//           </div>
//         )}
//       </div>

//       <div>
//         <h3 className="font-semibold mb-4 text-lg">Favorite Coupons ({user.favoriteCoupons?.length || 0})</h3>
//         {user.favoriteCoupons?.length ? (
//           <div className="overflow-x-auto">
//             <table className="min-w-full bg-white border border-gray-200">
//               <thead>
//                 <tr className="bg-gray-100">
//                   <th className="py-2 px-4 border border-gray-200">Image</th>
//                   <th className="py-2 px-4 border border-gray-200">Name</th>
//                   <th className="py-2 px-4 border border-gray-200">Category</th>
//                   <th className="py-2 px-4 border border-gray-200">Discount</th>
//                   <th className="py-2 px-4 border border-gray-200">Cost</th>
//                   <th className="py-2 px-4 border border-gray-200">Valid Until</th>
//                   <th className="py-2 px-4 border border-gray-200">Status</th>
//                   <th className="py-2 px-4 border border-gray-200">Created</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {user.favoriteCoupons.map((coupon, index) => (
//                   <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
//                     <td className="py-2 px-4 border border-gray-200">
//                       {coupon.couponImage ? (
//                         <img
//                           src={coupon.couponImage}
//                           alt={coupon.name}
//                           className="w-16 h-16 object-cover"
//                         />
//                       ) : (
//                         'No Image'
//                       )}
//                     </td>
//                     <td className="py-2 px-4 border border-gray-200">{coupon.name}</td>
//                     <td className="py-2 px-4 border border-gray-200 capitalize">{coupon.category}</td>
//                     <td className="py-2 px-4 border border-gray-200">{coupon.discountPercentage}% {coupon.couponCodeType === '%' ? 'off' : ''}</td>
//                     <td className="py-2 px-4 border border-gray-200">{coupon.requiredCoins} coins</td>
//                     <td className="py-2 px-4 border border-gray-200">{formatDate(coupon.validityDate)}</td>
//                     <td className="py-2 px-4 border border-gray-200">
//                       <span className={`px-2 py-1 text-xs rounded-full ${coupon.status === 'approved' ? 'bg-green-100 text-green-800' :
//                           coupon.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
//                             'bg-red-100 text-red-800'
//                         }`}>
//                         {coupon.status}
//                       </span>
//                     </td>
//                     <td className="py-2 px-4 border border-gray-200">{formatDate(coupon.createdAt)}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         ) : (
//           <div className="bg-gray-50 rounded-lg p-8 text-center">
//             <p className="text-gray-500">No favorite coupons added yet</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );

//   const renderCoinHistorySection = () => (
//     <div>
//       <h2 className="text-xl font-bold mb-4">Coin History</h2>
//       {user.coinHistory?.length ? (
//         <div className="overflow-x-auto">
//           <table className="min-w-full bg-white border border-gray-200">
//             <thead>
//               <tr className="bg-gray-100">
//                 <th className="py-2 px-4 border border-gray-200">Type</th>
//                 <th className="py-2 px-4 border border-gray-200">Amount</th>
//                 <th className="py-2 px-4 border border-gray-200">Message</th>
//                 <th className="py-2 px-4 border border-gray-200">Recipient</th>
//                 <th className="py-2 px-4 border border-gray-200">Date</th>
//               </tr>
//             </thead>
//             <tbody>
//               {user.coinHistory.map((entry, index) => (
//                 <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
//                   <td className="py-2 px-4 border border-gray-200 capitalize">{entry.type}</td>
//                   <td className="py-2 px-4 border border-gray-200">{entry.amount || 'N/A'}</td>
//                   <td className="py-2 px-4 border border-gray-200">{entry.message || 'N/A'}</td>
//                   <td className="py-2 px-4 border border-gray-200">
//                     {entry.toUser ? (entry.toUser.name || entry.toUser._id) : 'N/A'}
//                   </td>
//                   <td className="py-2 px-4 border border-gray-200">{formatDateTime(entry.timestamp)}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       ) : (
//         <p className="text-center py-4">No coin history available</p>
//       )}
//     </div>
//   );

//   const renderNotificationsSection = () => (
//     <div>
//       <h2 className="text-xl font-bold mb-4">Notifications ({user.notifications?.length || 0})</h2>
//       {user.notifications?.length ? (
//         <div className="overflow-x-auto">
//           <table className="min-w-full bg-white border border-gray-200">
//             <thead>
//               <tr className="bg-gray-100">
//                 <th className="py-2 px-4 border border-gray-200">Sender</th>
//                 <th className="py-2 px-4 border border-gray-200">Message</th>
//                 <th className="py-2 px-4 border border-gray-200">Type</th>
//                 <th className="py-2 px-4 border border-gray-200">Status</th>
//                 <th className="py-2 px-4 border border-gray-200">Date</th>
//               </tr>
//             </thead>
//             <tbody>
//               {user.notifications.map((notification, index) => (
//                 <tr key={index} className={notification.read ? 'bg-white' : 'bg-blue-50'}>
//                   <td className="py-2 px-4 border border-gray-200">{notification.vendorName || 'System'}</td>
//                   <td className="py-2 px-4 border border-gray-200">{notification.message}</td>
//                   <td className="py-2 px-4 border border-gray-200">{notification.type}</td>
//                   <td className="py-2 px-4 border border-gray-200">
//                     <span className={`px-2 py-1 text-xs rounded-full ${notification.read ? 'bg-gray-200' : 'bg-blue-200'}`}>
//                       {notification.read ? 'Read' : 'Unread'}
//                     </span>
//                   </td>
//                   <td className="py-2 px-4 border border-gray-200">{formatDateTime(notification.createdAt)}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       ) : (
//         <p className="text-center py-4">No notifications available</p>
//       )}
//     </div>
//   );

//   const renderChatMembersSection = () => (
//     <div>
//       <h2 className="text-xl font-bold mb-6">Chat Members ({user.MyChatMembers?.length || 0})</h2>

//       {user.MyChatMembers?.length ? (
//         <div className="overflow-x-auto">
//           <table className="min-w-full bg-white border border-gray-200">
//             <thead>
//               <tr className="bg-gray-100">
//                 <th className="py-2 px-4 border border-gray-200">Profile</th>
//                 <th className="py-2 px-4 border border-gray-200">Name</th>
//                 <th className="py-2 px-4 border border-gray-200">Email</th>
//                 <th className="py-2 px-4 border border-gray-200">Phone</th>
//                 <th className="py-2 px-4 border border-gray-200">Location</th>
//                 <th className="py-2 px-4 border border-gray-200">Coins</th>
//                 <th className="py-2 px-4 border border-gray-200">Member Since</th>
//                 <th className="py-2 px-4 border border-gray-200">Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               {user.MyChatMembers.map((member, index) => (
//                 <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
//                   <td className="py-2 px-4 border border-gray-200">
//                     {member.userId.profileImage ? (
//                       <img
//                         src={member.userId.profileImage}
//                         alt={`${member.userId.name}'s profile`}
//                         className="w-12 h-12 rounded-full object-cover border border-gray-300"
//                       />
//                     ) : (
//                       <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
//                         <span className="text-gray-500 text-sm">
//                           {member.userId.name.charAt(0).toUpperCase()}
//                         </span>
//                       </div>
//                     )}
//                   </td>
//                   <td className="py-2 px-4 border border-gray-200">{member.userId.name}</td>
//                   <td className="py-2 px-4 border border-gray-200">{member.userId.email}</td>
//                   <td className="py-2 px-4 border border-gray-200">{member.userId.phone || 'N/A'}</td>
//                   <td className="py-2 px-4 border border-gray-200">
//                     {member.userId.city || 'N/A'}, {member.userId.zipcode || 'N/A'}
//                   </td>
//                   <td className="py-2 px-4 border border-gray-200">{member.userId.coins || 0}</td>
//                   <td className="py-2 px-4 border border-gray-200">{formatDate(member.userId.createdAt)}</td>
//                   <td className="py-2 px-4 border border-gray-200">
//                     <span className={`px-2 py-1 text-xs rounded-full ${member.status === 'Accepted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
//                       {member.status === 'Accepted' ? 'Connected' : 'Pending'}
//                     </span>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       ) : (
//         <div className="bg-gray-50 rounded-lg p-8 text-center">
//           <p className="text-gray-500">No chat members found</p>
//         </div>
//       )}
//     </div>
//   );

//   const renderCategoryTimeSpentSection = () => {
//     // Check if user has category data
//     const hasCategoryData = user.categoryTimeSpent || user.categoryCoins || user.categorySessions;

//     if (!hasCategoryData) {
//       return (
//         <div className="text-center py-8">
//           <h2 className="text-xl font-bold mb-4">Category Time Spent</h2>
//           <p className="text-gray-500">No category activity data available</p>
//         </div>
//       );
//     }

//     return (
//       <div>
//         <h2 className="text-xl font-bold mb-4">Category Time Spent</h2>
//         <p className="text-gray-500 text-center py-8">
//           Category time spent data will be displayed here when available from the API
//         </p>
//       </div>
//     );
//   };

//   return (
//     <div className="max-w-7xl mx-auto p-6">
//       <Link to="/users" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
//         <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
//         </svg>
//         Back to Users List
//       </Link>

//       <h1 className="text-2xl font-bold mb-6">User Details: {user.name}</h1>

//       {/* Tabs */}
//       <div className="border-b border-gray-200 mb-6">
//         <nav className="flex space-x-4 overflow-x-auto">
//           <button
//             onClick={() => setActiveTab('profile')}
//             className={`py-2 px-4 font-medium whitespace-nowrap ${activeTab === 'profile' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
//           >
//             Profile
//           </button>
//           <button
//             onClick={() => setActiveTab('steps')}
//             className={`py-2 px-4 font-medium whitespace-nowrap ${activeTab === 'steps' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
//           >
//             Steps
//           </button>
//           <button
//             onClick={() => setActiveTab('coupons')}
//             className={`py-2 px-4 font-medium whitespace-nowrap ${activeTab === 'coupons' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
//           >
//             Coupons
//           </button>
//           <button
//             onClick={() => setActiveTab('coins')}
//             className={`py-2 px-4 font-medium whitespace-nowrap ${activeTab === 'coins' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
//           >
//             Coin History
//           </button>
//           <button
//             onClick={() => setActiveTab('notifications')}
//             className={`py-2 px-4 font-medium whitespace-nowrap ${activeTab === 'notifications' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
//           >
//             Notifications
//           </button>
//           <button
//             onClick={() => setActiveTab('chat')}
//             className={`py-2 px-4 font-medium whitespace-nowrap ${activeTab === 'chat' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
//           >
//             Chat Members
//           </button>
//           <button
//             onClick={() => setActiveTab('category')}
//             className={`py-2 px-4 font-medium whitespace-nowrap ${activeTab === 'category' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
//           >
//             Category Time
//           </button>
//         </nav>
//       </div>

//       {/* Tab Content */}
//       <div className="bg-white p-6 rounded-lg shadow">
//         {activeTab === 'profile' && renderProfileSection()}
//         {activeTab === 'steps' && renderStepsSection()}
//         {activeTab === 'coupons' && renderCouponsSection()}
//         {activeTab === 'coins' && renderCoinHistorySection()}
//         {activeTab === 'notifications' && renderNotificationsSection()}
//         {activeTab === 'chat' && renderChatMembersSection()}
//         {activeTab === 'category' && renderCategoryTimeSpentSection()}
//       </div>
//     </div>
//   );
// }

// export default UserDetail;


import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

// Responsive Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = window.innerWidth < 640 ? 3 : 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 2) {
        for (let i = 1; i <= 3; i++) pages.push(i);
        pages.push('...', totalPages);
      } else if (currentPage >= totalPages - 1) {
        pages.push(1, '...');
        for (let i = totalPages - 2; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="flex flex-wrap justify-center items-center gap-1 sm:gap-2 mt-4">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="px-2 sm:px-4 py-1 sm:py-2 text-sm sm:text-base bg-gray-200 hover:bg-gray-300 disabled:opacity-50 rounded transition-colors"
        aria-label="Previous page"
      >
        <span className="hidden sm:inline">Previous</span>
        <span className="sm:hidden">←</span>
      </button>

      {getPageNumbers().map((page, index) =>
        page === '...' ? (
          <span key={index} className="px-1 sm:px-2 text-sm">...</span>
        ) : (
          <button
            key={index}
            onClick={() => onPageChange(page)}
            className={`px-2 sm:px-4 py-1 sm:py-2 text-sm sm:text-base rounded transition-colors ${
              currentPage === page
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
            aria-label={`Go to page ${page}`}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="px-2 sm:px-4 py-1 sm:py-2 text-sm sm:text-base bg-gray-200 hover:bg-gray-300 disabled:opacity-50 rounded transition-colors"
        aria-label="Next page"
      >
        <span className="hidden sm:inline">Next</span>
        <span className="sm:hidden">→</span>
      </button>

      <span className="ml-2 text-xs sm:text-sm text-gray-600 mt-2 sm:mt-0">
        Page {currentPage} of {totalPages}
      </span>
    </div>
  );
};

function UserDetail() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  // Responsive items per page
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Pagination states
  const [stepsPage, setStepsPage] = useState(1);
  const [myCouponsPage, setMyCouponsPage] = useState(1);
  const [favoriteCouponsPage, setFavoriteCouponsPage] = useState(1);
  const [coinHistoryPage, setCoinHistoryPage] = useState(1);
  const [notificationsPage, setNotificationsPage] = useState(1);
  const [chatMembersPage, setChatMembersPage] = useState(1);

  // Set responsive items per page based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) { // Mobile
        setItemsPerPage(5);
      } else if (window.innerWidth < 1024) { // Tablet
        setItemsPerPage(8);
      } else { // Desktop
        setItemsPerPage(10);
      }
    };

    handleResize(); // Initial call
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
          throw new Error(`Failed to fetch user: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();

        if (!data.user) {
          throw new Error('User data not found in response');
        }

        setUser(data.user);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching user:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  // Loading state
  if (loading) return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-blue-500"></div>
      </div>
    </div>
  );

  // Error state
  if (error) return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-3 rounded">
        <strong className="font-semibold">Error:</strong> {error}
      </div>
    </div>
  );

  // No user state
  if (!user) return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0z" />
        </svg>
        <p className="mt-2 text-gray-600">No user data found</p>
      </div>
    </div>
  );

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid Date';
    }
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

  // Pagination helper
  const getPaginatedData = (data, page) => {
    if (!data || !Array.isArray(data)) return { items: [], totalPages: 0 };
    
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = data.slice(startIndex, endIndex);
    const totalPages = Math.ceil(data.length / itemsPerPage);

    return { items: paginatedItems, totalPages };
  };

  const renderProfileSection = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        {/* Profile Image */}
        <div className="flex justify-center lg:justify-start">
          {user.profileImage ? (
            <img
              src={user.profileImage}
              alt={`${user.name}'s profile`}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-2 border-gray-300 shadow"
            />
          ) : (
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-2xl sm:text-3xl font-bold">
                {user.name?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
          )}
        </div>

        {/* Basic Info Table */}
        <div className="flex-grow">
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Personal Information</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 w-1/3 text-sm sm:text-base">Name</td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">{user.name || 'N/A'}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm sm:text-base">Email</td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base truncate max-w-[200px] sm:max-w-none">{user.email || 'N/A'}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm sm:text-base">Phone</td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">{user.phone || 'N/A'}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm sm:text-base">Date of Birth</td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">{formatDate(user.dateOfBirth)}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm sm:text-base">Location</td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">
                      {user.city || 'N/A'}, {user.zipcode || 'N/A'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm sm:text-base">Account Created</td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">{formatDateTime(user.createdAt)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards - Responsive grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-3 sm:p-4 shadow">
          <h3 className="text-xs sm:text-sm font-semibold opacity-90">Total Coins</h3>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold mt-1 sm:mt-2">{user.coins ?? 0}</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-3 sm:p-4 shadow">
          <h3 className="text-xs sm:text-sm font-semibold opacity-90">Coupons</h3>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold mt-1 sm:mt-2">{user.coupons ?? 0}</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-3 sm:p-4 shadow">
          <h3 className="text-xs sm:text-sm font-semibold opacity-90">Favorite Coupons</h3>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold mt-1 sm:mt-2">{user.favoriteCoupons?.length ?? 0}</p>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-3 sm:p-4 shadow">
          <h3 className="text-xs sm:text-sm font-semibold opacity-90">Status</h3>
          <p className="text-base sm:text-lg md:text-xl font-bold mt-1 sm:mt-2 flex items-center justify-center sm:justify-start">
            <span className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full mr-1 sm:mr-2 ${user.onlineStatus ? 'bg-green-300' : 'bg-gray-300'}`}></span>
            {user.onlineStatus ? 'Online' : 'Offline'}
          </p>
        </div>
      </div>
    </div>
  );

  const renderStepsSection = () => {
    const { items: paginatedSteps, totalPages } = getPaginatedData(user.steps, stepsPage);
    
    return (
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Steps History</h2>
          <span className="text-xs sm:text-sm text-gray-600">
            Showing {paginatedSteps.length} of {user.steps?.length || 0} entries
          </span>
        </div>
        
        {user.steps?.length ? (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 border-b font-semibold text-left text-xs sm:text-sm">Date</th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 border-b font-semibold text-left text-xs sm:text-sm hidden sm:table-cell">Day</th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 border-b font-semibold text-left text-xs sm:text-sm">Steps</th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 border-b font-semibold text-left text-xs sm:text-sm hidden md:table-cell">Distance</th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 border-b font-semibold text-left text-xs sm:text-sm hidden lg:table-cell">Calories</th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 border-b font-semibold text-left text-xs sm:text-sm">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSteps.map((step, index) => (
                    <tr 
                      key={step._id || index} 
                      className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100'}
                    >
                      <td className="py-2 sm:py-3 px-2 sm:px-4 border-b text-xs sm:text-sm">{formatDate(step.date)}</td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 border-b text-xs sm:text-sm hidden sm:table-cell">{step.day || 'N/A'}</td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 border-b font-medium text-xs sm:text-sm">{step.stepsCount?.toLocaleString() || step.count?.toLocaleString() || '0'}</td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 border-b text-xs sm:text-sm hidden md:table-cell">{(step.distance || 0).toFixed(2)} km</td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 border-b text-xs sm:text-sm hidden lg:table-cell">{step.kcal || '0'}</td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 border-b text-xs sm:text-sm">{step.timeSpent || '0m'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg">
            <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="mt-2 text-sm sm:text-base text-gray-600">No steps data available</p>
          </div>
        )}
        
        {totalPages > 1 && (
          <Pagination 
            currentPage={stepsPage} 
            totalPages={totalPages} 
            onPageChange={setStepsPage} 
          />
        )}
      </div>
    );
  };

  const renderCouponsSection = () => {
    const { items: paginatedMyCoupons, totalPages: myCouponsTotalPages } = 
      getPaginatedData(user.MyCoupons, myCouponsPage);
    
    const { items: paginatedFavorites, totalPages: favoritesTotalPages } = 
      getPaginatedData(user.favoriteCoupons, favoriteCouponsPage);

    return (
      <div className="space-y-6 sm:space-y-8">
        <div>
          <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Active Coupon Code</h3>
          {user.couponCode ? (
            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-3 sm:p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
                <span className="font-mono font-bold text-blue-700 text-base sm:text-xl break-all">{user.couponCode}</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm sm:text-base">No active coupon code</p>
          )}
        </div>

        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
            <h3 className="text-lg sm:text-xl font-bold">My Coupons</h3>
            <span className="text-xs sm:text-sm text-gray-600">
              {user.MyCoupons?.length || 0} coupons
            </span>
          </div>
          
          {user.MyCoupons?.length ? (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-2 sm:py-3 px-2 sm:px-4 border-b font-semibold text-left text-xs sm:text-sm hidden md:table-cell">Image</th>
                      <th className="py-2 sm:py-3 px-2 sm:px-4 border-b font-semibold text-left text-xs sm:text-sm">Name</th>
                      <th className="py-2 sm:py-3 px-2 sm:px-4 border-b font-semibold text-left text-xs sm:text-sm hidden sm:table-cell">Category</th>
                      <th className="py-2 sm:py-3 px-2 sm:px-4 border-b font-semibold text-left text-xs sm:text-sm">Discount</th>
                      <th className="py-2 sm:py-3 px-2 sm:px-4 border-b font-semibold text-left text-xs sm:text-sm hidden lg:table-cell">Code</th>
                      <th className="py-2 sm:py-3 px-2 sm:px-4 border-b font-semibold text-left text-xs sm:text-sm">Status</th>
                      <th className="py-2 sm:py-3 px-2 sm:px-4 border-b font-semibold text-left text-xs sm:text-sm hidden md:table-cell">Claimed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedMyCoupons.map((myCoupon, index) => {
                      const coupon = myCoupon.couponId || {};
                      return (
                        <tr 
                          key={myCoupon._id || index} 
                          className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100'}
                        >
                          <td className="py-2 sm:py-3 px-2 sm:px-4 border-b hidden md:table-cell">
                            {coupon.couponImage ? (
                              <img
                                src={coupon.couponImage}
                                alt={coupon.name}
                                className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded"
                              />
                            ) : (
                              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded flex items-center justify-center">
                                <span className="text-gray-500 text-xs">No Image</span>
                              </div>
                            )}
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 border-b font-medium text-xs sm:text-sm truncate max-w-[150px]">{coupon.name || 'Unnamed'}</td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 border-b text-xs sm:text-sm hidden sm:table-cell capitalize">{coupon.category || 'N/A'}</td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 border-b font-semibold text-green-600 text-xs sm:text-sm">
                            {coupon.discountPercentage || 0}%
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 border-b font-mono bg-gray-100 text-xs sm:text-sm hidden lg:table-cell">
                            {myCoupon.couponCode || coupon.couponCode || 'N/A'}
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 border-b">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              myCoupon.status === 'Active' ? 'bg-green-100 text-green-800' :
                              myCoupon.status === 'Expired' ? 'bg-red-100 text-red-800' :
                              myCoupon.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                              {myCoupon.status || 'N/A'}
                            </span>
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 border-b text-xs sm:text-sm hidden md:table-cell">{formatDateTime(myCoupon.claimedAt)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 sm:p-8 text-center">
              <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-2 text-sm sm:text-base text-gray-600">No coupons claimed yet</p>
            </div>
          )}
          
          {myCouponsTotalPages > 1 && (
            <Pagination 
              currentPage={myCouponsPage} 
              totalPages={myCouponsTotalPages} 
              onPageChange={setMyCouponsPage} 
            />
          )}
        </div>

        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
            <h3 className="text-lg sm:text-xl font-bold">Favorite Coupons</h3>
            <span className="text-xs sm:text-sm text-gray-600">
              {user.favoriteCoupons?.length || 0} favorites
            </span>
          </div>
          
          {user.favoriteCoupons?.length ? (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-2 sm:py-3 px-2 sm:px-4 border-b font-semibold text-left text-xs sm:text-sm hidden sm:table-cell">Image</th>
                      <th className="py-2 sm:py-3 px-2 sm:px-4 border-b font-semibold text-left text-xs sm:text-sm">Name</th>
                      <th className="py-2 sm:py-3 px-2 sm:px-4 border-b font-semibold text-left text-xs sm:text-sm hidden md:table-cell">Category</th>
                      <th className="py-2 sm:py-3 px-2 sm:px-4 border-b font-semibold text-left text-xs sm:text-sm">Discount</th>
                      <th className="py-2 sm:py-3 px-2 sm:px-4 border-b font-semibold text-left text-xs sm:text-sm hidden lg:table-cell">Cost</th>
                      <th className="py-2 sm:py-3 px-2 sm:px-4 border-b font-semibold text-left text-xs sm:text-sm hidden md:table-cell">Valid Until</th>
                      <th className="py-2 sm:py-3 px-2 sm:px-4 border-b font-semibold text-left text-xs sm:text-sm">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedFavorites.map((coupon, index) => (
                      <tr 
                        key={coupon._id || index} 
                        className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100'}
                      >
                        <td className="py-2 sm:py-3 px-2 sm:px-4 border-b hidden sm:table-cell">
                          {coupon.couponImage ? (
                            <img
                              src={coupon.couponImage}
                              alt={coupon.name}
                              className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded flex items-center justify-center">
                              <span className="text-gray-500 text-xs">No Image</span>
                            </div>
                          )}
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 border-b font-medium text-xs sm:text-sm truncate max-w-[150px]">{coupon.name || 'Unnamed'}</td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 border-b text-xs sm:text-sm hidden md:table-cell capitalize">{coupon.category || 'N/A'}</td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 border-b font-semibold text-green-600 text-xs sm:text-sm">
                          {coupon.discountPercentage || 0}%
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 border-b text-xs sm:text-sm hidden lg:table-cell">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                            {coupon.requiredCoins || 0} coins
                          </span>
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 border-b text-xs sm:text-sm hidden md:table-cell">{formatDate(coupon.validityDate)}</td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 border-b">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            coupon.status === 'approved' ? 'bg-green-100 text-green-800' :
                            coupon.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                          }`}>
                            {coupon.status || 'N/A'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 sm:p-8 text-center">
              <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <p className="mt-2 text-sm sm:text-base text-gray-600">No favorite coupons added yet</p>
            </div>
          )}
          
          {favoritesTotalPages > 1 && (
            <Pagination 
              currentPage={favoriteCouponsPage} 
              totalPages={favoritesTotalPages} 
              onPageChange={setFavoriteCouponsPage} 
            />
          )}
        </div>
      </div>
    );
  };

  const renderCoinHistorySection = () => {
    const { items: paginatedHistory, totalPages } = getPaginatedData(user.coinHistory, coinHistoryPage);
    
    return (
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Coin History</h2>
          <span className="text-xs sm:text-sm text-gray-600">
            Showing {paginatedHistory.length} of {user.coinHistory?.length || 0} entries
          </span>
        </div>
        
        {user.coinHistory?.length ? (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 border-b font-semibold text-left text-xs sm:text-sm">Type</th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 border-b font-semibold text-left text-xs sm:text-sm">Amount</th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 border-b font-semibold text-left text-xs sm:text-sm hidden md:table-cell">Message</th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 border-b font-semibold text-left text-xs sm:text-sm">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedHistory.map((entry, index) => (
                    <tr 
                      key={entry._id || index} 
                      className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}
                    >
                      <td className="py-2 sm:py-3 px-2 sm:px-4 border-b">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          entry.type === 'added' ? 'bg-green-100 text-green-800' :
                          entry.type === 'deducted' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                        }`}>
                          {entry.type?.toUpperCase() || 'N/A'}
                        </span>
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 border-b font-bold text-sm sm:text-base">
                        {entry.amount > 0 ? '+' : ''}{entry.amount || 'N/A'}
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 border-b text-xs sm:text-sm hidden md:table-cell">{entry.message || 'N/A'}</td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 border-b text-xs sm:text-sm">{formatDateTime(entry.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg">
            <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="mt-2 text-sm sm:text-base text-gray-600">No coin history available</p>
          </div>
        )}
        
        {totalPages > 1 && (
          <Pagination 
            currentPage={coinHistoryPage} 
            totalPages={totalPages} 
            onPageChange={setCoinHistoryPage} 
          />
        )}
      </div>
    );
  };

  const renderNotificationsSection = () => {
    const { items: paginatedNotifications, totalPages } = 
      getPaginatedData(user.notifications, notificationsPage);
    
    return (
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Notifications</h2>
          <span className="text-xs sm:text-sm text-gray-600">
            {user.notifications?.length || 0} notifications
          </span>
        </div>
        
        {user.notifications?.length ? (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 border-b font-semibold text-left text-xs sm:text-sm">Sender</th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 border-b font-semibold text-left text-xs sm:text-sm">Message</th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 border-b font-semibold text-left text-xs sm:text-sm hidden md:table-cell">Type</th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 border-b font-semibold text-left text-xs sm:text-sm">Status</th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 border-b font-semibold text-left text-xs sm:text-sm hidden sm:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedNotifications.map((notification, index) => (
                    <tr 
                      key={notification._id || index} 
                      className={`${notification.read ? 'bg-white' : 'bg-blue-50'} hover:bg-gray-100`}
                    >
                      <td className="py-2 sm:py-3 px-2 sm:px-4 border-b font-medium text-xs sm:text-sm">
                        {notification.senderId?.name || notification.vendorName || 'System'}
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 border-b text-xs sm:text-sm max-w-[200px] truncate">{notification.message || 'N/A'}</td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 border-b text-xs sm:text-sm hidden md:table-cell">
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                          {notification.type || 'general'}
                        </span>
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 border-b">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          notification.read ? 'bg-gray-200 text-gray-700' : 'bg-blue-200 text-blue-800'
                        }`}>
                          {notification.read ? 'Read' : 'Unread'}
                        </span>
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 border-b text-xs sm:text-sm hidden sm:table-cell">{formatDateTime(notification.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg">
            <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className="mt-2 text-sm sm:text-base text-gray-600">No notifications available</p>
          </div>
        )}
        
        {totalPages > 1 && (
          <Pagination 
            currentPage={notificationsPage} 
            totalPages={totalPages} 
            onPageChange={setNotificationsPage} 
          />
        )}
      </div>
    );
  };

  const renderChatMembersSection = () => {
    const { items: paginatedMembers, totalPages } = 
      getPaginatedData(user.MyChatMembers, chatMembersPage);
    
    return (
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Chat Members</h2>
          <span className="text-xs sm:text-sm text-gray-600">
            {user.MyChatMembers?.length || 0} members
          </span>
        </div>

        {user.MyChatMembers?.length ? (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 border-b font-semibold text-left text-xs sm:text-sm">Profile</th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 border-b font-semibold text-left text-xs sm:text-sm">Name</th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 border-b font-semibold text-left text-xs sm:text-sm hidden md:table-cell">Email</th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 border-b font-semibold text-left text-xs sm:text-sm hidden lg:table-cell">Phone</th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 border-b font-semibold text-left text-xs sm:text-sm">Coins</th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 border-b font-semibold text-left text-xs sm:text-sm hidden sm:table-cell">Joined</th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 border-b font-semibold text-left text-xs sm:text-sm">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedMembers.map((member, index) => {
                    const userDetails = member.userId || member.userDetails || {};
                    return (
                      <tr 
                        key={member._id || index} 
                        className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100'}
                      >
                        <td className="py-2 sm:py-3 px-2 sm:px-4 border-b">
                          {userDetails.profileImage ? (
                            <img
                              src={userDetails.profileImage}
                              alt={`${userDetails.name}'s profile`}
                              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border"
                            />
                          ) : (
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm sm:text-base">
                              {userDetails.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                          )}
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 border-b font-medium text-xs sm:text-sm truncate max-w-[120px]">{userDetails.name || 'N/A'}</td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 border-b text-xs sm:text-sm hidden md:table-cell truncate max-w-[150px]">{userDetails.email || 'N/A'}</td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 border-b text-xs sm:text-sm hidden lg:table-cell">{userDetails.phone || 'N/A'}</td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 border-b font-bold text-xs sm:text-sm">{userDetails.coins || 0}</td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 border-b text-xs sm:text-sm hidden sm:table-cell">{formatDate(userDetails.createdAt)}</td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 border-b">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            member.status === 'Accepted' || member.status === 'accepted' ? 
                              'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {member.status === 'Accepted' || member.status === 'accepted' ? 'Connected' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-6 sm:p-8 text-center">
            <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="mt-2 text-sm sm:text-base text-gray-600">No chat members found</p>
          </div>
        )}
        
        {totalPages > 1 && (
          <Pagination 
            currentPage={chatMembersPage} 
            totalPages={totalPages} 
            onPageChange={setChatMembersPage} 
          />
        )}
      </div>
    );
  };

 const renderCategoryTimeSpentSection = () => {
  const raw = user?.categoryTimeSpent || {};

  /* ONLY REAL CATEGORIES */
  const categoryKeys = ["facts", "buzz", "quiz", "steps"];

  /* SANITIZE FUNCTION */
  const cleanTime = (data = {}) => {
    const safeNumber = (v) =>
      v === null || v === undefined || isNaN(v) ? 0 : v;

    const safeFormatted =
      !data.formatted ||
      data.formatted.includes("NaN")
        ? "0h 0m 0s"
        : data.formatted;

    return {
      formatted: safeFormatted,
      hours: safeNumber(data.hours),
      minutes: safeNumber(data.minutes),
      seconds: safeNumber(data.seconds),
      itemCount: safeNumber(data.itemCount),
      note: data.note || "",
    };
  };

  /* CLEANED CATEGORY DATA */
  const categories = categoryKeys.map((key) => ({
    name: key,
    ...cleanTime(raw[key]),
  }));

  const total = cleanTime(raw.total);
  const percentages = raw.percentageBreakdown || {};
  const live = raw.liveTimestamp;
  const disclaimer = raw.disclaimer;

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold">
          Category Time Spent
        </h2>
        {disclaimer && (
          <p className="text-sm text-gray-500 mt-1">{disclaimer}</p>
        )}
      </div>

      {/* TOTAL CARD */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl p-6 shadow-lg">
        <p className="text-sm opacity-90">Total Time Spent</p>
        <p className="text-3xl font-bold mt-1">{total.formatted}</p>
      </div>

      {/* CATEGORY GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {categories.map((cat, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-md border p-6 hover:shadow-xl transition"
          >
            {/* TITLE */}
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-semibold capitalize">
                {cat.name}
              </h3>
              <span className="text-sm text-gray-500">
                {cat.itemCount} items
              </span>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-2 gap-4">
              <StatBox label="Total Time" value={cat.formatted} />
              <StatBox label="Hours" value={cat.hours} />
              <StatBox label="Minutes" value={cat.minutes} />
              <StatBox label="Seconds" value={cat.seconds} />
            </div>

            {/* PROGRESS BAR */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Contribution</span>
                <span>{percentages?.[cat.name] || 0}%</span>
              </div>

              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500"
                  style={{ width: `${percentages?.[cat.name] || 0}%` }}
                />
              </div>
            </div>

            {/* NOTE */}
            {cat.note && (
              <p className="mt-3 text-sm text-gray-500 italic">
                {cat.note}
              </p>
            )}
          </div>
        ))}

      </div>

      {/* LAST UPDATED */}
      {live && (
        <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
          Last Updated:{" "}
          <span className="font-semibold">
            {live.date} • {live.time}
          </span>
        </div>
      )}
    </div>
  );
};

/* SMALL BOX */
const StatBox = ({ label, value }) => (
  <div className="bg-gray-50 rounded-lg p-3">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-lg font-bold mt-1">{value}</p>
  </div>
);


  return (
    <div className="min-h-screen bg-gray-50 px-3 py-4 sm:px-4 sm:py-6 lg:px-6 lg:py-8">
      {/* Back Button */}
      <Link to="/users" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 sm:mb-6 group">
        <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="font-medium text-sm sm:text-base">Back to Users List</span>
      </Link>

      {/* User Header - Responsive */}
      <div className="bg-white rounded-lg shadow-sm sm:shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-xl sm:text-2xl font-bold">
                  {user.name?.charAt(0)?.toUpperCase() || '?'}
                </span>
              </div>
            )}
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">{user.name}</h2>
              <p className="text-gray-600 text-sm sm:text-base truncate">{user.email}</p>
              <div className="flex items-center mt-1">
                <span className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full mr-2 ${user.onlineStatus ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                <span className="text-xs sm:text-sm text-gray-600">
                  {user.onlineStatus ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs sm:text-sm text-gray-600">Member since</p>
            <p className="font-semibold text-gray-800 text-sm sm:text-base">{formatDate(user.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Tabs - Horizontal scroll on mobile */}
      <div className="mb-4 sm:mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-2 sm:space-x-4 md:space-x-6 overflow-x-auto pb-4 scrollbar-hide">
            {[
              { id: 'profile', label: 'Profile', count: null },
              { id: 'steps', label: 'Steps', count: user.steps?.length },
              { id: 'coupons', label: 'Coupons', count: user.MyCoupons?.length },
              { id: 'coins', label: 'Coins', count: user.coinHistory?.length },
              { id: 'notifications', label: 'Notifications', count: user.notifications?.length },
              { id: 'chat', label: 'Chat', count: user.MyChatMembers?.length },
              { id: 'category', label: 'Category Time', count: null },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 py-2 px-2 sm:px-3 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count !== null && tab.count > 0 && (
                  <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
                    activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm sm:shadow-md overflow-hidden">
        <div className="p-4 sm:p-6">
          {activeTab === 'profile' && renderProfileSection()}
          {activeTab === 'steps' && renderStepsSection()}
          {activeTab === 'coupons' && renderCouponsSection()}
          {activeTab === 'coins' && renderCoinHistorySection()}
          {activeTab === 'notifications' && renderNotificationsSection()}
          {activeTab === 'chat' && renderChatMembersSection()}
          {activeTab === 'category' && renderCategoryTimeSpentSection()}
        </div>
      </div>
    </div>
  );
}

export default UserDetail;