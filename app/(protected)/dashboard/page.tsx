"use client";

import { useAuth } from "@/lib/auth-context";
import {
  App,
  Page,
  Navbar,
  Block,
  BlockTitle,
  List,
  ListItem,
  Button,
  Card,
} from "konsta/react";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  const initials = user?.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <App theme="ios">
      <Page>
        <Navbar
          large
          transparent
          title="My Account"
          right={
            <button
              onClick={logout}
              className="text-primary text-[17px] font-normal"
            >
              Sign Out
            </button>
          }
        />

        {/* Avatar card */}
        <Block className="flex flex-col items-center gap-3 pt-4 pb-2">
          <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-semibold shadow-md">
            {initials}
          </div>
          <div className="text-center">
            <p className="text-xl font-semibold">{user?.name}</p>
            <p className="text-sm text-black/50 dark:text-white/50">
              {user?.email}
            </p>
          </div>
        </Block>

        {/* Profile info */}
        <BlockTitle>Profile</BlockTitle>
        <List inset strong>
          <ListItem
            title="Name"
            after={<span className="text-black/50 dark:text-white/50">{user?.name}</span>}
          />
          <ListItem
            title="Email"
            after={<span className="text-black/50 dark:text-white/50">{user?.email}</span>}
          />
        </List>

        {/* Account actions */}
        <BlockTitle>Account</BlockTitle>
        <List inset strong>
          <ListItem chevron title="Edit Profile" link onClick={() => {}} />
          <ListItem chevron title="Change Password" link onClick={() => {}} />
          <ListItem chevron title="Notifications" link onClick={() => {}} />
        </List>

        <Block className="mt-2">
          <Button large outline tonal onClick={logout}>
            Sign Out
          </Button>
        </Block>
      </Page>
    </App>
  );
}
