import { Suspense } from "react";
import MatchPage from "@/components/MatchPage";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <Suspense>
      <MatchPage slug={slug} />
    </Suspense>
  );
}
