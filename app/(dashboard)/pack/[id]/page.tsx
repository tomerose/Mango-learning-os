"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function PackDetailRedirect() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    router.replace(`/pack?open=${id}`);
  }, [id, router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="size-6 text-primary animate-spin" />
    </div>
  );
}
