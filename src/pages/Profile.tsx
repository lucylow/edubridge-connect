import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { User, Star, BookOpen, Save, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ name, bio, updated_at: new Date().toISOString() })
        .eq("user_id", user.id);
      if (error) throw error;
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Your Profile</h1>

      <div className="bg-card rounded-3xl p-8 border border-border space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-lg">{user.name}</h2>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="capitalize bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-xs font-medium">{user.role}</span>
              {user.rating && <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-amber-500" />{user.rating}</span>}
              <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" />{user.sessionsCompleted} sessions</span>
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Full Name</label>
          <Input value={name} onChange={e => setName(e.target.value)} />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Email</label>
          <Input value={user.email} disabled className="opacity-60" />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Bio</label>
          <Textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} placeholder="Tell us about yourself..." />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Subjects</label>
          <div className="flex flex-wrap gap-2">
            {user.subjects.map(s => (
              <span key={s} className="px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full">{s}</span>
            ))}
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

export default Profile;
