import { describe, expect, it } from "vitest";
import { readDb } from "@/lib/db";
import { resourceThumb, thumbName } from "@/lib/repo";

describe("download previews", () => {
  it("shows the bundled first page for an original library file", () => {
    const r = readDb().resources.find((x) => x.id === "lib-one-thing")!;
    expect(resourceThumb(r)).toBe("/thumbs/lib-one-thing.jpg");
  });

  it("drops the bundled preview once the file has been replaced", () => {
    const r = readDb().resources.find((x) => x.id === "lib-one-thing")!;
    expect(resourceThumb({ ...r, size: r.size + 1 })).toBeUndefined();
  });

  it("prefers a preview made in the admin, with an address that changes on replace", () => {
    const db = readDb();
    const r = db.resources.find((x) => x.id === "lib-word-search")!;
    const storedName = thumbName(r.storedName);
    db.uploads.push({ id: "u-thumb-test", fileName: "preview.jpg", storedName, mime: "image/jpeg", size: 1, alt: "", createdAt: "2026-10-29T10:00:00.000Z" });
    expect(resourceThumb(r)).toBe(`/files/${storedName}?v=${Date.parse("2026-10-29T10:00:00.000Z")}`);
    db.uploads = db.uploads.filter((u) => u.id !== "u-thumb-test");
  });

  it("uses the image itself for an image download, and nothing for other files", () => {
    const base = readDb().resources[0];
    expect(resourceThumb({ ...base, id: "r-x", storedName: "x.png", mime: "image/png" })).toBe("/files/x.png");
    expect(resourceThumb({ ...base, id: "r-y", storedName: "y.docx", mime: "application/msword" })).toBeUndefined();
  });
});
