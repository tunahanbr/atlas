import { ImageResponse } from "next/og";

import { getProjectBySlug } from "@/server/queries";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage({ params }: { params: Promise<{ username: string; slug: string }> }) {
  const { username, slug } = await params;
  const project = await getProjectBySlug(username, slug);
  const owner = project?.profile.user.name ?? project?.profile.username ?? username;
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#171714", color: "#f2eee7", padding: "72px 82px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, color: "#aaa69d" }}><span>Selected work</span><span>{project?.year ?? "Atlas"}</span></div>
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 980 }}><div style={{ fontSize: 76, lineHeight: 1, letterSpacing: "-3px" }}>{project?.title ?? "Case study"}</div><div style={{ marginTop: 26, fontSize: 28, lineHeight: 1.4, color: "#bbb7af" }}>{project?.summary ?? "A project published with Atlas."}</div></div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 20 }}><span style={{ width: 10, height: 10, background: "#f2eee7", transform: "rotate(45deg)" }} />{owner}</div>
    </div>, size,
  );
}
