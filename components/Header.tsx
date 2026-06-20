'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useTheme } from './ThemeContext';
import { Sun, Moon, LogOut, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  const { login, logout, authenticated, user } = usePrivy();
  const { theme, toggleTheme } = useTheme();

  const emailAddress = user?.email?.address;
  const displayAddress = emailAddress || 'Authenticated';

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link href="/" className="logo-container">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Panacea Logo" style={{ width: '40px', height: '40px' }} />
          <span className="logo-text" style={{ color: 'var(--foreground)' }}>
            panacea
          </span>
        </Link>

        <div className="nav-links">
          {authenticated && (
            <Link
              href="/dashboard"
              className="btn-text"
              style={{ fontFamily: 'Space Grotesk', textDecoration: 'none' }}
            >
              Your Briefing Locker
            </Link>
          )}

          <button
            onClick={toggleTheme}
            className="btn-secondary"
            style={{ padding: '8px 12px', border: '1px solid var(--border)' }}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun size={18} style={{ color: 'var(--accent)' }} />
            ) : (
              <Moon size={18} style={{ color: 'var(--primary)' }} />
            )}
          </button>

          {authenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span
                style={{
                  fontFamily: 'Space Grotesk',
                  fontSize: '0.9rem',
                  background: 'var(--card-background)',
                  border: '1px solid var(--border)',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  color: 'var(--foreground-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <ShieldCheck size={16} style={{ color: 'var(--accent)' }} />
                {displayAddress}
              </span>
              <button
                onClick={logout}
                className="btn-secondary"
                style={{
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
                title="Leave Session"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button onClick={login} className="btn-primary">
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
