"use client";
import { useState } from "react";
import { signUp, confirmSignUp, signIn, resendSignUpCode } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import { configureAmplify } from "@/app/amplify-client";

export default function SignUpPage() {
  configureAmplify();
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<"form"|"verify"|"done">("form");
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage("");
    try {
      await signUp({ 
        username: email, 
        password, 
        options: { 
          userAttributes: { 
            email,
            given_name: firstName,
            family_name: lastName
          } 
        } 
      });
      setStage("verify");
      setMessage(`We sent a 6‑digit code to ${email}. Check your inbox and spam.`);
    } catch (err: unknown) {
      const msg = typeof err === 'object' && err && 'message' in err ? String((err as {message:string}).message) : 'Could not create account';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function onVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage("");
    try {
      await confirmSignUp({ username: email, confirmationCode: code });
      // Explicit sign-in for a smooth handoff regardless of autoSignIn support
      await signIn({ username: email, password });
      setStage("done");
      setMessage("You're in! Taking you to your dashboard…");
      setTimeout(() => router.push("/me"), 600);
    } catch (err: unknown) {
      const msg = typeof err === 'object' && err && 'message' in err ? String((err as {message:string}).message) : 'Could not verify code';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function onResend() {
    setLoading(true);
    setError(null);
    try {
      await resendSignUpCode({ username: email });
      setMessage(`Sent a new code to ${email}.`);
    } catch (err: unknown) {
      const msg = typeof err === 'object' && err && 'message' in err ? String((err as {message:string}).message) : 'Could not resend code';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const cardStyle: React.CSSProperties = {
    maxWidth: 520,
    margin: '64px auto',
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
        <h1 style={{ fontWeight: 900, fontSize: 30, margin: '4px 0 14px' }}>{stage === "form" ? "Create your account" : stage === "verify" ? "Verify your email" : "Welcome!"}</h1>
        {message && <p style={{ color: '#c7d2fe', marginTop: 6 }}>{message}</p>}
        {stage === "form" && (
          <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <input aria-label="First name" type="text" placeholder="First name" value={firstName} onChange={e=>setFirstName(e.target.value)} required style={inputStyle} />
              <input aria-label="Last name" type="text" placeholder="Last name" value={lastName} onChange={e=>setLastName(e.target.value)} required style={inputStyle} />
            </div>
            <input aria-label="Email" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} required style={inputStyle} />
            <input aria-label="Password" type="password" placeholder="At least 8 characters" value={password} onChange={e=>setPassword(e.target.value)} required style={inputStyle} />
            {error && <p style={{ color: '#FCA5A5', fontSize: 14 }}>{error}</p>}
            <button disabled={loading} style={primaryBtn} type="submit">{loading ? "Creating..." : "Create account"}</button>
            <button type="button" style={secondaryBtn} onClick={()=>router.push("/auth/sign-in")}>I already have an account</button>
          </form>
        )}
        {stage === "verify" && (
          <form onSubmit={onVerify} style={{ display: 'grid', gap: 12 }}>
            <p style={{ opacity: .85 }}>Enter the 6‑digit code we sent to <b>{email}</b>.</p>
            <input aria-label="Verification code" maxLength={6} inputMode="numeric" placeholder="123456" value={code} onChange={e=>setCode(e.target.value)} required style={inputStyle} />
            {error && <p style={{ color: '#FCA5A5', fontSize: 14 }}>{error}</p>}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button disabled={loading} style={primaryBtn} type="submit">{loading ? "Verifying..." : "Verify & continue"}</button>
              <button type="button" style={secondaryBtn} onClick={onResend} disabled={loading}>Resend code</button>
            </div>
          </form>
        )}
        {stage === "done" && (
          <div style={{ display: 'grid', gap: 12 }}>
            <p>Signed in successfully. Redirecting to your dashboard…</p>
            <button style={primaryBtn} onClick={()=>router.push('/me')}>Go now</button>
          </div>
        )}
      </section>
    </main>
  );
}
