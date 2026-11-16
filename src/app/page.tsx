import { Suspense } from "react";
import LivePage from "@/components/LivePage";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <Suspense>
      <LivePage />
    </Suspense>
  );
}
