"use client";
import { useState } from "react";
import { signUp, confirmSignUp, autoSignIn } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import { configureAmplify } from "@/app/amplify-client";

export default function SignUpPage() {
  configureAmplify();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<"form"|"verify">("form");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signUp({ username: email, password, options: { userAttributes: { email } } });
      setStage("verify");
    } catch (err: unknown) {
      const msg = typeof err === 'object' && err && 'message' in err ? String((err as {message:string}).message) : 'Failed to sign up';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function onVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await confirmSignUp({ username: email, confirmationCode: code });
      await autoSignIn();
      router.push("/");
    } catch (err: unknown) {
      const msg = typeof err === 'object' && err && 'message' in err ? String((err as {message:string}).message) : 'Failed to verify code';
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
        <h1 style={{ fontWeight: 900, fontSize: 28, margin: '4px 0 14px' }}>{stage === "form" ? "Create your account" : "Verify your email"}</h1>
        {stage === "form" ? (
          <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
            <input aria-label="Email" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} required style={inputStyle} />
            <input aria-label="Password" type="password" placeholder="At least 8 characters" value={password} onChange={e=>setPassword(e.target.value)} required style={inputStyle} />
            {error && <p style={{ color: '#FCA5A5', fontSize: 14 }}>{error}</p>}
            <button disabled={loading} style={primaryBtn} type="submit">{loading ? "Creating..." : "Create account"}</button>
            <button type="button" style={secondaryBtn} onClick={()=>router.push("/auth/sign-in")}>I already have an account</button>
          </form>
        ) : (
          <form onSubmit={onVerify} style={{ display: 'grid', gap: 12 }}>
            <p style={{ opacity: .85 }}>We sent a 6‑digit code to <b>{email}</b>. Enter it below.</p>
            <input aria-label="Verification code" maxLength={6} inputMode="numeric" placeholder="123456" value={code} onChange={e=>setCode(e.target.value)} required style={inputStyle} />
            {error && <p style={{ color: '#FCA5A5', fontSize: 14 }}>{error}</p>}
            <button disabled={loading} style={primaryBtn} type="submit">{loading ? "Verifying..." : "Verify & continue"}</button>
          </form>
        )}
      </section>
    </main>
  );
}
