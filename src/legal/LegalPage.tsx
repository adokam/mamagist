import { Link, useCanGoBack, useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";

const backClass =
  "-ml-2 inline-flex min-h-11 items-center gap-1 rounded-full pr-3 text-base font-bold text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

/** Simple legal text page with a back link. Open to everyone, no bottom bar. */
export function LegalPage({ title }: { title: string }) {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  return (
    <main className="page-shell min-h-dvh pb-10">
      {canGoBack ? (
        <button type="button" onClick={() => router.history.back()} className={backClass}>
          <ChevronLeft className="h-6 w-6" aria-hidden />
          Back
        </button>
      ) : (
        <Link to="/home" className={backClass}>
          <ChevronLeft className="h-6 w-6" aria-hidden />
          Back
        </Link>
      )}
      <div className="mt-4">
        <PageHeader title={title} />
      </div>
      <p className="mt-3 text-base leading-relaxed text-foreground">
        Draft. The final text will be added before launch.
      </p>
    </main>
  );
}
