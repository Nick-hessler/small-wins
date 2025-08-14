"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "aws-amplify/auth";
import { generateClient } from "aws-amplify/api";
import { configureAmplify } from "@/app/amplify-client";

interface ReactionCounts { clap?: number; laugh?: number; fire?: number; mindblown?: number }
export interface WinItem {
  winId: string;
  userId: string;
  title: string;
  note?: string | null;
  category: string;
  points: number;
  photoUrl?: string | null;
  createdAt: string;
  reactions?: ReactionCounts | null;
}

interface FeedPage { items: WinItem[]; nextToken: string | null }
interface FeedQueryResponse { feedToday: FeedPage }

const FEED_QUERY = /* GraphQL */ `
  query FeedToday($limit: Int, $nextToken: String) {
    feedToday(limit: $limit, nextToken: $nextToken) {
      items {
        winId
        userId
        title
        note
        category
        points
        photoUrl
        createdAt
        reactions { clap laugh fire mindblown }
      }
      nextToken
    }
  }
`;

export default function FeedPage() {
  configureAmplify();
  const router = useRouter();
  const [wins, setWins] = useState<WinItem[]>([]);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        await getCurrentUser();
      } catch {
        router.push("/auth/sign-in");
        return;
      }
      void loadFeed();
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadFeed(token?: string | null) {
    try {
      setError(null);
      if (token) setLoadingMore(true); else setLoading(true);
      const client = generateClient();
      const { data } = await client.graphql<{ data: FeedQueryResponse }>({ query: FEED_QUERY, variables: { limit: 10, nextToken: token ?? null } }) as unknown as { data: FeedQueryResponse };
      const page = data.feedToday;
      setWins((prev) => [...prev, ...(page.items || [])]);
      setNextToken(page.nextToken ?? null);
    } catch (err: unknown) {
      const msg = typeof err === 'object' && err && 'message' in err ? String((err as {message:string}).message) : 'Failed to load feed';
      setError(msg);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  const card: React.CSSProperties = {
    background: 'rgba(255,255,255,.06)',
    border: '1px solid rgba(255,255,255,.12)',
    borderRadius: 16,
    padding: 16
  };

  if (loading && wins.length === 0) {
    return <main style={{ padding: '24px 14px' }}><div style={card}>Loading feed…</div></main>;
  }

  return (
    <main style={{ padding: '24px 14px', maxWidth: 820, margin: '0 auto' }}>
      <h1 style={{ fontWeight: 900, fontSize: 28, margin: '8px 0 16px' }}>Today&apos;s Feed</h1>
      {error && <div style={{ ...card, borderColor: 'rgba(239,68,68,.4)', color: '#fecaca' }}>{error}</div>}

      <div style={{ display: 'grid', gap: 12 }}>
        {wins.map((win) => (
          <article key={win.winId} style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ fontSize: 13, opacity: .8 }}>{new Date(win.createdAt).toLocaleString()}</div>
              <div style={{ fontSize: 12, opacity: .7, textTransform: 'capitalize' }}>{win.category} · {win.points} pts</div>
            </div>
            <h3 style={{ margin: '4px 0 6px', fontSize: 18, fontWeight: 800 }}>{win.title}</h3>
            {win.note && <p style={{ margin: 0, opacity: .9 }}>{win.note}</p>}
            {win.reactions && (
              <div style={{ display: 'flex', gap: 12, marginTop: 10, opacity: .85, fontSize: 14 }}>
                <span>👏 {win.reactions.clap ?? 0}</span>
                <span>😂 {win.reactions.laugh ?? 0}</span>
                <span>🔥 {win.reactions.fire ?? 0}</span>
                <span>🤯 {win.reactions.mindblown ?? 0}</span>
              </div>
            )}
          </article>
        ))}
      </div>

      {nextToken && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
          <button onClick={() => loadFeed(nextToken)} disabled={loadingMore} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,.18)', background: 'rgba(255,255,255,.08)', color: 'white', fontWeight: 700 }}>
            {loadingMore ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}

      {!nextToken && wins.length === 0 && (
        <div style={{ ...card, marginTop: 16, textAlign: 'center', opacity: .85 }}>No wins yet today. Be the first to log one!</div>
      )}
    </main>
  );
}
