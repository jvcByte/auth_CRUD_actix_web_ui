"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  App,
  Page,
  Navbar,
  Block,
  List,
  ListInput,
  Button,
  BlockTitle,
  BlockFooter,
} from "konsta/react";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <App theme="ios">
      <Page>
        <Navbar large transparent title="Welcome back" />

        <form onSubmit={handleSubmit}>
          <BlockTitle>Sign in to your account</BlockTitle>

          <List inset strong>
            <ListInput
              outline
              floatingLabel
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              required
              autoComplete="email"
              clearButton
              onClear={() => setEmail("")}
            />
            <ListInput
              outline
              floatingLabel
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              required
              autoComplete="current-password"
              error={error ?? undefined}
            />
          </List>

          <Block className="space-y-3">
            <Button type="submit" large raised disabled={loading}>
              {loading ? "Signing in…" : "Sign In"}
            </Button>
            <Button
              type="button"
              large
              outline
              component={Link}
              href="/register"
            >
              Create Account
            </Button>
          </Block>
        </form>

        <BlockFooter className="text-center">
          By continuing you agree to our Terms of Service.
        </BlockFooter>
      </Page>
    </App>
  );
}
