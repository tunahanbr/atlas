import { ImageResponse } from "next/og";

import { getProfileByUsername } from "@/server/queries";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  const name = profile?.user.name ?? profile?.username ?? "Atlas profile";
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#f2eee7", color: "#171714", padding: "72px 82px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 24 }}><span style={{ width: 12, height: 12, background: "#171714", transform: "rotate(45deg)" }} />Atlas</div>
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 930 }}>
        <div style={{ fontSize: 78, lineHeight: 1.02, letterSpacing: "-3px" }}>{name}</div>
        {profile?.headline ? <div style={{ marginTop: 24, fontSize: 30, lineHeight: 1.35, color: "#656158" }}>{profile.headline}</div> : null}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20, color: "#79746a" }}><span>{profile?.location ?? "Independent professional"}</span><span>atlas.rocks/{profile?.username ?? username}</span></div>
    </div>, size,
  );
}
