"use client";
import { useState } from "react";
import { signIn } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import { configureAmplify } from "@/app/amplify-client";

export default function SignInPage() {
  configureAmplify();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await signIn({ username: email, password });
      if (res.isSignedIn) {
        router.push("/me");
      } else if (res.nextStep.signInStep === "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED") {
        router.push("/auth/confirm");
      } else {
        router.push("/me");
      }
    } catch (err: unknown) {
      const msg = typeof err === 'object' && err && 'message' in err ? String((err as {message:string}).message) : 'Failed to sign in';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const cardStyle: React.CSSProperties = {
    maxWidth: 460,
    margin: '64px auto',
    padding: 22,
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
    color: 'white'
  };
  const primaryBtn: React.CSSProperties = {
    padding: '12px 14px', borderRadius: 12, fontWeight: 800,
    background: 'linear-gradient(180deg,#7C3AED 0%, #4F46E5 100%)', color: 'white', border: 'none'
  };
  const secondaryBtn: React.CSSProperties = {
    padding: '10px 14px', borderRadius: 12, fontWeight: 700,
    background: 'rgba(255,255,255,.08)', color: 'rgba(226,232,255,.9)', border: '1px solid rgba(255,255,255,.14)'
  };

  return (
    <main style={{ padding: '0 14px' }}>
      <section style={cardStyle}>
        <h1 style={{ fontWeight: 900, fontSize: 28, margin: '4px 0 14px' }}>Sign in</h1>
        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          <input aria-label="Email" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} required style={inputStyle} />
          <input aria-label="Password" type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} required style={inputStyle} />
          {error && <p style={{ color: '#FCA5A5', fontSize: 14 }}>{error}</p>}
          <button disabled={loading} style={primaryBtn} type="submit">{loading ? "Signing in..." : "Sign in"}</button>
          <button type="button" style={secondaryBtn} onClick={()=>router.push("/auth/sign-up")}>Create an account</button>
        </form>
      </section>
    </main>
  );
}
