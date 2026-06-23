"use client";
import React, { useState, useCallback } from "react";

type Card = {
  id: number;
  content: string;
  className: string;
  thumbnail: string;
};

export const LayoutGrid = ({
  cards,
  renderOverlay,
}: {
  cards: Card[];
  renderOverlay?: (card: Card) => React.ReactNode;
}) => {
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
            className="block break-inside-avoid mb-4 cursor-pointer group"
          >
            <div
              className="relative overflow-hidden rounded-xl bg-white/5"
              onClick={() => open(card.thumbnail)}
            >
              <img
                src={card.thumbnail}
                alt=""
                loading="lazy"
                className="w-full h-auto block"
                style={{ imageRendering: 'pixelated' }}
                draggable={false}
              />
              {/* overlay buttons (likes, favorites, comments) */}
              {renderOverlay && (
                <div
                  className="absolute bottom-0 left-0 right-0 p-2.5 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  {renderOverlay(card)}
                </div>
              )}
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
            className="max-w-[95vw] max-h-[95vh] w-[95vw] h-[95vh] object-contain"
            style={{ imageRendering: 'pixelated' }}
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
