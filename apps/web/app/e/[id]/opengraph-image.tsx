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
    .select("output")
    .eq("id", params.id)
    .single();

  const output = data?.output as
    | { hero: { headline: string; subheadline: string } }
    | undefined;
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
          background: "linear-gradient(135deg, #fce7f3 0%, #ffe4e6 50%, #fdf2f8 100%)",
          fontFamily: "system-ui, sans-serif",
          padding: 60,
        }}
      >
        <div style={{ fontSize: 72, marginBottom: 24 }}>🎂</div>
        <div
          style={{
            fontSize: 52,
            fontWeight: 800,
            textAlign: "center",
            color: "#831843",
            lineHeight: 1.1,
            marginBottom: 20,
            maxWidth: 900,
          }}
        >
          {headline}
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#9d174d",
            textAlign: "center",
            maxWidth: 700,
          }}
        >
          {sub}
        </div>
        <div
          style={{
            marginTop: 48,
            fontSize: 20,
            color: "#be185d",
            opacity: 0.6,
          }}
        >
          birthday-surprise.app
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
