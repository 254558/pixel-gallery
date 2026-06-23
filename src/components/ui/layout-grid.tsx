"use client";
import React, { useState, useCallback } from "react";

type Card = {
  id: number;
  content: string;
  className: string;
  thumbnail: string;
};

export const LayoutGrid = ({ cards }: { cards: Card[] }) => {
  const [selected, setSelected] = useState<string | null>(null);

  const open = useCallback((src: string) => setSelected(src), []);
  const close = useCallback(() => setSelected(null), []);

  if (cards.length === 0) return null;

  return (
    <>
      <div className="w-full p-10 max-w-7xl mx-auto columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.id}
            className="block break-inside-avoid mb-4 cursor-pointer"
            onClick={() => open(card.thumbnail)}
          >
            <div className="relative overflow-hidden rounded-xl bg-white/5">
              <img
                src={card.thumbnail}
                alt=""
                className="w-full h-auto block"
                draggable={false}
              />
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black flex items-center justify-center cursor-pointer"
          onClick={close}
        >
          <img
            src={selected}
            alt=""
            className="max-w-[95vw] max-h-[95vh] object-contain"
            onClick={(e) => {
              e.stopPropagation();
              close();
            }}
          />
        </div>
      )}
    </>
  );
};
