import { useState, useEffect, useCallback } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ShieldCheck, ShieldAlert, AlertTriangle, Lock, Users, RefreshCw,
  CheckCircle2, XCircle, Clock,
} from 'lucide-react';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isPlatformOwner: boolean;
  mustResetPassword: boolean;
  suspended?: boolean;
  lastLogin?: string;
}

interface LoginAttempt {
  id: number;
  email: string;
  success: boolean;
  ip: string;
  createdAt: string;
}

function roleLabel(role: string) {
  return role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AdminSecurity() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [attempts, setAttempts] = useState<LoginAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAttempts, setLoadingAttempts] = useState(true);

  const card = 'bg-white border-gray-200 dark:bg-slate-800 dark:border-slate-700';
  const text = 'text-gray-900 dark:text-white';
  const muted = 'text-gray-500 dark:text-slate-400';
  const subtle = 'text-gray-400 dark:text-slate-600';
  const rowBg = 'bg-gray-50 dark:bg-slate-700/40';
  const divider = 'border-gray-200 dark:border-slate-700';

  const load = useCallback(() => {
    setLoading(true);
    fetch('/api/admin/users', { credentials: 'include' })
      .then((r) => r.json())
      .then((d: { success: boolean; users: AdminUser[] }) => {
        if (d.success) setAdmins(d.users);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    setLoadingAttempts(true);
    fetch('/api/admin/audit/login-attempts', { credentials: 'include' })
      .then(r => r.json())
      .then((d: { success: boolean; attempts?: LoginAttempt[] }) => {
        if (d.success && d.attempts) setAttempts(d.attempts);
      })
      .catch(() => {})
      .finally(() => setLoadingAttempts(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const activeAdmins = admins.filter((a) => !a.suspended).length;
  const pendingReset = admins.filter((a) => a.mustResetPassword).length;
  const recentFailed = attempts.filter(a => !a.success).slice(0, 20);
  const recentSuccessful = attempts.filter(a => a.success).slice(0, 10);

  return (
    <>
      <Helmet>
        <title>Security Centre — Admin Portal</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <AdminLayout title="Security Centre" subtitle="Admin accounts, access controls, login activity, and security settings">
        <div className="space-y-5">

          {/* Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Admin Accounts', value: admins.length, color: 'text-blue-500', icon: Users },
              { label: 'Active Accounts', value: activeAdmins, color: 'text-green-500', icon: ShieldCheck },
              { label: 'Pending Password Reset', value: pendingReset, color: pendingReset > 0 ? 'text-amber-500' : muted, icon: Lock },
              { label: 'Suspended Accounts', value: admins.filter((a) => a.suspended).length, color: 'text-red-500', icon: AlertTriangle },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <Card key={s.label} className={card}>
                  <CardContent className="p-3 flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${s.color} shrink-0`} />
                    <div>
                      <p className={`text-xl font-bold ${s.color}`}>{loading ? '—' : s.value}</p>
                      <p className={`text-xs ${muted}`}>{s.label}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Admin accounts */}
          <Card className={card}>
            <CardHeader className={`pb-3 pt-4 px-4 flex flex-row items-center justify-between border-b ${divider}`}>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <h3 className={`text-sm font-semibold ${text}`}>Administrator Accounts</h3>
              </div>
              <button onClick={load} className={`p-1.5 rounded-lg transition-colors ${'text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700'}`}>
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-3">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className={`w-5 h-5 animate-spin ${muted}`} />
                </div>
              ) : admins.length === 0 ? (
                <p className={`text-xs py-4 text-center ${subtle}`}>No admin accounts found.</p>
              ) : (
                <div className="space-y-2">
                  {admins.map((a) => (
                    <div key={a.id} className={`flex items-center gap-3 ${rowBg} rounded-lg px-3 py-2.5`}>
                      <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <span className="text-primary text-xs font-bold">{(a.name ?? '?').charAt(0)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className={`text-xs font-medium truncate ${text}`}>{a.name}</p>
                          {a.isPlatformOwner && (
                            <Badge className="text-[9px] bg-amber-500/20 text-amber-500 border-amber-500/30 hover:bg-amber-500/20">Owner</Badge>
                          )}
                        </div>
                        <p className={`text-[10px] truncate ${muted}`}>{a.email}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                        {a.mustResetPassword && (
                          <Badge className="text-[9px] bg-blue-500/20 text-blue-500 border-blue-500/30 hover:bg-blue-500/20">Reset Pending</Badge>
                        )}
                        {a.suspended ? (
                          <Badge className="text-[9px] bg-red-500/20 text-red-500 border-red-500/30 hover:bg-red-500/20">Suspended</Badge>
                        ) : (
                          <Badge className="text-[9px] bg-green-500/20 text-green-500 border-green-500/30 hover:bg-green-500/20">Active</Badge>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-[10px] ${'text-gray-600 dark:text-slate-300'}`}>{roleLabel(a.role)}</p>
                        <p className={`text-[10px] ${subtle}`}>
                          {a.lastLogin ? `Last: ${new Date(a.lastLogin).toLocaleDateString('en-GB')}` : 'Never logged in'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Login attempts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Failed attempts */}
            <Card className={card}>
              <CardHeader className={`pb-3 pt-4 px-4 flex flex-row items-center gap-2 border-b ${divider}`}>
                <XCircle className="w-4 h-4 text-red-500" />
                <h3 className={`text-sm font-semibold ${text}`}>Recent Failed Logins</h3>
                <span className={`ml-auto text-xs ${muted}`}>{recentFailed.length} shown</span>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-3">
                {loadingAttempts ? (
                  <div className={`h-20 rounded animate-pulse ${'bg-gray-100 dark:bg-slate-700/50'}`} />
                ) : recentFailed.length === 0 ? (
                  <p className={`text-xs py-4 text-center ${subtle}`}>No failed login attempts recorded.</p>
                ) : (
                  <div className="space-y-1.5 max-h-64 overflow-y-auto">
                    {recentFailed.map(a => (
                      <div key={a.id} className={`flex items-center gap-2 ${rowBg} rounded px-2.5 py-1.5`}>
                        <XCircle className="w-3 h-3 text-red-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs truncate ${text}`}>{a.email}</p>
                          <p className={`text-[10px] ${subtle}`}>{a.ip}</p>
                        </div>
                        <p className={`text-[10px] shrink-0 ${subtle}`}>
                          {new Date(a.createdAt).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Successful logins */}
            <Card className={card}>
              <CardHeader className={`pb-3 pt-4 px-4 flex flex-row items-center gap-2 border-b ${divider}`}>
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <h3 className={`text-sm font-semibold ${text}`}>Recent Successful Logins</h3>
                <span className={`ml-auto text-xs ${muted}`}>{recentSuccessful.length} shown</span>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-3">
                {loadingAttempts ? (
                  <div className={`h-20 rounded animate-pulse ${'bg-gray-100 dark:bg-slate-700/50'}`} />
                ) : recentSuccessful.length === 0 ? (
                  <p className={`text-xs py-4 text-center ${subtle}`}>No successful logins recorded yet.</p>
                ) : (
                  <div className="space-y-1.5 max-h-64 overflow-y-auto">
                    {recentSuccessful.map(a => (
                      <div key={a.id} className={`flex items-center gap-2 ${rowBg} rounded px-2.5 py-1.5`}>
                        <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs truncate ${text}`}>{a.email}</p>
                          <p className={`text-[10px] ${subtle}`}>{a.ip}</p>
                        </div>
                        <p className={`text-[10px] shrink-0 ${subtle}`}>
                          {new Date(a.createdAt).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Security policy */}
          <Card className={card}>
            <CardHeader className={`pb-3 pt-4 px-4 flex flex-row items-center gap-2 border-b ${divider}`}>
              <Lock className={`w-4 h-4 ${muted}`} />
              <h3 className={`text-sm font-semibold ${text}`}>Security Policy</h3>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: 'Session Timeout', value: '60 minutes' },
                  { label: 'Admin Session Timeout', value: '30 minutes' },
                  { label: 'Max Login Attempts', value: '5 before lockout' },
                  { label: 'Lockout Duration', value: '30 minutes' },
                  { label: 'Min Password Length', value: '8 characters (admin: 12)' },
                  { label: 'Forced Reset on First Login', value: 'Enabled for all new accounts' },
                ].map((item) => (
                  <div key={item.label} className={`flex items-center justify-between ${rowBg} rounded-lg px-3 py-2`}>
                    <span className={`text-xs ${muted}`}>{item.label}</span>
                    <span className={`text-xs font-medium ${text}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Session note */}
          <div className={`flex items-start gap-3 ${card} border rounded-xl px-4 py-3`}>
            <ShieldAlert className={`w-4 h-4 shrink-0 mt-0.5 ${muted}`} />
            <div>
              <p className={`text-xs font-medium ${text}`}>Session Management</p>
              <p className={`text-xs mt-0.5 ${muted}`}>
                Admin sessions are stored in HTTP-only cookies and validated server-side against the database on every request.
                Sessions expire after 30 minutes of inactivity. IP-based blocking and active session revocation are available via the database.
              </p>
            </div>
          </div>

          {/* Last activity */}
          {attempts.length > 0 && (
            <Card className={card}>
              <CardHeader className={`pb-3 pt-4 px-4 flex flex-row items-center gap-2 border-b ${divider}`}>
                <Clock className={`w-4 h-4 ${muted}`} />
                <h3 className={`text-sm font-semibold ${text}`}>Login Attempt Summary</h3>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className={`${rowBg} rounded-lg p-3 text-center`}>
                    <p className={`text-xl font-bold ${text}`}>{attempts.length}</p>
                    <p className={`text-[10px] mt-0.5 ${muted}`}>Total Attempts</p>
                  </div>
                  <div className={`${rowBg} rounded-lg p-3 text-center`}>
                    <p className="text-xl font-bold text-green-500">{attempts.filter(a => a.success).length}</p>
                    <p className={`text-[10px] mt-0.5 ${muted}`}>Successful</p>
                  </div>
                  <div className={`${rowBg} rounded-lg p-3 text-center`}>
                    <p className="text-xl font-bold text-red-500">{attempts.filter(a => !a.success).length}</p>
                    <p className={`text-[10px] mt-0.5 ${muted}`}>Failed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </AdminLayout>
    </>
  );
}
