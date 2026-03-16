"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";

import { useNavigate } from "react-router-dom";

export function SignOutButton() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <button
      className="px-6 py-2.5 rounded-xl bg-background text-foreground border border-border font-bold hover:bg-muted transition-all shadow-md dark:shadow-none hover:shadow-lg active:scale-95"
      onClick={() => {
        void signOut();
        navigate("/");
      }}
    >
      Sign out
    </button>
  );
}
