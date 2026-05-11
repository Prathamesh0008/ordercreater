"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const photoFile = form.get("profilePhoto") as File | null;

    if (!photoFile || photoFile.size === 0) {
      setError("Profile photo is required");
      setLoading(false);
      return;
    }

    const photoDataUrl = await fileToDataUrl(photoFile);

    const payload = {
      name: String(form.get("name") || ""),
      email: String(form.get("email") || ""),
      password: String(form.get("password") || ""),
      whatsappNumber: String(form.get("whatsappNumber") || ""),
      profilePhoto: photoDataUrl,
    };

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.message || "Register failed");
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="auth-wrap">
      <form className="auth-card" onSubmit={onSubmit}>
        <h1>Create Account</h1>
        <input name="name" placeholder="Full name" required />
        <input name="email" type="email" placeholder="Email" required />
        <input name="password" type="password" placeholder="Password" minLength={6} required />
        <input name="whatsappNumber" placeholder="WhatsApp Number" required />
        <input name="profilePhoto" type="file" accept="image/*" required />
        {error ? <p className="error">{error}</p> : null}
        <button disabled={loading}>{loading ? "Creating..." : "Register"}</button>
        <p>
          Already have account? <Link href="/login">Login</Link>
        </p>
      </form>
    </main>
  );
}
