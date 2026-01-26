"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

export function Providers({ children }: { children: ReactNode }) {
  if (!convexUrl) {
    return (
      <div style={{ padding: "2rem", fontFamily: "system-ui" }}>
        <h1>Convex Not Configured</h1>
        <p>Missing <code>NEXT_PUBLIC_CONVEX_URL</code> environment variable.</p>
        <h2>Setup Steps:</h2>
        <ol>
          <li>Run <code>cd packages/backend && bunx convex dev</code></li>
          <li>Copy the deployment URL from the output</li>
          <li>Create <code>.env.local</code> at the repo root with:
            <pre style={{ background: "#f5f5f5", padding: "1rem", marginTop: "0.5rem" }}>
              NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
            </pre>
          </li>
          <li>Restart the dev server</li>
        </ol>
      </div>
    );
  }

  const convex = new ConvexReactClient(convexUrl);
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
