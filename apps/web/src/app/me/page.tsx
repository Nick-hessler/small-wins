"use client";
import { useState, useEffect } from "react";
import { getCurrentUser, fetchUserAttributes } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import { configureAmplify } from "@/app/amplify-client";

interface UserAttributes {
  given_name?: string;
  family_name?: string;
  email?: string;
}

export default function DashboardPage() {
  configureAmplify();
  const router = useRouter();
  const [user, setUser] = useState<UserAttributes | null>(null);
  const [loading, setLoading] = useState(true);
  const [todayStreak, setTodayStreak] = useState(0);
  const [winsToday, setWinsToday] = useState(0);

  useEffect(() => {
    async function loadUser() {
      try {
        await getCurrentUser();
        const attributes = await fetchUserAttributes();
        setUser(attributes);
        
        // TODO: Fetch actual streak and wins from GraphQL
        setTodayStreak(3); // Placeholder
        setWinsToday(2); // Placeholder
      } catch (err) {
        console.error("Failed to load user:", err);
        router.push("/auth/sign-in");
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [router]);

  if (loading) {
    return (
      <main style={{ padding: '0 14px', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, marginBottom: 16 }}>Loading...</div>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  const displayName = user.given_name || user.email?.split('@')[0] || 'User';
  
  const cardStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,.06)',
    border: '1px solid rgba(255,255,255,.12)',
    borderRadius: 16,
    padding: 24,
    backdropFilter: 'blur(8px)'
  };
  
  const primaryBtn: React.CSSProperties = {
    padding: '14px 20px',
    borderRadius: 12,
    fontWeight: 800,
    background: 'linear-gradient(180deg,#7C3AED 0%, #4F46E5 100%)',
    color: 'white',
    border: 'none',
    fontSize: 16,
    cursor: 'pointer'
  };

  const secondaryBtn: React.CSSProperties = {
    padding: '12px 18px',
    borderRadius: 12,
    fontWeight: 700,
    background: 'rgba(255,255,255,.08)',
    color: 'rgba(226,232,255,.9)',
    border: '1px solid rgba(255,255,255,.14)',
    fontSize: 14,
    cursor: 'pointer'
  };

  return (
    <main style={{ padding: '0 14px', maxWidth: 800, margin: '0 auto' }}>
      {/* Welcome Header */}
      <section style={{ ...cardStyle, margin: '32px 0 24px', textAlign: 'center' }}>
        <h1 style={{ fontWeight: 900, fontSize: 32, margin: '0 0 8px', background: 'linear-gradient(180deg,#E0E7FF 0%,#C7D2FE 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Welcome back, {displayName}! 👋
        </h1>
        <p style={{ fontSize: 18, opacity: 0.8, margin: 0 }}>
          Ready to celebrate today&apos;s wins?
        </p>
      </section>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div style={cardStyle}>
          <div style={{ fontSize: 14, opacity: 0.7, marginBottom: 8 }}>Today&apos;s Streak</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#FCD34D' }}>{todayStreak} 🔥</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 14, opacity: 0.7, marginBottom: 8 }}>Wins Today</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#10B981' }}>{winsToday} ✨</div>
        </div>
      </div>

      {/* Main Actions */}
      <section style={cardStyle}>
        <h2 style={{ fontWeight: 800, fontSize: 24, margin: '0 0 20px' }}>What would you like to do?</h2>
        <div style={{ display: 'grid', gap: 16 }}>
          <button 
            onClick={() => router.push('/log-win')} 
            style={primaryBtn}
          >
            🎯 Log a Win
          </button>
          <button 
            onClick={() => router.push('/feed')} 
            style={secondaryBtn}
          >
            📱 View Community Feed
          </button>
          <button 
            onClick={() => router.push('/leaderboard')} 
            style={secondaryBtn}
          >
            🏆 Weekly Leaderboard
          </button>
        </div>
      </section>

      {/* Recent Activity */}
      <section style={cardStyle}>
        <h2 style={{ fontWeight: 800, fontSize: 24, margin: '0 0 20px' }}>Recent Activity</h2>
        <div style={{ opacity: 0.6, textAlign: 'center', padding: '32px 16px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
          <p style={{ margin: '0 0 16px' }}>No wins logged yet today</p>
          <button 
            onClick={() => router.push('/log-win')} 
            style={{ ...secondaryBtn, fontSize: 14 }}
          >
            Log your first win
          </button>
        </div>
      </section>
    </main>
  );
}
