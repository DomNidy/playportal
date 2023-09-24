import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Utility function that splits an array into chunks of smaller arrays of length `chunkSize`
 * 
 * Ex: chunkArray([1,2,3,4,...,100], 3) => [[1,2,3], [4,5,6], ...., [98,99,100]]
 * 
 * Note: Entering a chunk size of 0 will throw an error
 * @param {any} arr:T[]
 * @param {any} chunkSize:number
 * @returns {any}
 */

export function chunkArray<T>(arr: T[], chunkSize: number): T[][] {
  if (chunkSize <= 0) {
    throw new Error("Chunk size must be greater than 0.");
  }

  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    result.push(arr.slice(i, i + chunkSize));
  }

  return result;
}
