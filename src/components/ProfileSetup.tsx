import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function ProfileSetup() {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const createProfile = useMutation(api.profiles.createProfile);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error("Username is required");
      return;
    }

    setIsLoading(true);
    try {
      await createProfile({ username: username.trim(), bio: bio.trim() || undefined });
      toast.success("Profile created successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">CC</span>
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Welcome to CodeCollab!</h2>
          <p className="text-muted-foreground">Let's set up your profile to get started</p>
        </div>

        <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-foreground mb-2">
                Username *
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted-foreground"
                placeholder="Enter your username"
                required
              />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-foreground mb-2">
                Bio (optional)
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none placeholder:text-muted-foreground"
                placeholder="Tell us about yourself..."
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
            >
              {isLoading ? "Creating Profile..." : "Create Profile"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
