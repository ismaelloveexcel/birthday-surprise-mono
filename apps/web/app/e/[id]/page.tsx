import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import type { Metadata } from "next";
import type { StoredExperience } from "@birthday-surprise/shared";
import { ExperienceView } from "../../../components/ExperienceView";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getExperience(id: string): Promise<StoredExperience | null> {
  const { data, error } = await supabase
    .from("experiences")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !data) return null;
  // Supabase stores the JSON columns merged at top-level; re-shape for type safety
  const row = data as Record<string, unknown>;
  const output = row.output as StoredExperience["output"];
  return {
    id: row.id as string,
    created_at: row.created_at as string,
    output,
    unlocked: row.unlocked as boolean,
    recipient_name: row.recipient_name as string,
    relationship: row.relationship as string,
    vibe: row.vibe as StoredExperience["vibe"],
  };
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const experience = await getExperience(params.id);
  if (!experience) {
    return { title: "Birthday Surprise" };
  }
  const headline = experience.output.hero.headline;
  const sub = experience.output.hero.subheadline;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://yourdomain.com";
  const ogUrl = `${baseUrl}/e/${params.id}/opengraph-image`;

  return {
    title: headline,
    description: sub,
    openGraph: {
      title: headline,
      description: sub,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
      url: `${baseUrl}/e/${params.id}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: headline,
      description: sub,
      images: [ogUrl],
    },
  };
}

export default async function ExperiencePage({
  params,
}: {
  params: { id: string };
}) {
  const experience = await getExperience(params.id);
  if (!experience) notFound();

  const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/e/${params.id}`;
  return <ExperienceView experience={experience} shareUrl={shareUrl} />;
}
