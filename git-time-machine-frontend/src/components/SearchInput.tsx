import { useMemo, useState, useEffect, useRef, ReactNode } from 'react';

interface SearchInputProps<T> {
  items: T[];
  onSelect: (item: T) => void;
  filterFn: (item: T, query: string) => boolean;
  renderItem: (item: T) => ReactNode;
  placeholder: string;
  dropdownDirection?: 'up' | 'down';
  maxResults?: number;
}

export const SearchInput = <T,>({
  items,
  onSelect,
  filterFn,
  renderItem,
  placeholder,
  dropdownDirection = 'down',
  maxResults = 8,
}: SearchInputProps<T>) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside the component
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter items based on the provided logic
  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return items
      .filter((item) => filterFn(item, searchQuery))
      .slice(0, maxResults);
  }, [searchQuery, items, filterFn, maxResults]);

  // CSS classes for dropdown direction
  const dropdownClasses = dropdownDirection === 'up' 
    ? "bottom-full mb-2" 
    : "top-full mt-2";

  return (
    <div className="relative w-full" ref={searchRef}>
      {/* Search Results Dropdown */}
      {isFocused && searchQuery.trim() !== "" && (
        <div className={`absolute left-0 z-50 w-full bg-[#161b22] border border-[#30363d] rounded-md shadow-2xl overflow-hidden ${dropdownClasses}`}>
          {filteredResults.length > 0 ? (
            filteredResults.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onSelect(item);
                  setSearchQuery("");
                  setIsFocused(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-[#1f6feb] hover:text-white border-b border-[#30363d] last:border-none transition-colors group"
              >
                {renderItem(item)}
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-[#8b949e] italic text-center">
              No results found
            </div>
          )}
        </div>
      )}

      {/* Input Field */}
      <div className="relative group">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8b949e] group-focus-within:text-[#1f6feb]"
          xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          className="w-full bg-[#0d1117] border border-[#30363d] rounded-md py-1.5 pl-10 pr-4 text-sm text-[#c9d1d9] placeholder-[#8b949e] focus:outline-none focus:ring-1 focus:ring-[#1f6feb] focus:border-[#1f6feb] transition-all"
        />
      </div>
    </div>
  );
};