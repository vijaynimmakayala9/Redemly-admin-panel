import { useState, useEffect } from "react";
import { MdNotificationsNone } from "react-icons/md";
import {
  RiMenu2Line,
  RiMenu3Line,
  RiFullscreenLine,
  RiFullscreenExitLine,
} from "react-icons/ri";
import { useNavigate } from "react-router-dom";

const Navbar = ({ setIsCollapsed, isCollapsed, isMobile, toggleSidebar }) => {
  const navigate = useNavigate();

  const [totalNotifications, setTotalNotifications] = useState(0); // UNREAD count
  const [isFullscreen, setIsFullscreen] = useState(false);


  /* ---------------- FETCH UNREAD NOTIFICATIONS ---------------- */
  const fetchUnreadCount = async () => {
    try {

      const res = await fetch(
        `https://api.redemly.com/api/admin/notifications`
      );
      const json = await res.json();
      console.log("Unread notifications response:", json);

      const unread = json?.data?.stats?.unread ?? 0;
      console.log("Unread notifications:", unread);
      setTotalNotifications(unread);
    } catch (err) {
      console.error("Unread notification fetch failed", err);
    }
  };

  /* ---------------- AUTO REFRESH EVERY 10 SECS ---------------- */
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 2000);
    return () => clearInterval(interval);
  }, []);

  /* ---------------- SIDEBAR TOGGLE ---------------- */
  const handleSidebarToggle = () => {
    if (toggleSidebar) toggleSidebar();
    else setIsCollapsed(!isCollapsed);
  };

  /* ---------------- FULLSCREEN TOGGLE ---------------- */
  const toggleFullscreen = () => {
    const elem = document.documentElement;

    if (!document.fullscreenElement) {
      elem.requestFullscreen?.() ||
        elem.webkitRequestFullscreen?.() ||
        elem.msRequestFullscreen?.();
    } else {
      document.exitFullscreen?.() ||
        document.webkitExitFullscreen?.() ||
        document.msExitFullscreen?.();
    }
  };

  /* ---------------- FULLSCREEN STATE LISTENER ---------------- */
  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleChange);
    document.addEventListener("webkitfullscreenchange", handleChange);
    document.addEventListener("mozfullscreenchange", handleChange);
    document.addEventListener("MSFullscreenChange", handleChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleChange);
      document.removeEventListener("webkitfullscreenchange", handleChange);
      document.removeEventListener("mozfullscreenchange", handleChange);
      document.removeEventListener("MSFullscreenChange", handleChange);
    };
  }, []);

  /* ---------------- KEYBOARD SHORTCUTS ---------------- */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "F11") {
        e.preventDefault();
        toggleFullscreen();
      }
      if (e.key === "Escape" && document.fullscreenElement) {
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <nav className="bg-blue-800 text-white sticky top-0 w-full h-16 px-3 sm:px-4 flex items-center shadow-lg z-50">
      {/* Sidebar toggle */}
      <button
        onClick={handleSidebarToggle}
        className="text-xl p-2 hover:bg-blue-700 rounded-lg transition"
        aria-label="Toggle sidebar"
      >
        {isCollapsed ? (
          <RiMenu2Line className="text-2xl text-[#AAAAAA]" />
        ) : (
          <RiMenu3Line className="text-2xl text-[#AAAAAA]" />
        )}
      </button>

      {/* Notifications */}
      <button
        onClick={() => navigate("/notifications")}
        className="relative flex items-center gap-1 ml-2 sm:ml-4 px-3 py-2 rounded hover:bg-blue-700 transition"
      >
        <MdNotificationsNone className="text-xl sm:text-2xl" />

        {/* 🔴 UNREAD PREFIX */}
        {totalNotifications > 0 && (
          <span className="absolute top-1 left-6 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
            {totalNotifications > 99 ? "99+" : totalNotifications}
          </span>
        )}

        {!isCollapsed && (
          <span className="text-sm font-medium hidden xs:inline ml-1">
            Notifications
          </span>
        )}
      </button>

      {/* Spacer */}
      <div className="flex-grow" />

      {/* Fullscreen button */}
      <button
        onClick={toggleFullscreen}
        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition mr-2"
        title={isFullscreen ? "Exit Fullscreen (F11)" : "Enter Fullscreen (F11)"}
      >
        {isFullscreen ? (
          <RiFullscreenExitLine className="text-xl" />
        ) : (
          <RiFullscreenLine className="text-xl" />
        )}
      </button>

      {/* Logo */}
      <div className="flex items-center gap-2 pr-2 sm:pr-4 border-l border-white/20">
        <img
          src="/discount logo.png"
          alt="Vendor Logo"
          className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
        />
        <span className="font-bold text-base sm:text-lg hidden md:inline">
          Redemly
        </span>
      </div>
    </nav>
  );
};

export default Navbar;
