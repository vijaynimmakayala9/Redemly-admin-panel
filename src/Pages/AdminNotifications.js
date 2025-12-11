import React, { useState, useEffect } from "react";
import { MdNotificationsActive, MdDelete } from "react-icons/md";
import { FaUserShield, FaUserPlus, FaExclamationTriangle, FaShoppingCart, FaTag } from "react-icons/fa";

const iconMap = {
  newUser: <FaUserPlus className="text-green-600" />,
  security: <FaExclamationTriangle className="text-red-600" />,
  roleChange: <FaUserShield className="text-blue-600" />,
  vendorOrder: <FaShoppingCart className="text-blue-600" />,
  vendorCoupon: <FaTag className="text-green-600" />,
};

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch notifications from API
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("http://31.97.206.144:6098/api/admin/notifications"); // Update with your actual endpoint
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();
        // Assuming API returns { message, data: [notifications] }
        setNotifications(data.data || []);
      } catch (err) {
        setError(err.message || "Failed to fetch notifications");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Handle notification delete with API call
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://31.97.206.144:6098/api/admin/notifications/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete notification");
      }

      // Remove from local state after successful delete
      setNotifications((prev) => prev.filter((notif) => notif._id !== id));
    } catch (err) {
      alert(`Error deleting notification: ${err.message}`);
    }
  };

  if (loading) return <div className="p-4 text-center">Loading notifications...</div>;
  if (error) return <div className="p-4 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
        <MdNotificationsActive className="text-blue-600 text-xl" />
        Admin Notifications
      </h1>

      <div className="space-y-2">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <div
              key={notif._id}
              className="flex items-start justify-between bg-white p-3 rounded-md shadow-sm border border-gray-100 hover:shadow-md transition"
            >
              <div className="flex gap-3">
                <div className="text-xl mt-0.5">
                  {iconMap[notif.type] || <MdNotificationsActive className="text-gray-600" />}
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-gray-800">{notif.title}</h2>
                  {notif.vendorName && (
                    <p className="text-xs text-gray-500 italic">Vendor: {notif.vendorName}</p>
                  )}
                  <p className="text-xs text-gray-600 leading-tight">{notif.message}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {new Date(notif.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleDelete(notif._id)}
                className="text-red-500 hover:text-red-700 text-lg ml-3 mt-1"
                title="Delete notification"
              >
                <MdDelete />
              </button>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 text-sm">No notifications available.</p>
        )}
      </div>
    </div>
  );
};

export default AdminNotifications;
