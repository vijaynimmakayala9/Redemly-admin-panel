import { MdNotificationsNone } from "react-icons/md";
import { RiMenu2Line, RiMenu3Line } from "react-icons/ri";
import { useNavigate } from "react-router-dom";

const Navbar = ({ setIsCollapsed, isCollapsed }) => {
  const navigate = useNavigate();

  const totalNotifications = 5; // Dummy count

  const handleNotificationsClick = () => {
    navigate("/notifications");
  };

  return (
    <nav className="bg-blue-800 text-white sticky top-0 w-full h-16 px-4 flex items-center shadow-lg z-50">
      {/* Sidebar toggle button */}
      <button onClick={() => setIsCollapsed(!isCollapsed)} className="text-xl p-2">
        {isCollapsed ? (
          <RiMenu2Line className="text-2xl text-[#AAAAAA]" />
        ) : (
          <RiMenu3Line className="text-2xl text-[#AAAAAA]" />
        )}
      </button>

      {/* Notifications */}
      <button
        onClick={handleNotificationsClick}
        className="relative flex items-center gap-1 ml-4 px-3 py-2 rounded hover:bg-blue-700 cursor-pointer select-none"
        title="Notifications"
      >
        <MdNotificationsNone className="text-2xl" />
        {totalNotifications > 0 && (
          <span className="absolute top-1 left-6 flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full min-w-[18px] min-h-[18px]">
            {totalNotifications}
          </span>
        )}
        {!isCollapsed && <span className="text-sm font-medium">Notifications</span>}
      </button>

      {/* Spacer to push logo to right */}
      <div className="flex-grow"></div>

      {/* Logo + Redemly title on the right side */}
      <div className="flex items-center gap-2 pr-4">
        <img
          src="/discount logo.png"
          alt="Vendor Logo"
          className="w-[40px] h-auto" // No border or circle
        />
        <span className="text-white-400 font-bold text-lg">Redemly</span>
      </div>
    </nav>
  );
};

export default Navbar;
