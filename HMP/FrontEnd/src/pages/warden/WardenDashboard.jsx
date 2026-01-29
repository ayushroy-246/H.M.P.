import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { 
  Menu, X, Home, Users, Briefcase, 
  UserPlus, ClipboardList, UserCircle, LogOut 
} from "lucide-react";
import Header from "@/components/Header";

const WardenDashboard = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const closeMenu = () => setIsMenuOpen(false);

  const navLinkStyles = ({ isActive }) =>
    `flex items-center py-3 px-6 my-1 font-semibold transition-all duration-200 border-l-4 ${
      isActive
        ? "bg-purple-700 dark:bg-purple-900 border-white text-white shadow-inner"
        : "border-transparent text-purple-100 hover:bg-purple-500 hover:text-white"
    }`;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-950">
      
      <Header />

      <div className="lg:hidden bg-purple-800 dark:bg-purple-950 p-4 flex justify-between items-center text-white shadow-md z-20">
        <span className="font-bold uppercase tracking-widest text-sm">Warden Portal</span>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 outline-none">
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className="flex flex-1 relative overflow-hidden">
        
        <aside 
          className={`
            fixed lg:static inset-y-0 left-0 z-50
            w-64 bg-purple-800 dark:bg-purple-950 text-white transform transition-transform duration-300 ease-in-out
            ${isMenuOpen ? "translate-x-0" : "-translate-x-full"} 
            lg:translate-x-0 flex flex-col shadow-2xl
          `}
        >
          <div className="p-6 border-b border-purple-700 dark:border-purple-900">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="bg-white dark:bg-gray-200 text-purple-800 dark:text-purple-950 p-1 rounded-lg">
                <ClipboardList size={20} />
              </span>
              Warden Panel
            </h2>
            <p className="text-xs text-purple-300 mt-1">Hostel Management System</p>
          </div>

          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="flex flex-col gap-1">
              
              <li className="px-4 text-xs font-bold text-purple-400 uppercase tracking-wider mb-2 mt-2">
                Overview
              </li>
              <li>
                <NavLink to="/warden/dashboard" end className={navLinkStyles} onClick={closeMenu}>
                  <Home size={20} className="mr-3"/> Home
                </NavLink>
              </li>

              <li className="px-4 text-xs font-bold text-purple-400 uppercase tracking-wider mb-2 mt-6">
                Management
              </li>
              <li>
                <NavLink to="students" className={navLinkStyles} onClick={closeMenu}>
                  <Users size={20} className="mr-3"/> Student List
                </NavLink>
              </li>
              <li>
                <NavLink to="staff" className={navLinkStyles} onClick={closeMenu}>
                  <Briefcase size={20} className="mr-3"/> Staff List
                </NavLink>
              </li>
              <li>
                <NavLink to="create-staff" className={navLinkStyles} onClick={closeMenu}>
                  <UserPlus size={20} className="mr-3"/> Register Staff
                </NavLink>
              </li>

              <li className="px-4 text-xs font-bold text-purple-400 uppercase tracking-wider mb-2 mt-6">
                Operations
              </li>
              <li>
                <NavLink to="complaints" className={navLinkStyles} onClick={closeMenu}>
                  <ClipboardList size={20} className="mr-3"/> All Complaints
                </NavLink>
              </li>
            </ul>
          </nav>

          <div className="p-4 border-t border-purple-700 dark:border-purple-900 bg-purple-900/50 dark:bg-black/20">
             <NavLink to="profile" className="flex items-center gap-3 p-2 rounded-lg hover:bg-purple-700 dark:hover:bg-purple-900 transition" onClick={closeMenu}>
                <div className="w-10 h-10 bg-purple-500 dark:bg-purple-700 rounded-full flex items-center justify-center text-white font-bold">
                  W
                </div>
                <div>
                  <p className="text-sm font-bold">My Profile</p>
                  <p className="text-xs text-purple-300">View Settings</p>
                </div>
             </NavLink>
          </div>
        </aside>

        {isMenuOpen && (
          <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" onClick={closeMenu}></div>
        )}

        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-8 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default WardenDashboard;