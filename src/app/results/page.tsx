import { Suspense } from "react";
import ResultsPage from "@/components/ResultsPage";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense>
      <ResultsPage />
    </Suspense>
  );
}
