"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function TokenAvatar({
  src,
  symbol,
  size = 28,
  className,
}: {
  src?: string;
  symbol: string;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold uppercase text-muted-foreground",
          className,
        )}
        style={{ height: size, width: size }}
        aria-hidden
      >
        {symbol.slice(0, 2)}
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt=""
      width={size}
      height={size}
      unoptimized
      onError={() => setFailed(true)}
      className={cn("shrink-0 rounded-full bg-muted object-cover", className)}
      style={{ height: size, width: size }}
    />
  );
}
