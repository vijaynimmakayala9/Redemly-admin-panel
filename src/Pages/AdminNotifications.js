import React, { useEffect, useState } from "react";
import {
  MdNotificationsActive,
  MdDone,
  MdMarkEmailRead,
  MdRefresh,
} from "react-icons/md";
import {
  FaUserShield,
  FaExclamationTriangle,
  FaShoppingCart,
  FaTag,
  FaHeart,
} from "react-icons/fa";

const PAGE_LIMIT = 10;

/* -------- ICON MAP -------- */
const iconMap = {
  coupon_approved_user: <FaTag className="text-green-600" />,
  coupon_download: <FaShoppingCart className="text-blue-600" />,
  coupon_rejected: <FaExclamationTriangle className="text-red-600" />,
  coupon_approved: <FaTag className="text-green-700" />,
  favorite: <FaHeart className="text-pink-500" />,
  coupon: <FaTag className="text-indigo-600" />,
  admin_action: <FaUserShield className="text-blue-700" />,
};

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  /* -------- FETCH NOTIFICATIONS -------- */
  const fetchNotifications = async (pageNo = page) => {
    try {
      setLoading(true);

      const res = await fetch(
        `https://api.redemly.com/api/admin/notifications?page=${pageNo}&limit=${PAGE_LIMIT}`
      );
      const json = await res.json();

      setNotifications(json.data.notifications || []);
      setTotalPages(json.data.pagination.totalPages || 1);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(page);
  }, [page]);

  /* -------- MARK SINGLE AS READ -------- */
  const markAsRead = async (id) => {
    try {
      await fetch(
        `https://api.redemly.com/api/admin/notifications/${id}/read`,
        { method: "PUT" }
      );

      setNotifications((prev) =>
        prev.map((n) =>
          n._id === id ? { ...n, isRead: true } : n
        )
      );
    } catch (err) {
      console.error("Mark read failed", err);
    }
  };

  /* -------- MARK ALL AS READ -------- */
  const markAllAsRead = async () => {
    try {
      await fetch(
        "https://api.redemly.com/api/admin/notifications/mark-all-read",
        { method: "PUT" }
      );

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
    } catch (err) {
      console.error("Mark all read failed", err);
    }
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      {/* -------- HEADER -------- */}
      <div className="flex items-center justify-between mb-4 gap-2">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <MdNotificationsActive className="text-blue-600 text-xl" />
          Admin Notifications
        </h1>

        <div className="flex gap-2">
          {/* Refresh */}
          <button
            onClick={() => fetchNotifications(page)}
            disabled={loading}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            title="Refresh notifications"
          >
            <MdRefresh className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          {/* Mark all read */}
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <MdMarkEmailRead />
            Mark all read
          </button>
        </div>
      </div>

      {/* -------- LIST -------- */}
      <div className="space-y-3">
        {!loading && notifications.length === 0 && (
          <p className="text-center text-gray-500">
            No notifications found
          </p>
        )}

        {notifications.map((notif) => (
          <div
            key={notif._id}
            className={`flex justify-between items-start p-3 rounded border transition
              ${notif.isRead
                ? "bg-white"
                : "bg-blue-50 border-blue-300"
              }`}
          >
            <div className="flex gap-3">
              <div className="text-xl mt-1">
                {iconMap[notif.type] || (
                  <MdNotificationsActive className="text-gray-500" />
                )}
              </div>

              <div>
                <h2 className="text-sm font-semibold">
                  {notif.title}
                </h2>

                {notif.vendorName && (
                  <p className="text-xs text-gray-500 italic">
                    Vendor: {notif.vendorName}
                  </p>
                )}

                <p className="text-xs text-gray-600">
                  {notif.message}
                </p>

                <p className="text-[11px] text-gray-400 mt-1">
                  {new Date(notif.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {!notif.isRead && (
              <button
                onClick={() => markAsRead(notif._id)}
                className="text-green-600 hover:text-green-800"
                title="Mark as read"
              >
                <MdDone className="text-xl" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* -------- PAGINATION -------- */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 text-sm rounded bg-gray-200 disabled:opacity-50"
          >
            Prev
          </button>

          <span className="text-sm font-medium">
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 text-sm rounded bg-gray-200 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;
