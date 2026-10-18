import { ImageResponse } from "next/og";
export const dynamic = "force-static";
export const alt = "Ahmad Aghazadeh — Senior Software Engineer. Backend systems and agentic engineering.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(<div style={{ background: "linear-gradient(115deg, #24304f, #2b4862, #255b63)", color: "#f3f6fc", width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "65px 75px", fontFamily: "sans-serif" }}><div style={{ display: "flex", fontSize: 22, color: "#cbddef", letterSpacing: "3px" }}>BACKEND SYSTEMS & AGENTIC ENGINEERING</div><div style={{ display: "flex", flexDirection: "column", gap: 16 }}><span style={{ fontSize: 36 }}>Senior Software Engineer</span><span style={{ color: "#b1ede6", fontSize: 86, lineHeight: 1.1, letterSpacing: "-3px" }}>Ahmad Aghazadeh</span></div><div style={{ display: "flex", fontSize: 22, color: "#d2e2f2", borderTop: "1px solid #c3dff044", paddingTop: 27 }}>14+ years of building · C# / .NET · Distributed systems</div></div>, size);
}
