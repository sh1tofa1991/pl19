import { Suspense } from "react";
import WalletsPage from "@/components/WalletsPage";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense>
      <WalletsPage />
    </Suspense>
  );
}
