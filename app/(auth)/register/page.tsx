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
  BlockFooter,
} from "konsta/react";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(name, email, password);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <App theme="ios">
      <Page>
        <Navbar title="Create Account" />

        <form onSubmit={handleSubmit}>
          <List inset strong className="mt-8">
            <ListInput
              label="Name"
              type="text"
              placeholder="Alice"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setName(e.target.value)
              }
              required
              autoComplete="name"
            />
            <ListInput
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              required
              autoComplete="email"
            />
            <ListInput
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              required
              autoComplete="new-password"
            />
          </List>

          {error && (
            <BlockFooter>
              <span className="text-red-500">{error}</span>
            </BlockFooter>
          )}

          <Block>
            <Button type="submit" large disabled={loading}>
              {loading ? "Creating account…" : "Create Account"}
            </Button>
          </Block>
        </form>

        <BlockFooter className="text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-primary">
            Sign in
          </Link>
        </BlockFooter>
      </Page>
    </App>
  );
}
