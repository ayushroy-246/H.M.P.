import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { 
  User, Phone, MapPin, Activity, Calendar, 
  Droplet, Save, Edit2, AlertCircle, BookOpen, Users 
} from "lucide-react";
import apiClient from "@/api/axios";
import { setProfileStatus } from "@/store/authSlice";

// Helper: Convert ISO string to YYYY-MM-DD for Input type="date"
const toDateInputValue = (isoDate) => {
  if (!isoDate) return "";
  return new Date(isoDate).toISOString().split("T")[0];
};

// Helper: Convert ISO string to DD/MM/YYYY for Display
const toDisplayDate = (isoDate) => {
  if (!isoDate) return "Not Provided";
  const d = new Date(isoDate);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const StudentProfile = () => {
  const { userData } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize React Hook Form
  const { 
    register, 
    handleSubmit, 
    reset, 
    watch,
    formState: { errors } 
  } = useForm({
    defaultValues: {
      hasChronicDisease: false,
      nationality: "Indian",
      category: "General"
    }
  });

  const hasChronicDisease = watch("hasChronicDisease");

  // 1. Fetch Profile & Academic Data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiClient.get("/api/v1/student/profile");
        const apiData = res.data.data;
        
        // Merge defaults with API data and format date
        reset({
          nationality: "Indian", 
          category: "General",
          hasChronicDisease: false,
          ...apiData,
          dateOfBirth: toDateInputValue(apiData?.dateOfBirth)
        });

        // View Mode if profile exists, Edit Mode if new
        setIsEditing(!apiData?._id);
      } catch (error) {
        console.error("Error fetching profile", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [reset]);

  // 2. Form Submission
  const onSubmit = async (data) => {
    try {
      const res = await apiClient.post("/api/v1/student/update-profile", data);
      
      // Update form with saved data (ensures consistency)
      reset({
          ...res.data.data,
          dateOfBirth: toDateInputValue(res.data.data?.dateOfBirth)
      });
      
      alert("Profile updated successfully!");
      setIsEditing(false);
      dispatch(setProfileStatus(true)); 
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update profile");
    }
  };

  // --- REUSABLE INPUT COMPONENT ---
  const ProfileInput = ({ label, name, type = "text", icon: Icon, required = false, placeholder = "", options = null }) => (
    <div className="col-span-1">
      <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-2">
        {Icon && <Icon size={14} />} {label} {required && isEditing && <span className="text-red-500">*</span>}
      </label>
      
      {isEditing ? (
        <div className="relative">
          {options ? (
            <select
              {...register(name, { required: required ? `${label} is required` : false })}
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm 
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                         focus:ring-2 focus:ring-emerald-500 outline-none" 
            >
              <option value="">Select {label}</option>
              {options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <input
              type={type}
              placeholder={placeholder}
              {...register(name, { required: required ? `${label} is required` : false })}
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm 
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400
                         focus:ring-2 focus:ring-emerald-500 outline-none transition"
            />
          )}
          {errors[name] && <span className="text-xs text-red-500 absolute -bottom-4 left-0">{errors[name].message}</span>}
        </div>
      ) : (
        <p className="font-semibold text-gray-800 dark:text-gray-200 text-base border-b border-gray-100 dark:border-gray-800 pb-1 min-h-[28px] break-words">
           {name === "dateOfBirth" 
             ? toDisplayDate(watch(name)) 
             : (watch(name) || <span className="text-gray-400 italic text-xs">Not Provided</span>)
           }
        </p>
      )}
    </div>
  );

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center text-emerald-600">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-600 mb-4"></div>
      Loading Profile...
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-10 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">My Profile</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your personal information and emergency contacts.</p>
        </div>
        <button
          onClick={() => isEditing ? handleSubmit(onSubmit)() : setIsEditing(true)}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white shadow-lg transition-all ${
            isEditing 
              ? "bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-200" 
              : "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-200"
          }`}
        >
          {isEditing ? <><Save size={18} /> Save Changes</> : <><Edit2 size={18} /> Edit Profile</>}
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* 1. ACADEMIC INFO (READ ONLY) */}
        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 dark:bg-emerald-100/30 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-400 mb-4 flex items-center gap-2 relative z-10">
             <BookOpen size={20}/> Academic Details <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-300 bg-white dark:bg-emerald-900 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-700 uppercase tracking-wide">Verified</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
            <div>
               <label className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-1 block">Enrollment</label>
               <p className="font-bold text-gray-800 dark:text-gray-200 text-lg">{userData?.username}</p>
            </div>
            <div>
               <label className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-1 block">Course</label>
               <p className="font-bold text-gray-800 dark:text-gray-200 text-lg">{watch("course") || "..."}</p>
            </div>
            <div>
               <label className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-1 block">Branch</label>
               <p className="font-bold text-gray-800 dark:text-gray-200 text-lg truncate" title={watch("branch")}>{watch("branch") || "..."}</p>
            </div>
            <div>
               <label className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-1 block">Batch</label>
               <p className="font-bold text-gray-800 dark:text-gray-200 text-lg">{watch("admissionYear") || "..."}</p>
            </div>
          </div>
        </div>

        {/* 2. PERSONAL DETAILS */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 border-l-4 border-emerald-500 pl-3">
            Personal Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ProfileInput label="Date of Birth" name="dateOfBirth" type="date" icon={Calendar} required />
            <ProfileInput label="Nationality" name="nationality" icon={MapPin} />
            <ProfileInput label="Gender" name="gender" required options={["Male", "Female", "Other"]} />
            <ProfileInput label="Blood Group" name="bloodGroup" icon={Droplet} required options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]} />
            <ProfileInput label="Category" name="category" options={["General", "OBC", "SC", "ST", "Other"]} />
          </div>
        </div>

        

        {/* 4. FAMILY & GUARDIAN */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 border-l-4 border-blue-500 pl-3">
            Family & Guardian
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProfileInput label="Father's Name" name="fatherName" icon={User} required />
            <ProfileInput label="Father's Phone" name="fatherPhone" icon={Phone} required />
            <ProfileInput label="Mother's Name" name="motherName" icon={User} required />
            <ProfileInput label="Mother's Phone" name="motherPhone" icon={Phone} />

            <div className="md:col-span-2 mt-4">
                <h4 className="text-sm font-bold text-gray-400 uppercase border-b border-gray-100 dark:border-gray-700 pb-2 flex items-center gap-2">
                    <Users size={16}/> Local Guardian (Optional)
                </h4>
            </div>
            <ProfileInput label="Guardian Name" name="localGuardianName" />
            <div className="grid grid-cols-2 gap-4">
               <ProfileInput label="Relation" name="localGuardianRelation" placeholder="e.g. Uncle" />
               <ProfileInput label="Phone" name="localGuardianPhone" icon={Phone} />
            </div>
          </div>
        </div>

        {/* 5. ADDRESS */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 border-l-4 border-purple-500 pl-3">
            Permanent Address
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
               <ProfileInput label="Address Line 1" name="addressLine1" icon={MapPin} required />
            </div>
            <div className="md:col-span-2">
               <ProfileInput label="Address Line 2" name="addressLine2" placeholder="Apartment, Studio, or Floor" />
            </div>
            <ProfileInput label="City" name="city" required />
            <ProfileInput label="State" name="state" required />
            <ProfileInput label="Pincode" name="pincode" required />
          </div>
        </div>

        {/* 6. MEDICAL ALERT */}
        <div className={`p-6 rounded-2xl shadow-sm border transition-all duration-300 ${hasChronicDisease ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800"}`}>
          <h3 className={`text-lg font-bold mb-6 border-l-4 pl-3 flex items-center gap-2 ${hasChronicDisease ? "text-red-700 dark:text-red-400 border-red-500" : "text-gray-800 dark:text-white border-gray-400"}`}>
            <Activity /> Medical Information
          </h3>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ProfileInput label="Emergency Contact Name" name="emergencyContactName" icon={AlertCircle} required />
                <ProfileInput label="Emergency Phone" name="emergencyContactNumber" icon={Phone} required />
            </div>

            <div className="border-t border-gray-200/50 dark:border-gray-700 pt-6">
                <div className="flex items-center gap-3">
                <input 
                    type="checkbox" 
                    id="chronic"
                    disabled={!isEditing}
                    {...register("hasChronicDisease")}
                    className="w-5 h-5 text-red-600 rounded focus:ring-red-500 cursor-pointer"
                />
                <label htmlFor="chronic" className={`font-medium cursor-pointer ${hasChronicDisease ? "text-red-700 dark:text-red-400" : "text-gray-700 dark:text-gray-300"}`}>
                    I have a chronic medical condition (Asthma, Diabetes, Allergies, etc.)
                </label>
                </div>

                {hasChronicDisease && (
                <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                    <label className="block text-sm font-bold text-red-700 dark:text-red-400 mb-2">
                    Please provide details <span className="text-red-400 dark:text-red-500 font-normal">(Required for emergency assistance)</span>:
                    </label>
                    {isEditing ? (
                    <textarea
                        {...register("chronicDiseaseDetails", { required: "Please provide details about your condition" })}
                        className="w-full p-3 border border-red-300 dark:border-red-800 rounded-xl focus:ring-2 focus:ring-red-500 
                                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm outline-none"
                        rows="3"
                        placeholder="E.g., Severe peanut allergy, Type 1 Diabetes, Epilepsy..."
                    />
                    ) : (
                    <p className="p-4 bg-red-100 dark:bg-red-900/40 text-red-900 dark:text-red-200 rounded-xl border border-red-200 dark:border-red-800 font-medium">
                        {watch("chronicDiseaseDetails")}
                    </p>
                    )}
                    {errors.chronicDiseaseDetails && <span className="text-xs text-red-600 font-bold">{errors.chronicDiseaseDetails.message}</span>}
                </div>
                )}
            </div>
          </div>
        </div>

      </form>
    </div>
  );
};

export default StudentProfile;