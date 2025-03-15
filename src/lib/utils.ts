//It builds dynamic class names (using clsx) and ensures conflicting Tailwind classes are resolved (using twMerge).
  import { clsx, type ClassValue } from "clsx"
  import { twMerge } from "tailwind-merge"

  export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
  }
