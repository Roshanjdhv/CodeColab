import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { 
  Terminal, 
  User, 
  Settings, 
  Lock, 
  Bell, 
  LogOut, 
  Edit, 
  Camera, 
  Palette, 
  Check,
  ChevronRight,
  Upload,
  Trash2,
  Globe,
  Plus
} from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";

export function ProfileTab() {
  const profile = useQuery(api.profiles.getCurrentProfile);
  const updateProfile = useMutation(api.profiles.updateProfile);
  const generateUploadUrl = useMutation(api.profiles.generateUploadUrl);
  
  const { signOut } = useAuthActions();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    userColor: "#5048e5",
    isPublic: true,
  });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || "",
        bio: profile.bio || "",
        userColor: profile.userColor || "#5048e5",
        isPublic: profile.isPublic !== false,
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!formData.username.trim()) {
      toast.error("Username is required");
      return;
    }

    try {
      await updateProfile({
        username: formData.username.trim(),
        bio: formData.bio.trim() || undefined,
        userColor: formData.userColor,
        isPublic: formData.isPublic,
      });
      
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error("Image must be less than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      // Get upload URL
      const uploadUrl = await generateUploadUrl();
      
      // Upload file
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      
      if (!result.ok) {
        throw new Error("Upload failed");
      }
      
      const { storageId } = await result.json();
      
      // Update profile with new image
      await updateProfile({
        profileImage: storageId,
      });
      
      toast.success("Profile image updated!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const colors = [
    "#5048e5", // Primary
    "#10b981", // Emerald
    "#f43f5e", // Rose
    "#f59e0b", // Amber
    "#0ea5e9", // Sky
    "#8b5cf6", // Violet
  ];

  return (
    <div className="flex flex-col min-h-full font-display bg-slate-50/30">
      <div className="mx-auto max-w-[1000px] w-full">
        <div className="flex flex-col gap-8 lg:flex-row py-8">
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-64 flex flex-row lg:flex-col gap-2 shrink-0 overflow-x-auto lg:overflow-visible no-scrollbar pb-2 lg:pb-0">
            <div className="hidden lg:block mb-4 px-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Account Settings</h3>
            </div>
            <button className="flex items-center gap-3 rounded-xl bg-indigo-500/10 px-4 py-3 text-sm font-bold text-indigo-400 text-left whitespace-nowrap lg:whitespace-normal">
              <User className="w-5 h-5 flex-shrink-0" />
              <span>General</span>
            </button>
            <button className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-400 hover:bg-slate-800 hover:text-white transition-all text-left whitespace-nowrap lg:whitespace-normal">
              <Settings className="w-5 h-5 flex-shrink-0" />
              <span>Preferences</span>
            </button>
            <button className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-400 hover:bg-slate-800 hover:text-white transition-all text-left whitespace-nowrap lg:whitespace-normal">
              <Lock className="w-5 h-5 flex-shrink-0" />
              <span>Security</span>
            </button>
            <button className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-400 hover:bg-slate-800 hover:text-white transition-all text-left whitespace-nowrap lg:whitespace-normal">
              <Bell className="w-5 h-5 flex-shrink-0" />
              <span>Notifications</span>
            </button>
            <div className="hidden lg:block my-4 h-[1px] bg-slate-800" />
            <button 
              onClick={() => signOut()}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-500/10 transition-all text-left whitespace-nowrap lg:whitespace-normal"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span>Sign Out</span>
            </button>
          </aside>

          {/* Content Area */}
          <div className="flex-1 bg-slate-800/40 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-6 md:p-8">
            <div className="mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-8 gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Public Profile</h1>
                <p className="mt-1 text-sm text-slate-500">Manage how you appear to others on CodeCollab.</p>
              </div>
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex gap-2">
                   <button 
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        username: profile.username || "",
                        bio: profile.bio || "",
                        userColor: profile.userColor || "#5048e5",
                        isPublic: profile.isPublic !== false,
                      });
                    }}
                    className="px-6 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    className="bg-primary text-white px-8 py-3 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              )}
            </div>

            <div className="grid gap-12">
              {/* Profile Picture Section */}
              <section className="flex flex-col gap-8 md:flex-row md:items-center border-b border-slate-50 pb-10">
                <div className="relative group self-center md:self-auto">
                  <div className="h-36 w-36 overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-2xl relative">
                    {profile.profileImageUrl ? (
                      <img src={profile.profileImageUrl} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-white text-4xl font-bold" style={{ backgroundColor: profile.userColor || "#5048e5" }}>
                        {(profile.username || "U").charAt(0).toUpperCase()}
                      </div>
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="absolute bottom-1 right-1 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white shadow-lg border-4 border-white hover:scale-110 active:scale-95 transition-all disabled:opacity-50"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  <h3 className="text-xl font-bold text-slate-900">Profile Picture</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">A high-quality image helps developers recognize and connect with you more easily.</p>
                  <div className="flex gap-3 mt-3">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" /> Upload New
                    </button>
                    <button className="rounded-xl px-5 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 transition-all flex items-center gap-2">
                       <Trash2 className="w-4 h-4" /> Remove
                    </button>
                  </div>
                </div>
              </section>

              {/* Form Section */}
              <div className="grid gap-10">
                <div className="grid gap-8 md:grid-cols-2">
                  <div className="flex flex-col gap-3">
                    <label className="text-sm font-bold text-slate-700">Username</label>
                    <div className="relative group">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">@</span>
                      <input 
                        className={`w-full rounded-xl border-slate-200 bg-slate-50/50 py-3.5 pl-9 pr-4 text-sm font-medium focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none ${!isEditing ? 'opacity-70 pointer-events-none border-transparent bg-slate-100' : ''}`} 
                        type="text" 
                        value={formData.username}
                        disabled={!isEditing}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        placeholder="yourname"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">This is your unique identifier on the platform.</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <label className="text-sm font-bold text-slate-700">Display Name</label>
                    <input 
                      className={`w-full rounded-xl border-slate-200 bg-slate-50/50 py-3.5 px-4 text-sm font-medium focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none ${!isEditing ? 'opacity-70 pointer-events-none border-transparent bg-slate-100' : ''}`} 
                      type="text" 
                      value={formData.username} // We use the same for now or Clerk display name
                      readOnly
                      placeholder="Alex Rivers"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <label className="text-sm font-bold text-slate-700">Bio</label>
                  <textarea 
                    className={`w-full rounded-xl border-slate-200 bg-slate-50/50 p-4 text-sm font-medium focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none resize-none min-h-[120px] ${!isEditing ? 'opacity-70 pointer-events-none border-transparent bg-slate-100' : ''}`} 
                    placeholder="Tell us about yourself, your skills, and what you're building..." 
                    value={formData.bio}
                    disabled={!isEditing}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    maxLength={300}
                  />
                  <div className="flex justify-between items-center text-[11px] px-1">
                    <p className="text-slate-400 font-medium italic">Brief description for your profile. URLs are allowed.</p>
                    <p className={`font-bold ${formData.bio.length > 250 ? 'text-amber-500' : 'text-slate-400'}`}>
                      {formData.bio.length} / 300
                    </p>
                  </div>
                </div>

                {/* Profile Color & Customization */}
                <div className="flex flex-col gap-4 p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Palette className="w-4 h-4 text-primary" />
                    <label className="text-sm font-bold text-slate-700">Profile Theme Color</label>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {colors.map((color) => (
                      <button 
                        key={color}
                        onClick={() => isEditing && setFormData({ ...formData, userColor: color })}
                        className={`h-11 w-11 rounded-full transition-all flex items-center justify-center relative ${
                          formData.userColor === color ? 'ring-4 ring-primary/20 scale-110 shadow-lg shadow-primary/10 z-10' : 'hover:scale-105 opacity-70 hover:opacity-100'
                        } ${!isEditing ? 'cursor-default' : 'cursor-pointer'}`}
                        style={{ backgroundColor: color }}
                        type="button"
                        disabled={!isEditing}
                      >
                        {formData.userColor === color && <Check className="w-5 h-5 text-white" />}
                      </button>
                    ))}
                    <button 
                      className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-dashed border-slate-300 text-slate-400 hover:border-primary hover:text-primary transition-all hover:bg-white" 
                      type="button"
                      disabled={!isEditing}
                    >
                      <Plus className="w-6 h-6" />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">This color will be used for your profile avatar and highlight elements.</p>
                </div>

                {/* Privacy Settings */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-6 border-b border-slate-50 pb-4">
                     <Lock className="w-5 h-5 text-slate-400" />
                     <h3 className="text-lg font-bold text-slate-900">Privacy & Visibility</h3>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between group cursor-pointer" onClick={() => isEditing && setFormData({ ...formData, isPublic: !formData.isPublic })}>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-slate-800">Public Profile Visibility</span>
                        <span className="text-xs text-slate-400 font-medium">Make your profile discoverable to everyone on the platform.</span>
                      </div>
                      <label className="relative inline-flex cursor-pointer items-center pr-2">
                        <input 
                          type="checkbox" 
                          checked={formData.isPublic}
                          onChange={(e) => isEditing && setFormData({ ...formData, isPublic: e.target.checked })}
                          className="peer sr-only" 
                          disabled={!isEditing}
                        />
                        <div className="h-7 w-12 rounded-full bg-slate-200 peer-checked:bg-primary after:absolute after:left-[4px] after:top-[4px] after:h-[20px] after:w-[20px] after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full peer-checked:after:scale-105 shadow-inner"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Action Buttons (Sticky/Fixed style at bottom of form) */}
                {isEditing && (
                  <div className="flex justify-end gap-3 border-t border-slate-100 pt-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="rounded-xl px-8 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all" 
                      type="button"
                    >
                      Discard Changes
                    </button>
                    <button 
                      onClick={handleSave}
                      className="rounded-xl bg-primary px-10 py-3 text-sm font-bold text-white shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95" 
                      type="submit"
                    >
                      Save Profile
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-100 bg-white py-12">
        <div className="mx-auto max-w-[1000px] px-8 text-center italic">
          <p className="text-xs text-slate-400 font-medium">© 2024 CodeCollab Inc. • Built with ❤️ for the global developer community.</p>
        </div>
      </footer>
    </div>
  );
}
