import path from "node:path";

/**
 * Where data and files live. With NEXT_PUBLIC_SUPABASE_URL and
 * SUPABASE_SECRET_KEY set, the site uses Supabase (database plus the private
 * "uploads" bucket). Without them, or with HADAMLEY_STORE=file, it uses the
 * local data folder, which is what the tests and offline development use.
 */
export const useSupabase = () =>
  process.env.HADAMLEY_STORE !== "file" && !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SECRET_KEY;

// HADAMLEY_DATA_DIR lets tests run against a throwaway copy of the seed.
export const DATA_DIR = process.env.HADAMLEY_DATA_DIR || path.join(process.cwd(), "data");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
export const BUCKET = "uploads";
