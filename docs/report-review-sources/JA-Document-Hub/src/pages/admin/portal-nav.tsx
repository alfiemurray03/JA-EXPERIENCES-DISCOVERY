/**
 * /admin/portal-nav — Customer Portal Sidebar Manager
 *
 * Allows admins to show/hide any section or item in the customer portal sidebar.
 * Changes are saved to ja_system_config under key "portal_nav_config" and take
 * effect immediately for all customers (sidebar fetches /api/portal-nav on load).
 */
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Save, RotateCcw, Eye, EyeOff, ChevronDown, ChevronRight,
  CheckCircle2, AlertTriangle, Loader2, LayoutDashboard,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DEFAULT_PORTAL_NAV,
  type PortalNavSection,
  type PortalNavItem,
  type PortalNavOverrides,
} from '@/lib/portal-nav';

// ── Types ─────────────────────────────────────────────────────────────────────

interface AdminNavResponse {
  success: boolean;
  sections: PortalNavSection[];
  overrides: PortalNavOverrides;
  error?: string;
}

// ── Section row ───────────────────────────────────────────────────────────────

interface SectionRowProps {
  section: PortalNavSection;
  visibility: Record<string, boolean>;
  onToggle: (id: string, value: boolean) => void;
}

function SectionRow({ section, visibility, onToggle }: SectionRowProps) {
  const [expanded, setExpanded] = useState(true);

  const sectionVisible = visibility[section.id] !== undefined
    ? visibility[section.id]
    : section.defaultVisible;

  const visibleItemCount = section.items.filter(item => {
    return visibility[item.id] !== undefined ? visibility[item.id] : item.defaultVisible;
  }).length;

  const hiddenItemCount = section.items.length - visibleItemCount;

  return (
    <div className={cn(
      'border border-border rounded-xl overflow-hidden transition-opacity',
      !sectionVisible && 'opacity-60',
    )}>
      {/* Section header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-muted/30">
        <button
          onClick={() => setExpanded(v => !v)}
          className="flex items-center gap-2 flex-1 min-w-0 text-left"
        >
          <ChevronRight
            className={cn('w-4 h-4 text-muted-foreground transition-transform shrink-0', expanded && 'rotate-90')}
          />
          <span className="font-semibold text-sm text-foreground truncate">{section.label}</span>
          <Badge variant="outline" className="text-[10px] h-4 px-1.5 shrink-0">
            {section.items.length} items
          </Badge>
          {hiddenItemCount > 0 && (
            <Badge variant="secondary" className="text-[10px] h-4 px-1.5 gap-0.5 shrink-0 text-amber-600 bg-amber-50 border-amber-200">
              <EyeOff className="w-2.5 h-2.5" />
              {hiddenItemCount} hidden
            </Badge>
          )}
        </button>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground hidden sm:block">
            {sectionVisible ? 'Section visible' : 'Section hidden'}
          </span>
          <Switch
            checked={sectionVisible}
            onCheckedChange={v => onToggle(section.id, v)}
            aria-label={`Toggle visibility of ${section.label} section`}
          />
        </div>
      </div>

      {/* Items */}
      {expanded && (
        <div className="divide-y divide-border/50">
          {section.items.map((item: PortalNavItem) => {
            const itemVisible = visibility[item.id] !== undefined
              ? visibility[item.id]
              : item.defaultVisible;

            return (
              <div
                key={item.id}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 transition-opacity',
                  (!sectionVisible || !itemVisible) && 'opacity-50',
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{item.label}</p>
                  <p className="text-[10px] text-muted-foreground font-mono truncate">{item.href}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {itemVisible
                    ? <Eye className="w-3.5 h-3.5 text-green-500" />
                    : <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
                  }
                  <Switch
                    checked={itemVisible}
                    onCheckedChange={v => onToggle(item.id, v)}
                    disabled={!sectionVisible}
                    aria-label={`Toggle visibility of ${item.label}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminPortalNavPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [visibility, setVisibility] = useState<Record<string, boolean>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Load current config
  useEffect(() => {
    setLoading(true);
    fetch('/api/admin/portal-nav', { credentials: 'include' })
      .then(r => r.json() as Promise<AdminNavResponse>)
      .then(data => {
        if (data.success) {
          setVisibility(data.overrides?.visibility ?? {});
        } else {
          setError(data.error ?? 'Failed to load portal nav config.');
        }
      })
      .catch(() => setError('Network error loading portal nav config.'))
      .finally(() => setLoading(false));
  }, []);

  function handleToggle(id: string, value: boolean) {
    setVisibility(prev => ({ ...prev, [id]: value }));
    setHasChanges(true);
    setSaveSuccess(false);
  }

  function handleResetToDefaults() {
    setVisibility({});
    setHasChanges(true);
    setSaveSuccess(false);
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    setSaveSuccess(false);
    try {
      const res = await fetch('/api/admin/portal-nav', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visibility }),
      });
      const data = await res.json() as { success: boolean; error?: string };
      if (data.success) {
        setSaveSuccess(true);
        setHasChanges(false);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setError(data.error ?? 'Failed to save.');
      }
    } catch {
      setError('Network error saving portal nav config.');
    } finally {
      setSaving(false);
    }
  }

  // Count total hidden items
  const totalHidden = DEFAULT_PORTAL_NAV.flatMap(s => [
    ...(visibility[s.id] === false ? [s.id] : []),
    ...s.items.filter(i => visibility[i.id] === false).map(i => i.id),
  ]).length;

  return (
    <AdminLayout title="Portal Navigation Manager" subtitle="Control which sections and items appear in the customer portal sidebar">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header card */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-xl border border-border bg-card">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <LayoutDashboard className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-foreground">Customer Portal Sidebar</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Toggle sections and items on or off. Changes take effect immediately for all customers.
              {totalHidden > 0 && (
                <span className="ml-1 text-amber-600 font-medium">{totalHidden} item{totalHidden !== 1 ? 's' : ''} currently hidden.</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2" disabled={saving}>
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset to defaults
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset to defaults?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will clear all visibility overrides and restore the default sidebar structure.
                    You'll still need to click Save to apply the change.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleResetToDefaults}>Reset</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button
              size="sm"
              className="gap-2"
              onClick={handleSave}
              disabled={saving || !hasChanges}
            >
              {saving
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : saveSuccess
                  ? <CheckCircle2 className="w-3.5 h-3.5" />
                  : <Save className="w-3.5 h-3.5" />
              }
              {saving ? 'Saving…' : saveSuccess ? 'Saved!' : 'Save changes'}
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Success */}
        {saveSuccess && (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Portal navigation saved. Customers will see the updated sidebar on their next page load.
          </div>
        )}

        {/* Unsaved changes warning */}
        {hasChanges && !saveSuccess && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            You have unsaved changes. Click <strong className="mx-1">Save changes</strong> to apply them.
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-3">
            {DEFAULT_PORTAL_NAV.map((section, idx) => (
              <div key={section.id}>
                {idx > 0 && idx % 3 === 0 && <Separator className="my-1" />}
                <SectionRow
                  section={section}
                  visibility={visibility}
                  onToggle={handleToggle}
                />
              </div>
            ))}
          </div>
        )}

        {/* Bottom save bar */}
        {hasChanges && (
          <div className="sticky bottom-4 flex justify-end">
            <div className="flex items-center gap-3 bg-card border border-border shadow-lg rounded-xl px-4 py-3">
              <span className="text-sm text-muted-foreground">Unsaved changes</span>
              <Button size="sm" className="gap-2" onClick={handleSave} disabled={saving}>
                {saving
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <Save className="w-3.5 h-3.5" />
                }
                {saving ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
