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
        router.push("/");
      } else if (res.nextStep.signInStep === "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED") {
        router.push("/auth/confirm");
      } else {
        router.push("/");
      }
    } catch (err: unknown) {
      const msg = typeof err === 'object' && err && 'message' in err ? String((err as {message:string}).message) : 'Failed to sign in';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 480, margin: "80px auto", padding: 24 }}>
      <h1 style={{ fontWeight: 800, fontSize: 28, marginBottom: 16 }}>Sign in</h1>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <input aria-label="Email" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} required style={{ padding: 12, borderRadius: 10, border: "1px solid #ddd" }} />
        <input aria-label="Password" type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} required style={{ padding: 12, borderRadius: 10, border: "1px solid #ddd" }} />
        {error && <p style={{ color: "#ef4444", fontSize: 14 }}>{error}</p>}
        <button disabled={loading} className="ctaPrimary" type="submit">{loading ? "Signing in..." : "Sign in"}</button>
        <button type="button" className="ctaSecondary" onClick={()=>router.push("/auth/sign-up")}>Create an account</button>
      </form>
    </main>
  );
}
