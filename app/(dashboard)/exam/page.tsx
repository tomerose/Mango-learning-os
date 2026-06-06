"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * V11: /exam redirects to /pack.
 * The Study Pack experience is now at /pack.
 */
export default function ExamRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/pack");
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <Loader2 className="size-6 text-primary animate-spin" />
      <p className="text-sm text-fg-muted">正在跳转到学习包…</p>
    </div>
  );
}
