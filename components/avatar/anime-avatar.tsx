"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Use DiceBear's free avatar API with various anime styles
const STYLES = ["adventurer-neutral", "bottts-neutral", "fun-emoji", "thumbs", "lorelei-neutral", "notionists-neutral", "pixel-art-neutral"];
const SEEDS = ["Mango", "Sakura", "Riko", "Haru", "Yuki", "Sora", "Ren", "Aoi", "Natsu", "Fuyu", "Hana", "Kai"];

function randomFrom<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function avatarUrl(userId?: string): string {
  const seed = userId ?? randomFrom(SEEDS);
  const style = randomFrom(STYLES);
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
}

interface Props {
  userId?: string;
  size?: number;
  className?: string;
}

export function AnimeAvatar({ userId, size = 48, className }: Props) {
  const [url, setUrl] = React.useState("");

  React.useEffect(() => {
    setUrl(avatarUrl(userId));
  }, [userId]);

  return (
    <div
      className={cn("rounded-2xl overflow-hidden shrink-0 bg-bg-muted", className)}
      style={{ width: size, height: size }}
    >
      {url ? (
        <img src={url} alt="avatar" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-fg-subtle/80">
          🥭
        </div>
      )}
    </div>
  );
}

export { avatarUrl, SEEDS };
