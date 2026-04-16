import { useState, useEffect, useRef } from "react";
import Sidebar from "../Components/Sidebar";
import Navbar from "../Components/Navbar";

export default function AdminLayout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      // Auto-collapse sidebar on mobile initially
      if (mobile) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle click outside sidebar on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMobile && 
        !isCollapsed && 
        sidebarRef.current && 
        !sidebarRef.current.contains(event.target) &&
        !event.target.closest('.navbar-toggle-button')
      ) {
        setIsCollapsed(true);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMobile, isCollapsed]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isMobile && !isCollapsed) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobile, isCollapsed]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="flex h-screen w-full relative overflow-hidden bg-[#EFF0F1]">
      {/* Overlay for mobile: Only visible when sidebar is open on mobile screens */}
      {isMobile && !isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar Container: 
          We define the width logic here so Flexbox knows how much space to give the Main Content.
      */}
      <div 
        ref={sidebarRef} 
        className={`z-50 transition-all duration-300 ease-in-out ${
          isMobile 
            ? `fixed inset-y-0 left-0 transform ${isCollapsed ? "-translate-x-full" : "translate-x-0"}` 
            : `${isCollapsed ? "w-20" : "w-64"}`
        }`}
      >
        <Sidebar 
          isCollapsed={isCollapsed} 
          isMobile={isMobile} 
          setIsCollapsed={setIsCollapsed}
        />
      </div>

      {/* Main Content Area:
          1. flex-1: Takes up all remaining space.
          2. min-w-0: CRITICAL. Prevents content from forcing the container to be wider than the viewport.
      */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        <Navbar 
          setIsCollapsed={setIsCollapsed} 
          isCollapsed={isCollapsed}
          isMobile={isMobile}
          toggleSidebar={toggleSidebar}
        />
        
        {/* Page Content */}
        <main className="p-3 sm:p-4 md:p-6 overflow-y-auto flex-1 bg-[#EFF0F1]">
          {children}
        </main>
      </div>
    </div>
  );
}