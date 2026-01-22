import React, { useState, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";

const Sidebar = ({ isCollapsed, isMobile }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [activeItem, setActiveItem] = useState("");
  const location = useLocation();

  // Set active item based on current route
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Find the active menu item
    elements.forEach(item => {
      if (item.path && currentPath === item.path) {
        setActiveItem(item.name);
      } else if (item.dropdown) {
        item.dropdown.forEach(subItem => {
          if (currentPath === subItem.path) {
            setActiveItem(item.name);
            setOpenDropdown(item.name);
          }
        });
      }
    });
  }, [location]);

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        "https://credenhealth.onrender.com/api/admin/logout",
        {},
        { withCredentials: true }
      );
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
      name: "Dashboard",
      path: "/dashboard",
    },
    {
      icon: <i className="ri-user-fill text-white"></i>,
      name: "Users",
      dropdown: [{ name: "Get All Users", path: "/users" }],
    },
    {
      icon: <i className="ri-store-fill text-white"></i>,
      name: "Vendors",
      dropdown: [
        { name: "Create Vendor", path: "/create-vendor" },
        { name: "Get All Vendors", path: "/vendorlist" },
        { name: "Get All Vendors Docs", path: "/vendordocumentlist" },
      ],
    },
    {
      icon: <i className="ri-coupon-fill text-white"></i>,
      name: "Coupons",
      dropdown: [
        { name: "Create Coupon", path: "/create-coupon" },
        { name: "Get All Coupons", path: "/coupons" },
        { name: "User Coupons", path: "/user-coupons" },
        { name: "Coupon History", path: "/couponshistory" },
        { name: "Redeemed Coupons", path: "/redeemed-coupons" },
      ],
    },
    {
      icon: <i className="ri-refresh-fill text-white"></i>,
      name: "Spin Count",
      dropdown: [{ name: "Add Spin", path: "/spincount" }],
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
      icon: <i className="ri-booklet-fill text-white"></i>,
      name: "Bulk",
      dropdown: [
        { name: "Add Bulk Quiz", path: "/add-bulk-quiz" },
        { name: "Get All Quizzes", path: "/quizzes" },
        { name: "Add Bulk FunFacts", path: "/add-bulk-funfacts" },
        { name: "Get All Fan Facts", path: "/allfanfacts" },
      ],
    },
    {
      icon: <i className="ri-settings-3-fill text-white"></i>,
      name: "Settings",
      dropdown: [
        { name: "Create Privacy & Policy", path: "/create-privacy" },
        { name: "View Privacy & Policy", path: "/get-policy" },
      ],
    },
    {
      icon: <i className="ri-settings-3-fill text-white"></i>,
      name: "Payment",
      dropdown: [
        { name: "All Vendor Payment", path: "/allpayments" },
        { name: "Vendor Payment Pending", path: "/payment" },
        { name: "Vendor Rcvd Payment", path: "/rcvdpayment" },
      ],
    },
    {
      icon: <i className="ri-brain-fill text-white"></i>,
      name: "AI Generated",
      dropdown: [
        { name: "Fun Facts", path: "/generatefacts" },
        { name: "Latest News", path: "/generatenews" },
      ],
    },
    {
      icon: <i className="ri-notification-3-fill text-white"></i>,
      name: "Notifications",
      dropdown: [{ name: "All Notifications", path: "/notifications" }],
    },
    {
      icon: <i className="ri-logout-box-fill text-white"></i>,
      name: "Logout",
      action: handleLogout,
    },
  ];

  return (
    <div
      className={`transition-all duration-300 ease-in-out ${
        isMobile
          ? isCollapsed
            ? "w-0 opacity-0 -translate-x-full"
            : "w-64 opacity-100 translate-x-0"
          : isCollapsed
          ? "w-16"
          : "w-64"
      } h-screen overflow-y-auto no-scrollbar flex flex-col bg-gradient-to-b from-blue-800 to-blue-900 relative z-10`}
    >
      {/* Decorative top accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-blue-500"></div>
      
      <div className="sticky top-0 p-4 font-bold text-white flex justify-center text-xl bg-blue-800/90 backdrop-blur-sm z-10">
        <span className={`transition-opacity duration-300 ${isCollapsed && !isMobile ? "opacity-0" : "opacity-100"}`}>
          Admin Dashboard
        </span>
      </div>
      
      {/* Divider with gradient effect */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent my-2"></div>

      <nav className={`flex flex-col ${isCollapsed && !isMobile ? "items-center" : ""} space-y-1 mt-4 px-2`}>
        {elements.map((item, idx) => (
          <div key={idx} className="relative">
            {item.dropdown ? (
              <>
                <div
                  className={`flex items-center py-3 px-4 font-semibold text-sm text-white rounded-lg transition-all duration-300 cursor-pointer mx-2 group
                    ${
                      openDropdown === item.name || activeItem === item.name
                        ? "bg-blue-600/80 shadow-md scale-[1.02] text-white"
                        : "hover:bg-blue-700/70 hover:shadow-md"
                    }`}
                  onClick={() => toggleDropdown(item.name)}
                >
                  <span className="text-xl transition-transform duration-300 group-hover:scale-110">
                    {item.icon}
                  </span>
                  <span
                    className={`ml-4 transition-all duration-300 ${
                      isCollapsed && !isMobile
                        ? "w-0 opacity-0 overflow-hidden"
                        : "w-auto opacity-100"
                    }`}
                  >
                    {item.name}
                  </span>
                  <FaChevronDown
                    className={`ml-auto transition-all duration-300 ${
                      openDropdown === item.name ? "rotate-180" : "rotate-0"
                    } ${isCollapsed && !isMobile ? "hidden" : "block"}`}
                  />
                </div>
                
                {/* Dropdown animation container */}
                <div
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    openDropdown === item.name
                      ? "max-h-96 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <ul className="ml-6 pl-2 text-sm text-white space-y-1 border-l-2 border-blue-500/30">
                    {item.dropdown.map((subItem, subIdx) => {
                      const isActiveSubItem = location.pathname === subItem.path;
                      return (
                        <li key={subIdx} className="relative">
                          <Link
                            to={subItem.path}
                            className={`flex items-center space-x-2 py-2 px-3 font-medium cursor-pointer rounded-lg transition-all duration-300 no-underline
                              ${
                                isActiveSubItem
                                  ? "bg-blue-600/40 text-white pl-4"
                                  : "hover:bg-blue-700/30 hover:text-cyan-100"
                              }`}
                            onClick={() => {
                              if (isMobile) setOpenDropdown(null);
                            }}
                          >
                            <span
                              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                isActiveSubItem
                                  ? "bg-cyan-400 scale-125"
                                  : "bg-blue-400 group-hover:bg-cyan-400"
                              }`}
                            ></span>
                            <span className="transition-all duration-300">{subItem.name}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </>
            ) : (
              <Link
                to={item.path || "#"}
                className={`flex items-center py-3 px-4 font-semibold text-sm rounded-lg transition-all duration-300 cursor-pointer mx-2 group relative no-underline
                  ${
                    activeItem === item.name
                      ? "bg-blue-600 text-white shadow-md scale-[1.02]"
                      : "text-white hover:bg-blue-700/70 hover:shadow-md"
                  }`}
                onClick={item.action ? item.action : null}
              >
                <span className="text-xl transition-transform duration-300 group-hover:scale-110">
                  {item.icon}
                </span>
                <span
                  className={`ml-4 transition-all duration-300 ${
                    isCollapsed && !isMobile
                      ? "w-0 opacity-0 overflow-hidden"
                      : "w-auto opacity-100"
                  }`}
                >
                  {item.name}
                </span>
                
                {/* Active indicator */}
                {activeItem === item.name && (
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-cyan-400 rounded-l-full"></div>
                )}
                
                {/* Hover tooltip for collapsed state */}
                {isCollapsed && !isMobile && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-blue-900 text-white text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-20 shadow-lg">
                    {item.name}
                  </div>
                )}
              </Link>
            )}
          </div>
        ))}
      </nav>
      
      {/* Decorative bottom element */}
      <div className="mt-auto p-4">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-blue-500 to-transparent mb-2"></div>
        <div className="text-center text-xs text-blue-300/70 font-medium">
         
        </div>
      </div>
    </div>
  );
};

export default Sidebar;