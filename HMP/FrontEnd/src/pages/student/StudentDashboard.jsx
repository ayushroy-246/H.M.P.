import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setProfileStatus } from "@/store/authSlice";
import apiClient from "@/api/axios";
import Header from "@/components/Header";
import { 
  Menu, X, Home, UserCircle, 
  AlertCircle, FileText, GraduationCap, LogOut 
} from "lucide-react"; 

const StudentDashboard = () => {
  const { userData, isProfileComplete } = useSelector((state) => state.auth);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const isProfilePage = location.pathname.includes("/profile");

  useEffect(() => {
    const verifyProfile = async () => {
      try {
        const response = await apiClient.get("/api/v1/student/profile-status");
        dispatch(setProfileStatus(response.data.data.isComplete));
      } catch (error) {
        console.error("Status check failed", error);
      } finally {
        setCheckingStatus(false);
      }
    };
    verifyProfile();
  }, [dispatch]);

  const closeMenu = () => setIsMenuOpen(false);

  // ✨ PREMIUM NAV STYLE (Emerald Theme)
  const navLinkStyles = ({ isActive }) =>
    `flex items-center py-3 px-6 my-1 font-semibold transition-all duration-200 border-l-4 ${
      isActive
        ? "bg-emerald-800 dark:bg-emerald-950 border-white text-white shadow-inner"
        : "border-transparent text-emerald-100 hover:bg-emerald-600 hover:text-white"
    }`;

  if (checkingStatus) return (
    <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 text-emerald-600 dark:text-emerald-400">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current"></div>
    </div>
  );

  const showOverlay = !isProfileComplete && !isProfilePage;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-950">
      
      {/* 1. Header with Theme Toggle */}
      <Header />

      {/* 2. Mobile Menu Bar (Emerald) */}
      <div className="lg:hidden bg-emerald-700 dark:bg-emerald-900 p-4 flex justify-between items-center text-white shadow-md z-20">
        <span className="font-bold uppercase tracking-widest text-sm flex items-center gap-2">
          <GraduationCap size={18} /> Student Portal
        </span>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 outline-none hover:bg-white/10 rounded-lg transition">
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className="flex flex-1 relative overflow-hidden">
        
        {/* 3. SIDEBAR (Emerald Theme) */}
        <aside 
          className={`
            fixed lg:static inset-y-0 left-0 z-50
            w-64 bg-emerald-700 dark:bg-emerald-900 text-white transform transition-transform duration-300 ease-in-out
            ${isMenuOpen ? "translate-x-0" : "-translate-x-full"} 
            lg:translate-x-0 flex flex-col shadow-2xl
          `}
        >
          {/* Sidebar Header */}
          <div className="p-6 border-b border-emerald-600 dark:border-emerald-800">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="bg-white dark:bg-gray-800 text-emerald-700 dark:text-emerald-400 p-1.5 rounded-lg shadow-sm">
                <GraduationCap size={20} />
              </span>
              Student Panel
            </h2>
            <p className="text-xs text-emerald-200 mt-1 ml-1">Hostel Management System</p>
          </div>

          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="flex flex-col gap-1">
              
              <li className="px-6 text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2 mt-2">
                Menu
              </li>
              <li>
                <NavLink to="/student/dashboard" end className={navLinkStyles} onClick={closeMenu}>
                  <Home size={20} className="mr-3"/> Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink to="complaints" className={navLinkStyles} onClick={closeMenu}>
                  <AlertCircle size={20} className="mr-3"/> My Complaints
                </NavLink>
              </li>

              <li className="px-6 text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2 mt-6">
                Account
              </li>
              <li>
                <NavLink to="profile" className={navLinkStyles} onClick={closeMenu}>
                  <UserCircle size={20} className="mr-3"/> My Profile
                </NavLink>
              </li>
            </ul>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-emerald-600 dark:border-emerald-800 bg-emerald-800/50 dark:bg-black/20">
             <NavLink to="profile" className="flex items-center gap-3 p-2 rounded-lg hover:bg-emerald-600 dark:hover:bg-emerald-800 transition group" onClick={closeMenu}>
                <div className="w-10 h-10 bg-emerald-500 dark:bg-emerald-700 rounded-full flex items-center justify-center text-white font-bold shadow-sm group-hover:scale-105 transition">
                  {userData?.fullName?.charAt(0) || "S"}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold truncate text-white">{userData?.fullName?.split(" ")[0] || "Student"}</p>
                  <p className="text-xs text-emerald-200">View Profile</p>
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
          
          {/* 🚨 PROFILE INCOMPLETE OVERLAY */}
          {showOverlay && (
            <div className="absolute inset-0 z-30 flex items-center justify-center p-6 bg-emerald-900/20 backdrop-blur-md">
              <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border-t-8 border-emerald-500 p-8 text-center animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <FileText size={40} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">Action Required</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-8 italic">
                  "Please complete your profile to access dashboard features and file complaints."
                </p>
                
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => navigate("profile")}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-lg shadow-emerald-200 dark:shadow-none"
                  >
                    Complete Profile Now
                  </button>
                  <button 
                    onClick={() => dispatch(setProfileStatus(true))} 
                    className="text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 text-sm font-medium transition"
                  >
                    I'll do it later
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Content Wrapper (Blurred when overlay is active) */}
          <div className={`p-4 lg:p-8 max-w-7xl mx-auto transition-all duration-500 ${showOverlay ? "blur-sm pointer-events-none grayscale-[50%]" : ""}`}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;