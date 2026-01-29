import React, { useState,useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { 
  Wrench, Zap, Droplet, Wifi,  
  Home, AlertTriangle, Send, ArrowLeft 
} from "lucide-react";
import apiClient from "@/api/axios";

const FileComplaint = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [locationDetails, setLocationDetails] = useState({
    roomNumber: "Loading...",
    hostelName: "Loading..."
  });

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const res = await apiClient.get("/api/v1/student/dashboard-stats");
        setLocationDetails(res.data.data);
      } catch (error) {
        console.error("Could not fetch location details");
        setLocationDetails({ roomNumber: "N/A", hostelName: "Unknown" });
      }
    };
    fetchLocation();
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm();

  // Categories for the "Role" dropdown
  const categories = [
    { id: "electrician", label: "Electrical", icon: Zap, color: "text-yellow-500", bg: "bg-yellow-50" },
    { id: "plumber", label: "Plumbing", icon: Droplet, color: "text-blue-500", bg: "bg-blue-50" },
    { id: "carpenter", label: "Furniture/Carpentry", icon: Wrench, color: "text-orange-500", bg: "bg-orange-50" },
    { id: "internet", label: "Wi-Fi/Internet", icon: Wifi, color: "text-indigo-500", bg: "bg-indigo-50" },
    { id: "cleaning", label: "Cleaning/Housekeeping", icon: Home, color: "text-green-500", bg: "bg-green-50" },
    { id: "other", label: "Other Issues", icon: AlertTriangle, color: "text-gray-500", bg: "bg-gray-50" },
  ];

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await apiClient.post("/api/v1/student/create-complaint", data);
      alert("Complaint filed successfully!");
      navigate("/student/dashboard/complaints"); // Redirect back to list
    } catch (error) {
      alert(error.response?.data?.message || "Failed to file complaint");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER WITH BACK BUTTON */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 hover:bg-gray-100 rounded-full transition"
        >
          <ArrowLeft size={24} className="text-gray-600"/>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">File New Complaint</h1>
          <p className="text-gray-500 text-sm">Report an issue in your room or hostel.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* 1. LOCATION CONTEXT (Read Only) */}
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex items-center justify-between ">
          <div>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Location</p>
            <p className="font-bold text-emerald-900 text-lg">
              Room {locationDetails.roomNumber}, {locationDetails.hostelName}
            </p>
          </div>
          <Home className="text-emerald-300" size={32} />
        </div>

        {/* 2. CATEGORY SELECTION */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-gray-700 dark:text-white">Issue Category <span className="text-red-500">*</span></label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map((cat) => (
              <label key={cat.id} className="cursor-pointer relative">
                <input 
                  type="radio" 
                  value={cat.id} 
                  {...register("assignedRole", { required: "Please select a category" })}
                  className="peer sr-only"
                />
                <div className={`p-4 rounded-xl border-2 border-transparent bg-white shadow-sm hover:shadow-md transition-all
                  peer-checked:border-emerald-500 peer-checked:bg-emerald-50 peer-checked:shadow-emerald-100
                  flex flex-col items-center gap-2 text-center h-full
                `}>
                  <div className={`p-2 rounded-full ${cat.bg} ${cat.color}`}>
                    <cat.icon size={20} />
                  </div>
                  <span className="text-xs font-semibold text-gray-600">{cat.label}</span>
                </div>
              </label>
            ))}
          </div>
          {errors.assignedRole && <p className="text-xs text-red-500 font-bold">{errors.assignedRole.message}</p>}
        </div>

        {/* 3. TITLE & DESCRIPTION */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 dark:text-white">Issue Title <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              placeholder="e.g. Fan not working"
              {...register("title", { required: "Title is required", minLength: { value: 5, message: "Too short" } })}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition bg-white text-gray-900"
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 dark:text-white">Detailed Description <span className="text-red-500">*</span></label>
            <textarea 
              rows="4"
              placeholder="Describe the problem... (e.g. The regulator is broken and the fan is stuck at full speed)"
              {...register("description", { required: "Description is required" })}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition bg-white text-gray-900"
            ></textarea>
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
          </div>
        </div>

        {/* 4. SUBMIT BUTTON */}
        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg  flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            "Submitting..."
          ) : (
            <>
              <Send size={20} /> Submit Complaint
            </>
          )}
        </button>

      </form>
    </div>
  );
};

export default FileComplaint;