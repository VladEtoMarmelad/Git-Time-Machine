import { IconProps } from "@/types/IconProps";

export const CaretIcon = ({ className = "", ...props }: IconProps) => (
  <svg 
    aria-hidden="true" 
    viewBox="0 0 16 16" 
    version="1.1" 
    width="12" 
    height="12" 
    fill="currentColor" 
    className={`opacity-60 ${className}`}
    {...props} // We pass the remaining props (for example, onClick)
  >
    <path d="M4.427 7.427l3.396 3.396a.25.25 0 00.354 0l3.396-3.396A.25.25 0 0011.396 7H4.604a.25.25 0 00-.177.427z" />
  </svg>
);