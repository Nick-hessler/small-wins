"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateClient } from "aws-amplify/api";
import { configureAmplify } from "@/app/amplify-client";

const CREATE_WIN = /* GraphQL */ `
  mutation CreateWin($input: CreateWinInput!) {
    createWin(input: $input) {
      winId
      title
      category
      points
      createdAt
    }
  }
`;

export default function LogWinPage() {
  configureAmplify();
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    "work",
    "health",
    "learning",
    "relationships",
    "personal",
    "creative",
    "home",
    "other"
  ];

  function mapToSchemaCategory(local: string): string {
    // Map simple local names into schema Category values
    switch (local) {
      case "work": return "work";
      case "health": return "cozy"; // using cozy as wellness vibe
      case "learning": return "random";
      case "relationships": return "social";
      case "creative": return "petty";
      case "home": return "outdoors"; // closest available
      case "personal": return "random";
      default: return "random";
    }
  }

  function estimatePoints(text: string): number {
    const lengthBonus = Math.min(20, Math.floor(text.trim().length / 20));
    return 5 + lengthBonus; // simple heuristic
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim() || !category) return;
    setLoading(true);
    setError(null);
    try {
      const client = generateClient();
      const points = estimatePoints(description);
      const schemaCategory = mapToSchemaCategory(category);
      await client.graphql({
        query: CREATE_WIN,
        variables: { input: { title: description.trim(), note: null, category: schemaCategory, points } }
      });
      router.push("/feed");
    } catch (err: unknown) {
      const msg = typeof err === 'object' && err && 'message' in err ? String((err as {message:string}).message) : 'Failed to log win';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const cardStyle: React.CSSProperties = {
    maxWidth: 600,
    margin: '32px auto',
    padding: 24,
    borderRadius: 16,
    background: 'rgba(255,255,255,.06)',
    border: '1px solid rgba(255,255,255,.12)',
    backdropFilter: 'blur(8px)'
  };
  
  const inputStyle: React.CSSProperties = {
    padding: 12,
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,.18)',
    background: 'rgba(0,0,0,.2)',
    color: 'white',
    width: '100%'
  };
  
  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: 120,
    resize: 'vertical',
    fontFamily: 'inherit'
  };
  
  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    cursor: 'pointer'
  };
  
  const primaryBtn: React.CSSProperties = {
    padding: '14px 20px',
    borderRadius: 12,
    fontWeight: 800,
    background: 'linear-gradient(180deg,#7C3AED 0%, #4F46E5 100%)',
    color: 'white',
    border: 'none',
    fontSize: 16,
    cursor: 'pointer',
    width: '100%'
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
    <main style={{ padding: '0 14px' }}>
      <section style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontWeight: 900, fontSize: 32, margin: '0 0 8px', background: 'linear-gradient(180deg,#E0E7FF 0%,#C7D2FE 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            🎯 Log a Win
          </h1>
          <p style={{ fontSize: 18, opacity: 0.8, margin: 0 }}>
            Celebrate your progress, no matter how small
          </p>
        </div>

        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 20 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 16 }}>
              What did you accomplish today? *
            </label>
            <textarea
              aria-label="Win description"
              placeholder="Describe your win... (e.g., 'Finally finished that project proposal', 'Went for a 30-minute walk', 'Called my mom')"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              style={textareaStyle}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 16 }}>
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              style={selectStyle}
            >
              <option value="">Choose a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {error && <p style={{ color: '#FCA5A5', fontSize: 14 }}>{error}</p>}

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button 
              disabled={loading || !description.trim() || !category} 
              style={primaryBtn} 
              type="submit"
            >
              {loading ? "Logging..." : "🎉 Log This Win!"}
            </button>
            <button 
              type="button" 
              style={secondaryBtn} 
              onClick={() => router.push("/me")}
            >
              Cancel
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
