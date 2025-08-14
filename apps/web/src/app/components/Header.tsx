"use client";
import { useState, useEffect } from "react";
import { getCurrentUser, signOut, AuthUser } from "aws-amplify/auth";
import Link from "next/link";
import { configureAmplify } from "../amplify-client";

export default function Header() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    configureAmplify();
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
      setUser(null);
      setShowUserMenu(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }

  if (loading) {
    return (
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(15,23,42,.8)', backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(255,255,255,.1)'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(180deg,#7C3AED 0%, #4F46E5 100%)' }}></div>
              <span style={{ fontWeight: 800, fontSize: 18 }}>Small Wins</span>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(15,23,42,.8)', backdropFilter: 'blur(8px)',
      borderBottom: '1px solid rgba(255,255,255,.1)'
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(180deg,#7C3AED 0%, #4F46E5 100%)' }}></div>
            <span style={{ fontWeight: 800, fontSize: 18 }}>Small Wins</span>
          </div>
          
          <nav style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {user ? (
              <>
                <Link href="/" style={{ color: 'rgba(226,232,255,.9)', textDecoration: 'none', fontWeight: 500 }}>Home</Link>
                <Link href="/feed" style={{ color: 'rgba(226,232,255,.9)', textDecoration: 'none', fontWeight: 500 }}>Feed</Link>
                <Link href="/leaderboard" style={{ color: 'rgba(226,232,255,.9)', textDecoration: 'none', fontWeight: 500 }}>Leaderboard</Link>
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '8px 12px', borderRadius: 8,
                      background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.14)',
                      color: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 500
                    }}
                  >
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(180deg,#7C3AED 0%, #4F46E5 100%)' }}></div>
                    Dashboard
                  </button>
                  
                  {showUserMenu && (
                    <div style={{
                      position: 'absolute', top: '100%', right: 0, marginTop: 8,
                      background: 'rgba(15,23,42,.95)', border: '1px solid rgba(255,255,255,.1)',
                      borderRadius: 12, padding: 8, minWidth: 160, backdropFilter: 'blur(8px)'
                    }}>
                      <Link
                        href="/me"
                        style={{
                          display: 'block', padding: '10px 12px', borderRadius: 8,
                          color: 'rgba(226,232,255,.9)', textDecoration: 'none', fontSize: 14
                        }}
                        onClick={() => setShowUserMenu(false)}
                      >
                        My Dashboard
                      </Link>
                      <Link
                        href="/log-win"
                        style={{
                          display: 'block', padding: '10px 12px', borderRadius: 8,
                          color: 'rgba(226,232,255,.9)', textDecoration: 'none', fontSize: 14
                        }}
                        onClick={() => setShowUserMenu(false)}
                      >
                        Log a Win
                      </Link>
                      <button
                        onClick={handleSignOut}
                        style={{
                          display: 'block', width: '100%', textAlign: 'left',
                          padding: '10px 12px', borderRadius: 8, border: 'none',
                          background: 'none', color: '#FCA5A5', fontSize: 14, cursor: 'pointer'
                        }}
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/" style={{ color: 'rgba(226,232,255,.9)', textDecoration: 'none', fontWeight: 500 }}>Home</Link>
                <Link href="/waitlist" style={{ color: 'rgba(226,232,255,.9)', textDecoration: 'none', fontWeight: 500 }}>Waitlist</Link>
                <Link href="/plans" style={{ color: 'rgba(226,232,255,.9)', textDecoration: 'none', fontWeight: 500 }}>Plans</Link>
                <Link href="/auth/sign-in" style={{ color: 'rgba(226,232,255,.9)', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
                <Link href="/auth/sign-up" style={{
                  padding: '8px 16px', borderRadius: 8, background: 'linear-gradient(180deg,#7C3AED 0%, #4F46E5 100%)',
                  color: 'white', textDecoration: 'none', fontWeight: 600
                }}>Create account</Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
