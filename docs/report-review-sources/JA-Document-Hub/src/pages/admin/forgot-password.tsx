/**
 * /admin/forgot-password — Redirects to /admin (Microsoft sign-in).
 *
 * Password management is handled by Microsoft. There is no admin password
 * reset flow in this application — use Microsoft account management instead.
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminForgotPasswordPage() {
  const navigate = useNavigate();
  useEffect(() => { navigate('/admin', { replace: true }); }, [navigate]);
  return null;
}
