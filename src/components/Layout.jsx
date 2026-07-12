import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";

export function Layout() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
          <Link to="/" className="inline-flex items-baseline gap-1.5 text-lg font-semibold whitespace-nowrap" aria-label="JA Plan Studio home">
            <span className="text-black" aria-hidden="true">JA</span>
            <span className="text-[#102449]" aria-hidden="true">Plan Studio</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            <Link to="/builders" className="nav-link">Builders</Link>
            {user && <Link to="/account/builders" className="nav-link">My Builders</Link>}
            {user && <Link to="/account/plans" className="nav-link">My Plans</Link>}
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <button onClick={signOut} className="btn-ghost">Sign out</button>
            ) : (
              <>
                <Link to="/signin" className="btn-ghost">Sign in</Link>
                <Link to="/signup" className="btn-primary text-sm">Create account</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-gray-200 bg-white mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-gray-500">
          &copy; 2026 JA Plan Studio. All rights reserved. Operated by JA Group Services Ltd.
        </div>
      </footer>
    </div>
  );
}
