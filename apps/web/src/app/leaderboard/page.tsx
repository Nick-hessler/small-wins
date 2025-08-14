"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "aws-amplify/auth";
import { generateClient } from "aws-amplify/api";
import { configureAmplify } from "@/app/amplify-client";

interface LeaderboardRow {
  userId: string;
  displayName: string;
  handle: string;
  score: number;
  winsCount: number;
}

interface LeaderboardResponse { weeklyLeaderboard: LeaderboardRow[] }

const LEADERBOARD_QUERY = /* GraphQL */ `
  query WeeklyLeaderboard($weekStart: AWSDate!) {
    weeklyLeaderboard(weekStart: $weekStart) {
      userId
      displayName
      handle
      score
      winsCount
    }
  }
`;

function getWeekStartISO(): string {
  const d = new Date();
  const day = d.getUTCDay();
  const diff = (day + 6) % 7; // Monday as start
  d.setUTCDate(d.getUTCDate() - diff);
  const iso = d.toISOString().slice(0, 10); // YYYY-MM-DD
  return iso;
}

export default function LeaderboardPage() {
  configureAmplify();
  const router = useRouter();
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        await getCurrentUser();
      } catch {
        router.push("/auth/sign-in");
        return;
      }
      try {
        const client = generateClient();
        const weekStart = getWeekStartISO();
        const { data } = await client.graphql<{ data: LeaderboardResponse }>({ query: LEADERBOARD_QUERY, variables: { weekStart } }) as unknown as { data: LeaderboardResponse };
        setRows(data.weeklyLeaderboard ?? []);
      } catch (err: unknown) {
        const msg = typeof err === 'object' && err && 'message' in err ? String((err as {message:string}).message) : 'Failed to load leaderboard';
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router]);

  const card: React.CSSProperties = {
    background: 'rgba(255,255,255,.06)',
    border: '1px solid rgba(255,255,255,.12)',
    borderRadius: 16,
    padding: 16
  };

  if (loading) {
    return <main style={{ padding: '24px 14px' }}><div style={card}>Loading leaderboard…</div></main>;
  }

  return (
    <main style={{ padding: '24px 14px', maxWidth: 820, margin: '0 auto' }}>
      <h1 style={{ fontWeight: 900, fontSize: 28, margin: '8px 0 16px' }}>Weekly Leaderboard</h1>
      {error && <div style={{ ...card, borderColor: 'rgba(239,68,68,.4)', color: '#fecaca' }}>{error}</div>}

      <div style={{ display: 'grid', gap: 10 }}>
        {rows.length === 0 && (
          <div style={{ ...card, textAlign: 'center', opacity: .85 }}>No entries yet. Log a win to get on the board!</div>
        )}
        {rows.map((r, idx) => (
          <div key={r.userId} style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(180deg,#7C3AED 0%, #4F46E5 100%)' }}></div>
              <div>
                <div style={{ fontWeight: 800 }}>{idx + 1}. {r.displayName}</div>
                <div style={{ opacity: .7, fontSize: 13 }}>@{r.handle}</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 900 }}>{r.score} pts</div>
              <div style={{ opacity: .7, fontSize: 13 }}>{r.winsCount} wins</div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
