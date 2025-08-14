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

  return (
    <main style={{ maxWidth: 480, margin: "80px auto", padding: 24 }}>
      <h1 style={{ fontWeight: 800, fontSize: 28, marginBottom: 16 }}>{stage === "form" ? "Create your account" : "Verify your email"}</h1>
      {stage === "form" ? (
        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          <input aria-label="Email" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} required style={{ padding: 12, borderRadius: 10, border: "1px solid #ddd" }} />
          <input aria-label="Password" type="password" placeholder="At least 8 characters" value={password} onChange={e=>setPassword(e.target.value)} required style={{ padding: 12, borderRadius: 10, border: "1px solid #ddd" }} />
          {error && <p style={{ color: "#ef4444", fontSize: 14 }}>{error}</p>}
          <button disabled={loading} className="ctaPrimary" type="submit">{loading ? "Creating..." : "Create account"}</button>
          <button type="button" className="ctaSecondary" onClick={()=>router.push("/auth/sign-in")}>I already have an account</button>
        </form>
      ) : (
        <form onSubmit={onVerify} style={{ display: "grid", gap: 12 }}>
          <p>We sent a 6-digit code to <b>{email}</b>. Enter it below.</p>
          <input aria-label="Verification code" maxLength={6} inputMode="numeric" placeholder="123456" value={code} onChange={e=>setCode(e.target.value)} required style={{ padding: 12, borderRadius: 10, border: "1px solid #ddd" }} />
          {error && <p style={{ color: "#ef4444", fontSize: 14 }}>{error}</p>}
          <button disabled={loading} className="ctaPrimary" type="submit">{loading ? "Verifying..." : "Verify & continue"}</button>
        </form>
      )}
    </main>
  );
}
