"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (!result?.ok) {
        setError(result?.error || "Invalid credentials");
        return;
      }

      router.push("/feed");
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div 
          className="rounded-lg p-8 border"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-color)',
          }}
        >
          <h1 className="mb-2 text-center text-3xl font-bold">
            Fibeger
          </h1>
          <h2 className="mb-6 text-center text-lg font-semibold" style={{ color: 'var(--text-secondary)' }}>
            Sign In
          </h2>

          {error && (
            <div 
              className="mb-4 rounded-md p-3 text-sm border"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-secondary)',
              }}
              role="alert"
              aria-live="polite"
            >
              <strong>Error:</strong> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium mb-2"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg px-4 py-2 border transition-all"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                }}
                placeholder="Enter your username"
                disabled={loading}
                required
                aria-required="true"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg px-4 py-2 border transition-all"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                }}
                placeholder="Enter your password"
                disabled={loading}
                required
                aria-required="true"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg py-2 text-white font-medium transition-all focus:outline-2 focus:outline-offset-2"
              style={{
                backgroundColor: 'var(--accent)',
                outlineColor: 'var(--accent)',
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            Don't have an account?{" "}
            <Link
              href="/auth/signup"
              className="font-semibold hover:opacity-80 transition-all"
              style={{ color: 'var(--text-primary)' }}
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
