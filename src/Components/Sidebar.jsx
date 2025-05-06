import React, { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";

const Sidebar = ({ isCollapsed, isMobile }) => {
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const handleLogout = async () => {
    try {
      await axios.post("https://credenhealth.onrender.com/api/admin/logout", {}, { withCredentials: true });
      localStorage.removeItem("authToken");
      alert("Logout successful");
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      alert("Logout failed. Please try again.");
    }
  };

  const elements = [
    {
      icon: <i className="ri-dashboard-fill text-white"></i>,
      name: "Admin Panel",
      path: "/dashboard",
    },
    {
      icon: <i className="ri-user-fill text-white"></i>,
      name: "Users",
      dropdown: [
        { name: "User List", path: "/users" },
      ],
    },
    {
      icon: <i className="ri-image-fill text-white"></i>,
      name: "Categories",
      dropdown: [
        { name: "Create Category", path: "/create-category" },
        { name: "Get All Categories", path: "/categorylist" },
      ],
    },
    {
      icon: <i className="ri-image-fill text-white"></i>,
      name: "Posters",
      dropdown: [
        { name: "Create Poster", path: "/create-poster" },
        { name: "Get All Posters", path: "/posterlist" },
      ],
    },
    {
      icon: <i className="ri-palette-fill text-white"></i>,
      name: "Logos",
      dropdown: [
        { name: "Create Logo", path: "/create-logo" },
        { name: "Get All Logos", path: "/logolist" },
      ],
    },
    {
      icon: <i className="ri-file-list-fill text-white"></i>,
      name: "Business Cards",
      dropdown: [
        { name: "Create Business Card", path: "/create-businesscard" },
        { name: "Get All Business Cards", path: "/business-cards-list" },
      ],
    },
    {
      icon: <i className="ri-file-list-fill text-white"></i>,
      name: "Subscription Plans",
      dropdown: [
        { name: "Create Plan", path: "/create-plan" },
        { name: "Get All Plans", path: "/planlist" },
        { name: "Purchased Plans", path: "/userplanlist" },
      ],
    },
    {
      icon: <i className="ri-shopping-cart-fill text-white"></i>,
      name: "Orders",
      dropdown: [
        { name: "Get All Orders", path: "/orderlist" },
      ],
    },
    {
      icon: <i className="ri-settings-3-fill text-white"></i>,
      name: "Settings",
      dropdown: [
        { name: "Create Privacy & Policy", path: "/create-privacy" },
        { name: "Get Privacy & Policy", path: "/get-policy" },
        { name: "Create AboutUs", path: "/aboutus" },
        { name: "Get AboutUs", path: "/getaboutus" },
        { name: "Create ContactUs", path: "/contactus" },
        { name: "Get ContactUs", path: "/getcontactus" },
      ],
    },
    {
      icon: <i className="ri-logout-box-fill text-white"></i>,
      name: "Logout",
      action: handleLogout,
    },
  ];

  return (
    <div
    className={`transition-all duration-300 ${isMobile ? (isCollapsed ? "w-0" : "w-64") : isCollapsed ? "w-16" : "w-64"} h-screen overflow-y-scroll no-scrollbar flex flex-col bg-gradient-to-b from-gray-800 to-blue-800`}
  >
  
      <div className="sticky top-0 p-4 font-bold text-white flex justify-center text-xl bg-[#1F2937] border-b border-gray-700">
        <span>Admin Panel</span>
      </div>

      <nav className={`flex flex-col ${isCollapsed && "items-center"} space-y-4 mt-4`}>
        {elements.map((item, idx) => (
          <div key={idx}>
            {item.dropdown ? (
              <>
                <div
                  className="flex items-center py-3 px-4 font-semibold text-sm text-white mx-4 rounded-lg hover:bg-gray-700 hover:text-[#00B074] duration-300 cursor-pointer"
                  onClick={() => toggleDropdown(item.name)}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className={`ml-4 ${isCollapsed && !isMobile ? "hidden" : "block"}`}>
                    {item.name}
                  </span>
                  <FaChevronDown
                    className={`ml-auto text-xs transform ${openDropdown === item.name ? "rotate-180" : "rotate-0"}`}
                  />
                </div>
                {openDropdown === item.name && (
                  <ul className="ml-10 text-sm text-white">
                    {item.dropdown.map((subItem, subIdx) => (
                      <li key={subIdx}>
                        <Link
                          to={subItem.path}
                          className="flex items-center space-x-2 py-2 font-medium cursor-pointer hover:text-[#00B074] hover:underline"
                          onClick={() => setOpenDropdown(null)}
                        >
                          <span className="text-[#00B074]">•</span>
                          <span>{subItem.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <Link
                to={item.path}
                className="flex items-center py-3 px-4 font-semibold text-sm text-white mx-4 rounded-lg hover:bg-gray-700 hover:text-[#00B074] duration-300 cursor-pointer"
                onClick={item.action ? item.action : null}
              >
                <span className="text-xl">{item.icon}</span>
                <span className={`ml-4 ${isCollapsed && !isMobile ? "hidden" : "block"}`}>
                  {item.name}
                </span>
              </Link>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
