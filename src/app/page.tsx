"use client";

import { LayoutGrid } from "@/components/ui/layout-grid";
import { DotmSquare17 } from "@/components/ui/dotm-square-17";
import { useCallback, useEffect, useRef, useState } from "react";
import CommentPanel from "@/components/CommentPanel";

const IMAGE_EXTS = [".png", ".jpg", ".jpeg", ".webp", ".gif"];
const PAGE_SIZE = 20;

type ImageItem = {
  name: string;
  url: string;
};

type Card = {
  id: number;
  content: string;
  className: string;
  thumbnail: string;
};

type ImageMeta = {
  likes: number;
  favorites: number;
  comments: { id: string; author: string; text: string; createdAt: string }[];
  likedBy: string[];
  favoritedBy: string[];
};

function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("visitor_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("visitor_id", id);
  }
  return id;
}

export default function Home() {
  const [allCards, setAllCards] = useState<Card[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [uploading, setUploading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  // key=filename, value=meta
  const [metaMap, setMetaMap] = useState<Record<string, ImageMeta>>({});
  const [commentFile, setCommentFile] = useState<string | null>(null);
  const visitorId = useRef("");

  useEffect(() => {
    visitorId.current = getVisitorId();
  }, []);

  const visibleCards = allCards.slice(0, visibleCount);
  const hasMore = visibleCount < allCards.length;

  const loadMeta = useCallback(async (file: string) => {
    try {
      const res = await fetch(`/api/meta/${encodeURIComponent(file)}`);
      if (!res.ok) return;
      const data = await res.json();
      setMetaMap((prev) => ({ ...prev, [file]: data }));
    } catch {
      // ignore
    }
  }, []);

  const loadImages = useCallback(() => {
    fetch("/api/images")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data: { images: ImageItem[] }) => {
        const imgs = data.images.filter((item) =>
          IMAGE_EXTS.some((ext) => item.name.toLowerCase().endsWith(ext))
        );
        const cards = imgs.map((item, i) => ({
          id: i + 1,
          content: item.name,
          className: "",
          thumbnail: item.url,
        }));
        setAllCards(cards);
        setLoaded(true);
        // load meta for visible cards
        cards.slice(0, PAGE_SIZE).forEach((c) => loadMeta(c.content));
      })
      .catch(() => {
        setAllCards([]);
        setLoaded(true);
      });
  }, [loadMeta]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  // load meta for newly visible cards
  useEffect(() => {
    visibleCards.forEach((c) => {
      if (!metaMap[c.content]) {
        loadMeta(c.content);
      }
    });
  }, [visibleCards, loadMeta, metaMap]);

  // Intersection Observer
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, allCards.length));
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, allCards.length]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        loadImages();
      } else {
        alert(data.error || "上传失败");
      }
    } catch {
      alert("上传失败");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const toggleLike = async (file: string) => {
    const res = await fetch(`/api/meta/${encodeURIComponent(file)}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorId: visitorId.current }),
    });
    const data = await res.json();
    if (data.likes !== undefined) {
      setMetaMap((prev) => {
        const cur = prev[file];
        if (!cur) return prev;
        return {
          ...prev,
          [file]: {
            ...cur,
            likes: data.likes,
            likedBy: data.liked
              ? [...cur.likedBy, visitorId.current]
              : cur.likedBy.filter((id) => id !== visitorId.current),
          },
        };
      });
    }
  };

  const toggleFavorite = async (file: string) => {
    const res = await fetch(`/api/meta/${encodeURIComponent(file)}/favorite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorId: visitorId.current }),
    });
    const data = await res.json();
    if (data.favorites !== undefined) {
      setMetaMap((prev) => {
        const cur = prev[file];
        if (!cur) return prev;
        return {
          ...prev,
          [file]: {
            ...cur,
            favorites: data.favorites,
            favoritedBy: data.favorited
              ? [...cur.favoritedBy, visitorId.current]
              : cur.favoritedBy.filter((id) => id !== visitorId.current),
          },
        };
      });
    }
  };

  const renderOverlay = (card: Card) => {
    const meta = metaMap[card.content];
    const liked = meta?.likedBy?.includes(visitorId.current) ?? false;
    const favorited = meta?.favoritedBy?.includes(visitorId.current) ?? false;

    return (
      <>
        {/* like button */}
        <button
          className="flex items-center gap-1 bg-black/50 backdrop-blur-sm text-xs px-2 py-1 rounded-lg hover:bg-black/70 transition-colors"
          onClick={() => toggleLike(card.content)}
        >
          <img
            src="/sp.png"
            alt="like"
            width={14}
            height={14}
            className={liked ? "brightness-0 invert" : "opacity-60"}
            style={{ filter: liked ? "none" : "grayscale(1)" }}
          />
          <span className="text-white/80">{meta?.likes ?? 0}</span>
        </button>

        {/* favorite button */}
        <button
          className="flex items-center gap-1 bg-black/50 backdrop-blur-sm text-xs px-2 py-1 rounded-lg hover:bg-black/70 transition-colors"
          onClick={() => toggleFavorite(card.content)}
        >
          <img
            src="/potd.png"
            alt="favorite"
            width={14}
            height={14}
            className={favorited ? "" : "opacity-60"}
            style={{ filter: favorited ? "none" : "grayscale(1)" }}
          />
          <span className="text-white/80">{meta?.favorites ?? 0}</span>
        </button>

        {/* comment button */}
        <button
          className="flex items-center gap-1 bg-black/50 backdrop-blur-sm text-xs px-2 py-1 rounded-lg hover:bg-black/70 transition-colors ml-auto"
          onClick={() => setCommentFile(card.content)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-white/60">
            <path d="M3.505 2.365A41.369 41.369 0 019 2c1.863 0 3.697.124 5.495.365 1.247.167 2.18 1.108 2.435 2.268a4.45 4.45 0 00-.577-.069 43.141 43.141 0 00-4.706 0C9.229 4.696 7.5 6.727 7.5 8.906v1.038c0 1.063.278 2.056.798 2.915l-3.243 1.621a.75.75 0 01-1.069-.684V4.74a2.75 2.75 0 012.75-2.75h.005z" />
            <path d="M18.495 5.119a2.764 2.764 0 00-1.29-1.201 42.143 42.143 0 00-4.189-.404 43.059 43.059 0 00-4.706 0c-1.2.097-2.15.81-2.524 1.752l.008-.026A1.86 1.86 0 017 5.535V7.51c0 .27.022.537.064.797.072.45.21.877.394 1.267l-.01-.027a3.66 3.66 0 01.197-.38c.42-.724 1.24-1.211 2.172-1.314 1.163-.13 2.342-.164 3.493-.125 1.364.046 2.61.318 3.72.783l.125.048a2.271 2.271 0 00.502-.137l.027-.01c.446-.198.849-.484 1.184-.843.162-.174.313-.36.449-.56.42-.624.684-1.364.727-2.163l.001-.053a.595.595 0 00.002-.054V5.25c0-.044-.002-.088-.005-.131z" />
          </svg>
          <span className="text-white/80">{meta?.comments?.length ?? 0}</span>
        </button>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-black">
      {/* upload button */}
      <div className="fixed top-4 right-4 z-40">
        <label className="inline-flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-sm px-4 py-2 rounded-lg cursor-pointer transition-colors">
          {uploading ? (
            <span>上传中...</span>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path d="M9.25 13.25a.75.75 0 001.5 0V4.636l2.955 3.129a.75.75 0 001.09-1.03l-4.25-4.5a.75.75 0 00-1.09 0l-4.25 4.5a.75.75 0 101.09 1.03L9.25 4.636V13.25z" />
                <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
              </svg>
              上传
            </>
          )}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {!loaded ? (
        <div className="min-h-screen flex items-center justify-center">
          <DotmSquare17 size={24} dotSize={3} speed={1} className="text-zinc-400" />
        </div>
      ) : visibleCards.length === 0 ? (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-400">暂无图片</p>
        </div>
      ) : (
        <div className="pt-12">
          <LayoutGrid cards={visibleCards} renderOverlay={renderOverlay} />
          {hasMore && (
            <div ref={sentinelRef} className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-zinc-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      )}

      {/* comment panel */}
      {commentFile && (
        <CommentPanel
          file={commentFile}
          comments={metaMap[commentFile]?.comments ?? []}
          onClose={() => {
            setCommentFile(null);
            loadMeta(commentFile);
          }}
        />
      )}
    </div>
  );
}
