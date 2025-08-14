"use client";
import { useEffect, useState } from "react";
import { getCurrentUser } from "aws-amplify/auth";
import Link from "next/link";
import { configureAmplify } from "@/app/amplify-client";

export default function MePage() {
  configureAmplify();
  const [email, setEmail] = useState<string | null>(null);
  useEffect(() => {
    getCurrentUser().then(u => setEmail(u.signInDetails?.loginId ?? ""))
      .catch(() => setEmail(null));
  }, []);

  return (
    <main style={{ maxWidth: 800, margin: "40px auto", padding: 24 }}>
      <h1 style={{ fontWeight: 800, fontSize: 28, marginBottom: 8 }}>Welcome{email ? `, ${email}` : "!"}</h1>
      <p style={{ opacity: .8, marginBottom: 20 }}>You&apos;re signed in. Head back to the homepage to start logging wins.</p>
      <Link href="/" className="ctaPrimary">Go to homepage</Link>
    </main>
  );
}
