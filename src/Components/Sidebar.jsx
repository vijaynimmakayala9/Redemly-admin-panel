import React, { useState, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";

const Sidebar = ({ isCollapsed, isMobile, setIsCollapsed }) => {
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
        window.location.href = "/";
  };

  // Close sidebar when clicking a link on mobile
  const handleMobileLinkClick = () => {
    if (isMobile) {
      setIsCollapsed(true);
      setOpenDropdown(null);
    }
  };

  const elements = [
    {
      icon: <i className="ri-dashboard-fill"></i>,
      name: "Dashboard",
      path: "/dashboard",
    },
    {
      icon: <i className="ri-user-fill"></i>,
      name: "Users",
      dropdown: [{ name: "Get All Users", path: "/users" }],
    },
    {
      icon: <i className="ri-store-fill"></i>,
      name: "Vendors",
      dropdown: [
        { name: "Create Vendor", path: "/create-vendor" },
        { name: "Get All Vendors", path: "/vendorlist" },
        { name: "Get All Vendors Docs", path: "/vendordocumentlist" },
      ],
    },
    {
      icon: <i className="ri-coupon-fill"></i>,
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
      icon: <i className="ri-refresh-fill"></i>,
      name: "Spin Count",
      dropdown: [{ name: "Add Spin", path: "/spincount" }],
    },
    {
      icon: <i className="ri-layout-grid-fill"></i>,
      name: "Banners",
      dropdown: [
        { name: "Create banner", path: "/create-banner" },
        { name: "Get All Banners", path: "/banners" },
      ],
    },
    {
      icon: <i className="ri-image-fill"></i>,
      name: "Categories",
      dropdown: [
        { name: "Create Category", path: "/create-category" },
        { name: "Get All Categories", path: "/categorylist" },
      ],
    },
    {
      icon: <i className="ri-booklet-fill"></i>,
      name: "Bulk",
      dropdown: [
        { name: "Add Bulk Quiz", path: "/add-bulk-quiz" },
        { name: "Get All Quizzes", path: "/quizzes" },
        { name: "Add Bulk FunFacts", path: "/add-bulk-funfacts" },
        { name: "Get All Fan Facts", path: "/allfanfacts" },
      ],
    },
    {
      icon: <i className="ri-settings-3-fill"></i>,
      name: "Settings",
      dropdown: [
        { name: "Create Privacy & Policy", path: "/create-privacy" },
        { name: "View Privacy & Policy", path: "/get-policy" },
      ],
    },
    {
      icon: <i className="ri-settings-3-fill"></i>,
      name: "Payment",
      dropdown: [
        { name: "Vendor Price", path: "/vendorprice"},
        { name: "All Vendor Payment", path: "/allpayments" },
        { name: "Vendor Payment Pending", path: "/payment" },
        { name: "Vendor Paid Payment", path: "/rcvdpayment" },
      ],
    },
    {
      icon: <i className="ri-money-dollar-circle-line"></i>,
      name: "Revenue",
      dropdown: [{ name: "Revenue", path: "/revenue" }],
    },
    {
      icon: <i className="ri-brain-fill"></i>,
      name: "AI Generated",
      dropdown: [
        { name: "Fun Facts", path: "/generatefacts" },
        { name: "Latest News", path: "/generatenews" },
      ],
    },
    {
      icon: <i className="ri-notification-3-fill"></i>,
      name: "Notifications",
      dropdown: [{ name: "All Notifications", path: "/notifications" }],
    },
    {
      icon: <i className="ri-logout-box-fill"></i>,
      name: "Logout",
      action: handleLogout,
    },
  ];

  // Check if a dropdown item is active
  const isDropdownItemActive = (dropdownItems) => {
    return dropdownItems.some(item => item.path === location.pathname);
  };

  return (
    <aside
      className={`sidebar fixed md:relative h-full transition-all duration-300 z-40
        ${isMobile
          ? (isCollapsed
            ? '-translate-x-full'
            : 'translate-x-0 w-64')
          : isCollapsed
            ? 'w-0 md:w-16'
            : 'w-64'
        }`}
      style={{
        height: isMobile ? '100vh' : 'calc(100vh)',
        top: isMobile ? 0 : 'auto'
      }}
    >


      <div className="h-full overflow-y-auto no-scrollbar flex flex-col bg-gradient-to-b from-blue-800 to-blue-900">
        {/* Decorative top accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-blue-500"></div>

        <div className="sticky top-0 z-10 bg-blue-800/90 backdrop-blur-sm px-4 py-3">
          <div className="relative flex items-center justify-between">
            {/* Title */}
            {(!isCollapsed || isMobile) ? (
              <span className="text-lg md:text-xl font-bold text-white">
                Admin Dashboard
              </span>
            ) : (
              <span className="text-lg font-bold text-white">AD</span>
            )}

            {/* Close button (mobile only) */}
            {isMobile && !isCollapsed && (
              <button
                onClick={() => setIsCollapsed(true)}
                className="absolute right-0 text-white text-2xl hover:text-yellow-300 transition"
                aria-label="Close sidebar"
              >
                <i className="ri-close-line"></i>
              </button>
            )}
          </div>
        </div>


        {/* Divider with gradient effect */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent my-2"></div>

        <nav className="flex flex-col gap-1 mt-2 p-2">
          {elements.map((item, idx) => (
            <div key={idx} className="sidebar-item relative">
              {item.dropdown ? (
                <>
                  <div
                    className={`flex items-center py-3 px-3 font-semibold text-sm rounded-lg transition-all duration-300 cursor-pointer
                      ${openDropdown === item.name || activeItem === item.name
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md"
                        : "text-white hover:bg-blue-700/70 hover:shadow-md"
                      }`}
                    onClick={() => toggleDropdown(item.name)}
                  >
                    <span className={`text-xl min-w-[24px] flex justify-center
                      ${openDropdown === item.name || activeItem === item.name ? 'text-yellow-300' : 'text-white'}`}
                    >
                      {item.icon}
                    </span>
                    {(!isCollapsed || isMobile) && (
                      <>
                        <span className="ml-3 flex-1">{item.name}</span>
                        <FaChevronDown
                          className={`ml-2 text-xs transition-transform duration-300 ${openDropdown === item.name ? "rotate-180" : "rotate-0"
                            }`}
                        />
                      </>
                    )}
                  </div>

                  {/* Active indicator for collapsed sidebar */}
                  {(isCollapsed && !isMobile) && (activeItem === item.name || isDropdownItemActive(item.dropdown)) && (
                    <div className="absolute left-0 top-0 h-full w-1 bg-yellow-400 rounded-r"></div>
                  )}

                  {/* Dropdown animation container */}
                  {(!isCollapsed || isMobile) && (
                    <div
                      className={`overflow-hidden transition-all duration-300 ${openDropdown === item.name
                        ? "max-h-96 opacity-100 mt-1"
                        : "d-none max-h-0 opacity-0 mt-0"
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
                                  ${isActiveSubItem
                                    ? "bg-blue-600/40 text-white"
                                    : "hover:bg-blue-700/30 hover:text-cyan-100"
                                  }`}
                                onClick={handleMobileLinkClick}
                              >
                                <span
                                  className={`w-2 h-2 rounded-full transition-all duration-300 ${isActiveSubItem
                                    ? "bg-cyan-400 scale-125"
                                    : "bg-blue-400"
                                    }`}
                                ></span>
                                <span className="transition-all duration-300">{subItem.name}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to={item.path || "#"}
                  className={`relative flex items-center py-3 px-3 font-semibold text-sm rounded-lg transition-all duration-300 cursor-pointer no-underline
                    ${activeItem === item.name
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md"
                      : "text-white hover:bg-blue-700/70 hover:shadow-md"
                    }`}
                  onClick={() => {
                    if (item.action) {
                      item.action();
                    }
                    handleMobileLinkClick();
                  }}
                >
                  <span className={`text-xl min-w-[24px] flex justify-center
                    ${activeItem === item.name ? 'text-yellow-300' : 'text-white'}`}
                  >
                    {item.icon}
                  </span>
                  {(!isCollapsed || isMobile) && (
                    <span className="ml-3">{item.name}</span>
                  )}

                  {/* Active indicator for collapsed sidebar */}
                  {(isCollapsed && !isMobile) && activeItem === item.name && (
                    <div className="absolute left-0 top-0 h-full w-1 bg-yellow-400 rounded-r"></div>
                  )}

                  {/* Active indicator arrow for expanded sidebar */}
                  {(!isCollapsed || isMobile) && activeItem === item.name && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-cyan-400 rounded-l-full"></div>
                  )}

                  {/* Hover tooltip for collapsed state */}
                  {(isCollapsed && !isMobile) && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-blue-900 text-white text-xs font-medium rounded-md opacity-0 hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-20 shadow-lg pointer-events-none">
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
            {/* Optional footer content */}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;