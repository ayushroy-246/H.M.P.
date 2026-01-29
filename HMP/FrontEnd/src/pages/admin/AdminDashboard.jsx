import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import Header from "@/components/Header";
import { 
  Menu, X, Home, UserPlus, ShieldPlus, 
  Building, Search, PlusCircle, ShieldCheck 
} from "lucide-react"; 

const AdminDashboard = () => {
  const { userData } = useSelector((state) => state.auth);
  const isSuperAdmin = userData?.role === "superAdmin";
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  // ✨ PREMIUM NAV STYLE (Red Theme)
  const navLinkStyles = ({ isActive }) =>
    `flex items-center py-3 px-6 my-1 font-semibold transition-all duration-200 border-l-4 ${
      isActive
        ? "bg-red-800 dark:bg-red-950 border-white text-white shadow-inner"
        : "border-transparent text-red-100 hover:bg-red-600 hover:text-white"
    }`;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-950">
      
      {/* 1. Header with Theme Toggle */}
      <Header />

      {/* 2. Mobile Menu Bar (Red) */}
      <div className="lg:hidden bg-red-700 dark:bg-red-900 p-4 flex justify-between items-center text-white shadow-md z-20">
        <span className="font-bold uppercase tracking-widest text-sm flex items-center gap-2">
          <ShieldCheck size={18} /> Admin Portal
        </span>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 outline-none hover:bg-white/10 rounded-lg transition">
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className="flex flex-1 relative overflow-hidden">
        
        {/* 3. SIDEBAR (Red Theme) */}
        <aside 
          className={`
            fixed lg:static inset-y-0 left-0 z-50
            w-64 bg-red-700 dark:bg-red-900 text-white transform transition-transform duration-300 ease-in-out
            ${isMenuOpen ? "translate-x-0" : "-translate-x-full"} 
            lg:translate-x-0 flex flex-col shadow-2xl
          `}
        >
          {/* Sidebar Header */}
          <div className="p-6 border-b border-red-600 dark:border-red-800">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="bg-white dark:bg-gray-800 text-red-700 dark:text-red-400 p-1.5 rounded-lg shadow-sm">
                <ShieldCheck size={20} />
              </span>
              Admin Panel
            </h2>
            <p className="text-xs text-red-200 mt-1 ml-1">System Management</p>
          </div>

          {/* 👇 ADDED no-scrollbar HERE */}
          <nav className="flex-1 overflow-y-auto py-4 no-scrollbar">
            <ul className="flex flex-col gap-1">
              
              <li className="px-6 text-xs font-bold text-red-300 uppercase tracking-wider mb-2 mt-2">
                Overview
              </li>
              <li>
                <NavLink to="/admin/dashboard" end className={navLinkStyles} onClick={closeMenu}>
                  <Home size={20} className="mr-3"/> Home
                </NavLink>
              </li>
              <li>
                <NavLink to="search-user" className={navLinkStyles} onClick={closeMenu}>
                  <Search size={20} className="mr-3"/> Search Users
                </NavLink>
              </li>

              <li className="px-6 text-xs font-bold text-red-300 uppercase tracking-wider mb-2 mt-6">
                Registration
              </li>
              <li>
                <NavLink to="add-student" className={navLinkStyles} onClick={closeMenu}>
                  <UserPlus size={20} className="mr-3"/> Add Student
                </NavLink>
              </li>
              <li>
                <NavLink to="add-warden" className={navLinkStyles} onClick={closeMenu}>
                  <ShieldPlus size={20} className="mr-3"/> Add Warden
                </NavLink>
              </li>
              
              {isSuperAdmin && (
                <li>
                  <NavLink to="invite-admin" className={navLinkStyles} onClick={closeMenu}>
                    <ShieldPlus size={20} className="mr-3"/> Invite Admin
                  </NavLink>
                </li>
              )}

              <li className="px-6 text-xs font-bold text-red-300 uppercase tracking-wider mb-2 mt-6">
                Infrastructure
              </li>
              <li>
                <NavLink to="add-hostel" className={navLinkStyles} onClick={closeMenu}>
                  <Building size={20} className="mr-3"/> Add Hostel
                </NavLink>
              </li>
              <li>
                <NavLink to="add-rooms" className={navLinkStyles} onClick={closeMenu}>
                  <PlusCircle size={20} className="mr-3"/> Add Rooms
                </NavLink>
              </li>
            </ul>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-red-600 dark:border-red-800 bg-red-800/50 dark:bg-black/20">
             <NavLink to="change-password" className="flex items-center gap-3 p-2 rounded-lg hover:bg-red-600 dark:hover:bg-red-800 transition group" onClick={closeMenu}>
                <div className="w-10 h-10 bg-red-500 dark:bg-red-700 rounded-full flex items-center justify-center text-white font-bold shadow-sm group-hover:scale-105 transition">
                  {userData?.fullName?.charAt(0) || "A"}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold truncate text-white">{userData?.fullName?.split(" ")[0] || "Admin"}</p>
                  <p className="text-xs text-red-200">Account Settings</p>
                </div>
             </NavLink>
          </div>
        </aside>

        {/* Mobile Overlay Backdrop */}
        {isMenuOpen && (
          <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" onClick={closeMenu}></div>
        )}

        {/* 4. MAIN CONTENT */}
        <main className="flex-1 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 overflow-y-auto custom-scrollbar relative">
          <div className="p-4 lg:p-8 max-w-7xl mx-auto transition-all duration-500">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;