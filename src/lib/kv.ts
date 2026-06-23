import { kv } from "@vercel/kv";

export type Comment = {
  id: string;
  author: string;
  text: string;
  createdAt: string;
};

export type ImageMeta = {
  likes: number;
  likedBy: string[];
  favorites: number;
  favoritedBy: string[];
  comments: Comment[];
};

const DEFAULT_META: ImageMeta = {
  likes: 0,
  likedBy: [],
  favorites: 0,
  favoritedBy: [],
  comments: [],
};

function metaKey(file: string): string {
  return `meta:${file}`;
}

export async function getMeta(file: string): Promise<ImageMeta> {
  try {
    const data = await kv.get<ImageMeta>(metaKey(file));
    return data ?? { ...DEFAULT_META };
  } catch {
    return { ...DEFAULT_META };
  }
}

export async function setMeta(file: string, meta: ImageMeta): Promise<void> {
  await kv.set(metaKey(file), meta);
}
