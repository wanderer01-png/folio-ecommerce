"use client";

import ePub, { type Rendition } from "epubjs";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

export function EpubViewer({ url, title }: { url: string; title: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const renditionRef = useRef<Rendition | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    const book = ePub(url);
    const rendition = book.renderTo(containerRef.current, {
      width: "100%",
      height: "100%",
    });
    renditionRef.current = rendition;

    rendition.display().then(() => setIsLoading(false));

    return () => {
      book.destroy();
    };
  }, [url]);

  return (
    <div className="flex flex-col gap-2">
      <div
        ref={containerRef}
        aria-label={title}
        className="h-[calc(100vh-16rem)] w-full rounded-lg border"
      />
      {isLoading && (
        <p className="text-muted-foreground text-center text-sm">Loading…</p>
      )}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="icon"
          aria-label="Previous page"
          onClick={() => renditionRef.current?.prev()}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label="Next page"
          onClick={() => renditionRef.current?.next()}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
