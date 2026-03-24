import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Pencil, Trash2, ChevronLeft, X, Check, AlertCircle, Users as UsersIcon } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, AuthUser } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// ── Edit Modal ────────────────────────────────────────────────────────────────
function EditModal({
  user,
  onClose,
  onSave,
}: {
  user: AuthUser;
  onClose: () => void;
  onSave: (updated: AuthUser) => void;
}) {
  const { accessToken } = useAuth();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!accessToken) return;
    setError(null);
    setLoading(true);
    try {
      // Only send changed fields; always send at least name to avoid empty body
      const body: { name?: string; email?: string } = {};
      if (name !== user.name) body.name = name;
      if (email !== user.email) body.email = email;
      if (Object.keys(body).length === 0) { onClose(); return; }
      const updated = await api.users.update(accessToken, user.id, body);
      onSave(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <Card className="relative w-full max-w-sm">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-lg">Edit User</h2>
            <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button className="flex-1" onClick={handleSave} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Delete Confirm ────────────────────────────────────────────────────────────
function DeleteConfirm({
  user,
  onClose,
  onDelete,
}: {
  user: AuthUser;
  onClose: () => void;
  onDelete: () => void;
}) {
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!accessToken) return;
    setLoading(true);
    try {
      await api.users.delete(accessToken, user.id);
      onDelete();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <Card className="relative w-full max-w-sm">
        <CardContent className="pt-6 space-y-4">
          <h2 className="font-semibold text-lg">Delete User</h2>
          <p className="text-zinc-400 text-sm">
            Are you sure you want to delete <span className="text-white font-medium">{user.name}</span>? This cannot be undone.
          </p>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button variant="destructive" className="flex-1" onClick={handleDelete} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── User Row ──────────────────────────────────────────────────────────────────
function UserRow({
  user,
  currentUserId,
  onEdit,
  onDelete,
}: {
  user: AuthUser;
  currentUserId: string;
  onEdit: (u: AuthUser) => void;
  onDelete: (u: AuthUser) => void;
}) {
  const initials = user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const isCurrentUser = user.id === currentUserId;

  return (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-white/5 last:border-0">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/30 to-purple-600/30 border border-white/10 flex items-center justify-center text-sm font-semibold shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">{user.name}</p>
          {isCurrentUser && (
            <span className="text-xs bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-md shrink-0">you</span>
          )}
        </div>
        <p className="text-xs text-zinc-500 truncate">{user.email}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onEdit(user)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(user)}
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
            isCurrentUser
              ? "text-zinc-700 cursor-not-allowed"
              : "text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
          )}
          disabled={isCurrentUser}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Users() {
  const { accessToken, user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<AuthUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AuthUser | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    api.users.list(accessToken)
      .then(setUsers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [accessToken]);

  function handleSaved(updated: AuthUser) {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    setEditTarget(null);
  }

  function handleDeleted(id: string) {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setDeleteTarget(null);
  }

  return (
    <div className="min-h-screen bg-[#0f0f13] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-40 -left-20 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -right-40 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-md mx-auto px-4 pt-14 pb-16">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">User Management</h1>
            <p className="text-zinc-500 text-sm">{users.length} users total</p>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
          </div>
        ) : error ? (
          <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-4">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-zinc-600">
            <UsersIcon className="w-10 h-10" />
            <p className="text-sm">No users found</p>
          </div>
        ) : (
          <Card className="overflow-hidden">
            {users.map((u) => (
              <UserRow
                key={u.id}
                user={u}
                currentUserId={currentUser?.id ?? ""}
                onEdit={setEditTarget}
                onDelete={setDeleteTarget}
              />
            ))}
          </Card>
        )}
      </div>

      {editTarget && (
        <EditModal
          user={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={handleSaved}
        />
      )}

      {deleteTarget && (
        <DeleteConfirm
          user={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDelete={() => handleDeleted(deleteTarget.id)}
        />
      )}
    </div>
  );
}
