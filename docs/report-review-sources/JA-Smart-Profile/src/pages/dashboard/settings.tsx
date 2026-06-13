import { useState } from 'react';
import { Save, Trash2, Check, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/lib/auth';

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  const saveProfile = async () => {
    setError('');
    if (!name.trim()) { setError('Name cannot be empty.'); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${user?.id}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const deleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return;
    setDeleting(true);
    try {
      await fetch(`/api/users/${user?.id}`, { method: 'DELETE', credentials: 'include' });
      window.location.href = '/auth/logout';
    } catch {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-20 lg:pb-0">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your display name and account preferences</p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">{error}</div>
      )}

      {/* Display name */}
      <Card className="bg-card border-border mb-6">
        <CardHeader>
          <CardTitle className="text-base">Display Name</CardTitle>
          <CardDescription>This is how your name appears across your profiles and the platform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Full Name</Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              className="mt-1.5 bg-background border-border"
              placeholder="Your full name"
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={saveProfile} disabled={saving} className="bg-primary gap-2">
              {saved
                ? <><Check className="w-4 h-4" /> Saved!</>
                : saving
                  ? 'Saving…'
                  : <><Save className="w-4 h-4" /> Save Changes</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Email — read only, managed by JA Group Services Secure Access */}
      <Card className="bg-card border-border mb-6">
        <CardHeader>
          <CardTitle className="text-base">Email Address</CardTitle>
          <CardDescription>Managed by your JA Group Services Secure Access account — cannot be changed here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border">
            <Info className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.email}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                To change your email, contact JA Group Services support.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-card border-red-500/20">
        <CardHeader>
          <CardTitle className="text-base text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Delete Account</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Permanently deletes your account, all profiles, links, and data. Cannot be undone.
              </p>
            </div>
            <Button
              variant="outline"
              className="border-red-500/30 text-red-400 hover:bg-red-500/10 gap-2 flex-shrink-0"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="w-4 h-4" /> Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Delete Account</DialogTitle>
            <DialogDescription>
              This will permanently delete your account, all profiles, links, and data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Label>Type <strong>DELETE</strong> to confirm</Label>
            <Input
              value={deleteConfirm}
              onChange={e => setDeleteConfirm(e.target.value)}
              className="mt-1.5 bg-background border-border"
              placeholder="DELETE"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="border-border">Cancel</Button>
            <Button
              onClick={deleteAccount}
              disabled={deleteConfirm !== 'DELETE' || deleting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {deleting ? 'Deleting…' : 'Delete Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
