import { ImageResponse } from "@vercel/og";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";
export const alt = "Birthday Surprise";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: { id: string } }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data } = await supabase
    .from("experiences")
    .select("output, recipient_name")
    .eq("id", params.id)
    .single();

  const output = data?.output as
    | { hero: { headline: string; subheadline: string } }
    | undefined;

  const recipientName = (data?.recipient_name as string | undefined) ?? "";
  const headline = output?.hero?.headline ?? "A Birthday Surprise";
  const sub = output?.hero?.subheadline ?? "Made just for you";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #fce7f3 0%, #ffe4e6 40%, #fdf2f8 80%, #fff1f5 100%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "60px 80px",
        }}
      >
        {/* Recipient badge */}
        {recipientName && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "rgba(236, 72, 153, 0.1)",
              borderRadius: 999,
              padding: "8px 24px",
              marginBottom: 28,
              border: "1.5px solid rgba(236, 72, 153, 0.25)",
            }}
          >
            <span style={{ fontSize: 18, marginRight: 8 }}>🎂</span>
            <span
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: "#be185d",
                letterSpacing: "-0.01em",
              }}
            >
              For {recipientName}
            </span>
          </div>
        )}

        {/* Main headline */}
        <div
          style={{
            fontSize: 58,
            fontWeight: 800,
            textAlign: "center",
            color: "#831843",
            lineHeight: 1.08,
            marginBottom: 20,
            maxWidth: 960,
            letterSpacing: "-0.02em",
          }}
        >
          {headline}
        </div>

        {/* Subheadline */}
        <div
          style={{
            fontSize: 26,
            color: "#9d174d",
            textAlign: "center",
            maxWidth: 700,
            lineHeight: 1.4,
            opacity: 0.85,
          }}
        >
          {sub}
        </div>

        {/* Branding bar */}
        <div
          style={{
            position: "absolute",
            bottom: 44,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ fontSize: 20 }}>✨</span>
          <span
            style={{
              fontSize: 18,
              color: "#be185d",
              fontWeight: 600,
              opacity: 0.55,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            birthday-surprise.app
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
