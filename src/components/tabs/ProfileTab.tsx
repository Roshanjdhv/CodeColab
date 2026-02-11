import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";

export function ProfileTab() {
  const profile = useQuery(api.profiles.getCurrentProfile);
  const updateProfile = useMutation(api.profiles.updateProfile);
  const generateUploadUrl = useMutation(api.profiles.generateUploadUrl);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    userColor: "#6B7280",
    isPublic: true,
  });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form data when profile loads
  useState(() => {
    if (profile) {
      setFormData({
        username: profile.username || "",
        bio: profile.bio || "",
        userColor: profile.userColor || "#6B7280",
        isPublic: profile.isPublic !== false, // Default to true if not set
      });
    }
  });

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
          <p className="text-gray-600">Manage your profile and privacy settings</p>
        </div>
        
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setIsEditing(false);
                setFormData({
                  username: profile.username || "",
                  bio: profile.bio || "",
                  userColor: profile.userColor || "#6B7280",
                  isPublic: profile.isPublic !== false,
                });
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {/* Profile Image */}
        <div className="flex items-center space-x-6 mb-6">
          <div className="relative">
            {profile.profileImageUrl ? (
              <img
                src={profile.profileImageUrl}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                style={{ backgroundColor: profile.userColor || "#6B7280" }}
              >
                {(profile.username || "U").charAt(0).toUpperCase()}
              </div>
            )}
            
            {isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              </div>
            )}
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900">Profile Picture</h3>
            <p className="text-sm text-gray-600 mb-2">
              Upload a profile picture to help others recognize you
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isUploading}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 disabled:opacity-50 transition-colors"
            >
              {isUploading ? "Uploading..." : "Change Picture"}
            </button>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username *
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your username"
              />
            ) : (
              <p className="text-gray-900">{profile.username}</p>
            )}
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            {isEditing ? (
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="Tell others about yourself..."
                maxLength={200}
              />
            ) : (
              <p className="text-gray-900">{profile.bio || "No bio set"}</p>
            )}
            {isEditing && (
              <p className="text-xs text-gray-500 mt-1">
                {formData.bio.length}/200 characters
              </p>
            )}
          </div>

          {/* User Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profile Color
            </label>
            {isEditing ? (
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={formData.userColor}
                  onChange={(e) => setFormData({ ...formData, userColor: e.target.value })}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <span className="text-sm text-gray-600">
                  This color represents you in rooms and chats
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <div 
                  className="w-6 h-6 rounded border border-gray-300"
                  style={{ backgroundColor: profile.userColor || "#6B7280" }}
                />
                <span className="text-gray-900">{profile.userColor || "#6B7280"}</span>
              </div>
            )}
          </div>

          {/* Privacy Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Privacy Settings
            </label>
            {isEditing ? (
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Make my profile visible in public user search
                </span>
              </label>
            ) : (
              <p className="text-gray-900">
                Profile visibility: {profile.isPublic !== false ? "Public" : "Private"}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              When enabled, other users can find and send you friend requests
            </p>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Status
            </label>
            <div className="flex items-center space-x-2">
              <span className={`w-3 h-3 rounded-full ${
                profile.status === "online" ? "bg-green-500" :
                profile.status === "coding" ? "bg-blue-500" : "bg-gray-400"
              }`} />
              <span className="text-gray-900 capitalize">{profile.status}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Status is automatically updated based on your activity
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
