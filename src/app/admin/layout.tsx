import type { Metadata } from "next";
import { eventConfig } from "@/config/event";
import "./admin.css";

export const metadata: Metadata = {
  title: `Lista de presença · ${eventConfig.displayName}`,
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin">{children}</div>;
}
