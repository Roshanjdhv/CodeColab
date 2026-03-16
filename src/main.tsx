import { createRoot } from "react-dom/client";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import "./index.css";
import App from "./App";

if (!import.meta.env.VITE_CONVEX_URL) {
  throw new Error("Missing VITE_CONVEX_URL environment variable. Please add it to your Netlify settings.");
}

import { ThemeProvider } from "./components/ThemeProvider";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <ConvexAuthProvider client={convex}>
      <App />
    </ConvexAuthProvider>
  </ThemeProvider>,
);
