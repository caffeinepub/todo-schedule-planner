import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { LogIn, LogOut, Sparkles, User } from "lucide-react";
import { motion } from "motion/react";
import { ScheduleView } from "./components/ScheduleView";
import { TaskList } from "./components/TaskList";
import { useInternetIdentity } from "./hooks/useInternetIdentity";

export default function App() {
  const { login, clear, loginStatus, identity, isInitializing } =
    useInternetIdentity();
  const isLoggedIn = !!identity;
  const isLoggingIn = loginStatus === "logging-in";
  const principal = identity?.getPrincipal().toString();

  const year = new Date().getFullYear();
  const utmLink = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-20 flex-shrink-0">
        <div className="max-w-[1400px] mx-auto px-4 h-12 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-base text-foreground tracking-tight">
              Planit
            </span>
          </div>

          {/* Auth */}
          <div className="flex items-center gap-2">
            {isInitializing ? (
              <div className="w-6 h-6 rounded-full bg-secondary animate-pulse" />
            ) : isLoggedIn ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2 py-1 bg-secondary rounded-md border border-border">
                  <User className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[11px] text-muted-foreground font-mono truncate max-w-[80px]">
                    {principal?.slice(0, 8)}…
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clear()}
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="w-3 h-3 mr-1" />
                  Sign out
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={() => login()}
                disabled={isLoggingIn}
                className="h-7 px-3 text-xs bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
              >
                <LogIn className="w-3 h-3" />
                {isLoggingIn ? "Connecting…" : "Sign in"}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* ── Main content ───────────────────────────────────────────── */}
      <main className="flex-1 overflow-hidden max-w-[1400px] w-full mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="h-full flex flex-col md:flex-row"
          style={{ height: "calc(100vh - 48px - 40px)" }}
        >
          {/* Left panel — Task List */}
          <div className="w-full md:w-[380px] lg:w-[420px] flex-shrink-0 border-b md:border-b-0 md:border-r border-border overflow-hidden flex flex-col">
            <TaskList />
          </div>

          {/* Right panel — Schedule */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <ScheduleView />
          </div>
        </motion.div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-card/30 flex-shrink-0 h-10 flex items-center">
        <div className="max-w-[1400px] mx-auto px-4 w-full">
          <p className="text-[11px] text-muted-foreground text-center">
            © {year}.{" "}
            <a
              href={utmLink}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              Built with ♥ using caffeine.ai
            </a>
          </p>
        </div>
      </footer>

      <Toaster
        position="bottom-right"
        toastOptions={{
          className: "bg-popover border-border text-foreground text-sm",
        }}
      />
    </div>
  );
}
