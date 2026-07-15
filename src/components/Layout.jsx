import { useEffect, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";

function BrandMark({ compact = false }) {
  return (
    <span className="brand-lockup" aria-hidden="true">
      <span className="brand-mark">
        <svg viewBox="0 0 24 24" role="img">
          <path d="M7 3.75h7.4L18 7.35v12.9H7z" />
          <path d="M14 3.75v4h4M9.5 11h6M9.5 14h6M9.5 17h4" />
        </svg>
      </span>
      {!compact && (
        <span className="brand-copy">
          <strong>JA Plan Studio</strong>
          <small>by JA Group Services Ltd</small>
        </span>
      )}
    </span>
  );
}

function ThemeToggle() {
  const [theme, setTheme] = useState(() => localStorage.getItem("ja-plan-theme") || "light");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("ja-plan-theme", theme);
  }, [theme]);

  return (
    <div className="theme-switch" aria-label="Colour theme">
      <button type="button" className={theme === "light" ? "active" : ""} onClick={() => setTheme("light")} aria-label="Use light theme">☀</button>
      <button type="button" className={theme === "dark" ? "active" : ""} onClick={() => setTheme("dark")} aria-label="Use dark theme">☾</button>
    </div>
  );
}

export function Layout() {
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navClass = ({ isActive }) => `nav-link${isActive ? " nav-link-active" : ""}`;

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <header className="site-header">
        <div className="shell-container header-inner">
          <Link to="/builders" className="brand-home" aria-label="JA Plan Studio home"><BrandMark /></Link>
          <nav className="desktop-nav" aria-label="Main navigation">
            <NavLink to="/builders" className={navClass}>Builders</NavLink>
            {user && <NavLink to="/account/builders" className={navClass}>My Builders</NavLink>}
            {user && <NavLink to="/account/plans" className={navClass}>My Plans</NavLink>}
          </nav>
          <div className="header-actions">
            {user ? (
              <button onClick={signOut} className="btn-secondary btn-small">Sign out</button>
            ) : (
              <>
                <Link to="/signin" className="btn-ghost">Sign in</Link>
                <Link to="/signup" className="btn-primary btn-small">Create account</Link>
              </>
            )}
          </div>
          <button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="mobile-menu" onClick={() => setMenuOpen(v => !v)}>
            <span className="sr-only">{menuOpen ? "Close" : "Open"} navigation</span>{menuOpen ? "×" : "☰"}
          </button>
        </div>
        <nav id="mobile-menu" className={`mobile-nav${menuOpen ? " open" : ""}`} aria-label="Mobile navigation">
          <NavLink to="/builders" className={navClass} onClick={() => setMenuOpen(false)}>Builders</NavLink>
          {user && <NavLink to="/account/builders" className={navClass} onClick={() => setMenuOpen(false)}>My Builders</NavLink>}
          {user && <NavLink to="/account/plans" className={navClass} onClick={() => setMenuOpen(false)}>My Plans</NavLink>}
        </nav>
      </header>

      <main id="main-content" className="site-main"><Outlet /></main>

      <footer className="site-footer">
        <div className="shell-container footer-grid">
          <div className="footer-brand">
            <Link to="/builders" aria-label="JA Plan Studio home"><BrandMark /></Link>
            <p>Guided planning builders for travel, days out and everyday experiences.</p>
            <ThemeToggle />
          </div>
          <div>
            <h2>Plan Studio</h2>
            <Link to="/builders">Builders</Link>
            {user && <Link to="/account/builders">My Builders</Link>}
            {user && <Link to="/account/plans">My Plans</Link>}
          </div>
          <div>
            <h2>Your account</h2>
            {user ? <button className="footer-link" onClick={signOut}>Sign out</button> : <><Link to="/signin">Sign in</Link><Link to="/signup">Create account</Link></>}
          </div>
          <div>
            <h2>Support &amp; legal</h2>
            <a href="/contact/">Contact us</a>
            <a href="/privacy/">Privacy notice</a>
            <a href="/terms/">Terms of service</a>
            <a href="/cookies/">Cookie notice</a>
          </div>
        </div>
        <div className="shell-container footer-bottom">
          <span>Copyright 2025–{new Date().getFullYear()} JA Group Services Ltd and/or its Licensors – All Rights Reserved.</span>
          <span>JA Plan Studio is operated by JA Group Services Ltd.</span>
        </div>
      </footer>
    </div>
  );
}
