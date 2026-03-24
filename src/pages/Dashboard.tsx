import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LogOut, User, KeyRound, Bell, ChevronRight, Shield, Users } from "lucide-react";

const menuItems = [
  { label: "User Management", icon: Users, color: "text-indigo-400", bg: "bg-indigo-500/10", route: "/users" },
  { label: "Edit Profile", icon: User, color: "text-purple-400", bg: "bg-purple-500/10", route: null },
  { label: "Change Password", icon: KeyRound, color: "text-pink-400", bg: "bg-pink-500/10", route: null },
  { label: "Notifications", icon: Bell, color: "text-amber-400", bg: "bg-amber-500/10", route: null },
  { label: "Security", icon: Shield, color: "text-emerald-400", bg: "bg-emerald-500/10", route: null },
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = user?.name
    .split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-[#0f0f13] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-40 -left-20 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-md mx-auto px-4 pt-14 pb-16">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-zinc-500 text-sm">Good day 👋</p>
            <h1 className="text-xl font-bold tracking-tight">{user?.name}</h1>
          </div>
          <Button variant="outline" size="icon" onClick={logout} aria-label="Sign out" className="rounded-2xl">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>

        <Card className="mb-5 bg-gradient-to-br from-indigo-500/15 to-purple-600/15">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-indigo-500/30 shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-lg truncate">{user?.name}</p>
                <p className="text-zinc-400 text-sm truncate">{user?.email}</p>
              </div>
            </div>
            <div className="mt-5 pt-5 border-t border-white/10 grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-2xl px-4 py-3">
                <p className="text-zinc-500 text-xs mb-0.5">Member since</p>
                <p className="text-sm font-semibold">2026</p>
              </div>
              <div className="bg-white/5 rounded-2xl px-4 py-3">
                <p className="text-zinc-500 text-xs mb-0.5">Status</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                  <p className="text-sm font-semibold">Active</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-5 overflow-hidden">
          {menuItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <button key={item.label}
                onClick={() => item.route && navigate(item.route)}
                className={cn(
                  `w-full flex items-center gap-4 px-5 py-4 transition-colors text-left ${i < menuItems.length - 1 ? "border-b border-white/5" : ""}`,
                  item.route ? "hover:bg-white/5 cursor-pointer" : "cursor-default opacity-60"
                )}>
                <div className={`w-9 h-9 rounded-xl ${item.bg} ${item.color} flex items-center justify-center shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium flex-1">{item.label}</span>
                <ChevronRight className="w-4 h-4 text-zinc-600" />
              </button>
            );
          })}
        </Card>

        <Button variant="destructive" className="w-full" size="lg" onClick={logout}>
          <LogOut className="w-4 h-4" /> Sign Out
        </Button>
      </div>
    </div>
  );
}
