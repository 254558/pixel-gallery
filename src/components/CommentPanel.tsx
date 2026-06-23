"use client";

import { useState } from "react";

type Comment = {
  id: string;
  author: string;
  text: string;
  createdAt: string;
};

export default function CommentPanel({
  file,
  comments,
  onClose,
}: {
  file: string;
  comments: Comment[];
  onClose: () => void;
}) {
  const [author, setAuthor] = useState("");
  const [text, setText] = useState("");
  const [list, setList] = useState(comments);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/meta/${encodeURIComponent(file)}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author: author.trim() || "匿名", text: text.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setList((prev) => [...prev, data.comment]);
        setText("");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-full sm:max-w-md max-h-[70vh] bg-zinc-900 rounded-t-3xl sm:rounded-3xl border border-zinc-800 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h3 className="text-white text-sm font-medium">评论</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white text-lg leading-none">&times;</button>
        </div>

        {/* comment list */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3 min-h-0">
          {list.length === 0 ? (
            <p className="text-zinc-500 text-sm text-center py-8">暂无评论</p>
          ) : (
            list.map((c) => (
              <div key={c.id} className="text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-300 font-medium">{c.author}</span>
                  <span className="text-zinc-600 text-xs">
                    {new Date(c.createdAt).toLocaleString("zh-CN")}
                  </span>
                </div>
                <p className="text-zinc-400 mt-0.5">{c.text}</p>
              </div>
            ))
          )}
        </div>

        {/* input area */}
        <div className="px-5 py-3 border-t border-zinc-800 flex flex-col gap-2">
          <input
            type="text"
            placeholder="昵称（可选）"
            className="bg-zinc-800 text-white text-sm px-3 py-1.5 rounded-lg border border-zinc-700 focus:border-zinc-500 focus:outline-none"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="说点什么…"
              className="flex-1 bg-zinc-800 text-white text-sm px-3 py-2 rounded-lg border border-zinc-700 focus:border-zinc-500 focus:outline-none"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !submitting && handleSubmit()}
            />
            <button
              className="bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-zinc-200 disabled:opacity-50 transition-colors"
              onClick={handleSubmit}
              disabled={submitting || !text.trim()}
            >
              发送
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
