/**
 * /admin/setup — Redirects to /admin (Microsoft sign-in).
 *
 * The first-run setup wizard is no longer needed — admin access is
 * controlled entirely by Microsoft Entra ID.
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminSetupPage() {
  const navigate = useNavigate();
  useEffect(() => { navigate('/admin', { replace: true }); }, [navigate]);
  return null;
}
