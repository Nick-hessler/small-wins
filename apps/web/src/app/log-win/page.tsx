"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { configureAmplify } from "@/app/amplify-client";

export default function LogWinPage() {
  configureAmplify();
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const categories = [
    "Work & Career",
    "Health & Fitness", 
    "Learning & Growth",
    "Relationships",
    "Personal Goals",
    "Creative Projects",
    "Home & Organization",
    "Other"
  ];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim() || !category) return;
    
    setLoading(true);
    try {
      // TODO: Call GraphQL mutation to create win
      console.log("Logging win:", { description, category });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to dashboard with success
      router.push("/me?win=logged");
    } catch (err) {
      console.error("Failed to log win:", err);
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
