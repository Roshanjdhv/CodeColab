import { Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative flex h-9 w-16 items-center rounded-full bg-slate-200 p-1 transition-colors dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 overflow-hidden shadow-inner"
      aria-label="Toggle theme"
    >
      <div className="absolute inset-0 flex items-center justify-between px-2 text-xs font-bold uppercase tracking-wider">
        <span className="text-slate-400 dark:text-slate-500 ml-1">L</span>
        <span className="text-slate-400 dark:text-slate-500 mr-1">D</span>
      </div>
      
      <motion.div
        className="z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-md dark:bg-slate-900"
        initial={false}
        animate={{
          x: theme === "dark" ? 28 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={theme}
            initial={{ x: 10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -10, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center"
          >
            {theme === "dark" ? (
              <Moon className="h-4 w-4 text-indigo-400" />
            ) : (
              <Sun className="h-4 w-4 text-amber-500" />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </button>
  );
}
