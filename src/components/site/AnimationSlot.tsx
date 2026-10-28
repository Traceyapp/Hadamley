import fs from "node:fs";
import path from "node:path";
import { AnimationPlayer } from "./AnimationPlayer";

const DIR = path.join(process.cwd(), "public", "animation");
const TYPES: Record<string, string> = { ".mp4": "video/mp4", ".webm": "video/webm" };

/**
 * Ronald's animation, below the resource categories. Drop the file into
 * public/animation/ (MP4 or WebM) and it appears; until then nothing shows.
 */
export function AnimationSlot() {
  let file: string | undefined;
  try {
    file = fs.readdirSync(DIR).find((f) => path.extname(f).toLowerCase() in TYPES);
  } catch {
    return null;
  }
  if (!file) return null;
  return <AnimationPlayer src={`/animation/${file}`} type={TYPES[path.extname(file).toLowerCase()]} />;
}
