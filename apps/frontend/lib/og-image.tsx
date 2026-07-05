import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

interface OgImageProps {
  title: string;
  description: string;
  tag: string;
  accent?: string;
}

export function generateOgImage({ title, description, tag, accent = "#10b981" }: OgImageProps) {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#07090e",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px 100px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `linear-gradient(${accent}08 1px, transparent 1px), linear-gradient(90deg, ${accent}08 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Glow */}
        <div
          style={{
            position: "absolute",
            top: -150,
            right: -150,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${accent}20 0%, transparent 70%)`,
          }}
        />

        {/* DevForge wordmark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 48,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: `linear-gradient(135deg, ${accent} 0%, #14b8a6 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#030712" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
            </svg>
          </div>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 18, fontWeight: 600, letterSpacing: "1px" }}>
            DevForge
          </span>
          <div
            style={{
              background: `${accent}18`,
              border: `1px solid ${accent}40`,
              borderRadius: 4,
              padding: "2px 8px",
              color: accent,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "2px",
              textTransform: "uppercase",
            }}
          >
            {tag}
          </div>
        </div>

        {/* Main title */}
        <div
          style={{
            fontSize: 80,
            fontWeight: 900,
            color: "white",
            lineHeight: 1,
            marginBottom: 24,
            letterSpacing: "-3px",
          }}
        >
          {title}
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: 26,
            color: "rgba(255,255,255,0.45)",
            lineHeight: 1.5,
            maxWidth: 750,
          }}
        >
          {description}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, ${accent} 0%, #14b8a6 50%, transparent 100%)`,
          }}
        />
      </div>
    ),
    { ...OG_SIZE }
  );
}
