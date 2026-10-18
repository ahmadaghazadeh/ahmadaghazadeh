import { ImageResponse } from "next/og";

export const alt = "Ahmad Aghazadeh — Scalable systems. Thoughtful software.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(<div style={{ background: "#171a17", color: "#efefe8", width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "65px 75px", fontFamily: "sans-serif" }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 22 }}><span>AHMAD AGHAZADEH</span><span style={{ color: "#c6ed83" }}>SENIOR SOFTWARE ENGINEER</span></div><div style={{ display: "flex", flexDirection: "column", fontSize: 83, lineHeight: 1.05, letterSpacing: "-4px" }}><span>Scalable systems.</span><span style={{ color: "#c6ed83" }}>Thoughtful software.</span></div><div style={{ display: "flex", fontSize: 21, color: "#a5ad9e", borderTop: "1px solid #3b4238", paddingTop: 25 }}>14+ years of building · C# / .NET · Distributed systems</div></div>, size);
}
