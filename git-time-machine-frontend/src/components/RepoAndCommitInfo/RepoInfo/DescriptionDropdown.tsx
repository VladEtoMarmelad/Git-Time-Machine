import { useState, useRef, useEffect } from 'react';
import { InfoIcon, CaretIcon } from '@/components/icons';

interface DescriptionDropdownProps {
  repoDescription: string;
}

export const DescriptionDropdown = ({ repoDescription }: DescriptionDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside the component
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block h-full " ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center h-full px-2.5 text-xs font-medium 
          border border-[#30363d] 
          rounded-md mr-1 transition-colors
          outline-none focus:ring-1 focus:ring-[#e6edf3]
          bg-[#21262d] hover:text-[#e6edf3]
          hidden md:flex items-center h-full px-2.5 font-medium text-[#7d8590] hover:bg-[#30363d]
        `}
        title="View repository description"
      >
        <InfoIcon className="w-3.5 h-3.5 mr-1.5 fill-gray-400" />
        <span className="max-w-[120px] truncate font-mono mr-1">Description</span>
        <CaretIcon className="w-3 h-3 fill-gray-400" />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute left-0 mt-1 z-50 w-64 p-3 bg-[#0d1117] border border-[#30363d] rounded-md shadow-xl">
          <h4 className="text-[11px] font-semibold uppercase mb-2 tracking-wider">
            Repository Description
          </h4>
          <p className="text-xs text-[#e6edf3] leading-relaxed break-words font-sans">
            {repoDescription || "No description provided."}
          </p>
        </div>
      )}
    </div>
  );
};