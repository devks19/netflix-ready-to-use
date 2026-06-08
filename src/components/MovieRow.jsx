import React, { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MovieCard from "./MovieCard";

export default function MovieRow({ title, movies, onPlay, onOpenDetail, myList, onToggleMyList, onRemoveFromContinueWatching }) {
  const rowRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleScroll = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setShowLeftArrow(scrollLeft > 5);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  useEffect(() => {
    const rowEl = rowRef.current;
    if (rowEl) {
      rowEl.addEventListener("scroll", handleScroll);
      // Run once initially
      handleScroll();
    }
    return () => {
      if (rowEl) {
        rowEl.removeEventListener("scroll", handleScroll);
      }
    };
  }, [movies]);

  const slide = (direction) => {
    if (rowRef.current) {
      const { clientWidth, scrollLeft } = rowRef.current;
      // Scroll by 75% of view screen width
      const scrollAmount = clientWidth * 0.75;
      const targetScroll = direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
      
      rowRef.current.scrollTo({
        left: targetScroll,
        behavior: "smooth",
      });
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <div className="relative space-y-2 md:space-y-4 px-4 md:px-12 select-none group">
      {/* Title */}
      <h2 className="text-white text-base sm:text-xl md:text-2xl font-bold tracking-wide hover:text-gray-300 transition duration-300">
        {title}
      </h2>

      {/* Outer wrapper */}
      <div className="relative">
        {/* Left Scroll Arrow */}
        {showLeftArrow && (
          <button
            onClick={() => slide("left")}
            className="absolute left-0 top-0 bottom-0 z-30 w-10 md:w-12 bg-black/60 text-white flex items-center justify-center border-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/80 cursor-pointer"
          >
            <ChevronLeft size={30} className="hover:scale-125 transition-transform duration-200" />
          </button>
        )}

        {/* Horizontal Slider Frame */}
        <div
          ref={rowRef}
          onScroll={handleScroll}
          className="flex gap-2.5 overflow-x-auto py-20 -my-16 px-1 no-scrollbar scroll-smooth"
        >
          {movies.map((movie, index) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onPlay={onPlay}
              onOpenDetail={onOpenDetail}
              myList={myList}
              onToggleMyList={onToggleMyList}
              isFirst={index === 0}
              isLast={index === movies.length - 1}
              onRemoveFromContinueWatching={onRemoveFromContinueWatching}
            />
          ))}
        </div>

        {/* Right Scroll Arrow */}
        {showRightArrow && (
          <button
            onClick={() => slide("right")}
            className="absolute right-0 top-0 bottom-0 z-30 w-10 md:w-12 bg-black/60 text-white flex items-center justify-center border-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/80 cursor-pointer"
          >
            <ChevronRight size={30} className="hover:scale-125 transition-transform duration-200" />
          </button>
        )}
      </div>
    </div>
  );
}
