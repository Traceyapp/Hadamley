"use client";

import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Bold, Heading2, Heading3, ImagePlus, Italic, Link2, List, ListOrdered, Quote, Redo2, Undo2, Unlink } from "lucide-react";
import { useRef, useState } from "react";
import { uploadImage } from "@/app/admin/actions";

function ToolButton({ onClick, active, label, children, disabled }: { onClick: () => void; active?: boolean; label: string; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={active}
      disabled={disabled}
      className={`grid size-9 place-items-center rounded-lg ${active ? "bg-brand text-paper" : "text-ink hover:bg-sand-2"} disabled:opacity-40`}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor, onImage }: { editor: Editor; onImage: () => void }) {
  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link address (for example https://example.org or /find-support)", prev ?? "");
    if (url === null) return;
    if (!url) editor.chain().focus().unsetLink().run();
    else editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };
  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 rounded-t-xl border-b border-line bg-sand px-2 py-1.5" role="toolbar" aria-label="Formatting">
      <ToolButton label="Heading" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        <Heading2 className="size-[1.15rem]" aria-hidden />
      </ToolButton>
      <ToolButton label="Subheading" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        <Heading3 className="size-[1.15rem]" aria-hidden />
      </ToolButton>
      <span className="mx-1 h-6 w-px bg-line-strong" aria-hidden />
      <ToolButton label="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold className="size-[1.1rem]" aria-hidden />
      </ToolButton>
      <ToolButton label="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic className="size-[1.1rem]" aria-hidden />
      </ToolButton>
      <span className="mx-1 h-6 w-px bg-line-strong" aria-hidden />
      <ToolButton label="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List className="size-[1.1rem]" aria-hidden />
      </ToolButton>
      <ToolButton label="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered className="size-[1.1rem]" aria-hidden />
      </ToolButton>
      <ToolButton label="Highlighted box" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote className="size-[1.1rem]" aria-hidden />
      </ToolButton>
      <span className="mx-1 h-6 w-px bg-line-strong" aria-hidden />
      <ToolButton label="Add or edit link" active={editor.isActive("link")} onClick={setLink}>
        <Link2 className="size-[1.1rem]" aria-hidden />
      </ToolButton>
      <ToolButton label="Remove link" disabled={!editor.isActive("link")} onClick={() => editor.chain().focus().unsetLink().run()}>
        <Unlink className="size-[1.1rem]" aria-hidden />
      </ToolButton>
      <ToolButton label="Insert image" onClick={onImage}>
        <ImagePlus className="size-[1.1rem]" aria-hidden />
      </ToolButton>
      <span className="ml-auto flex">
        <ToolButton label="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
          <Undo2 className="size-[1.1rem]" aria-hidden />
        </ToolButton>
        <ToolButton label="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
          <Redo2 className="size-[1.1rem]" aria-hidden />
        </ToolButton>
      </span>
    </div>
  );
}

export function RichTextEditor({ name, initial, labelId, onChange, minHeight }: { name?: string; initial: string; labelId: string; onChange?: (html: string) => void; minHeight?: string }) {
  const [html, setHtml] = useState(initial);
  const [imgError, setImgError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, link: false }),
      Link.configure({ openOnClick: false, autolink: true }),
      Image.configure({ inline: false }),
    ],
    content: initial,
    editorProps: {
      attributes: { class: `tiptap prose-h max-w-none px-5 py-4 ${minHeight ?? ""}`, "aria-labelledby": labelId, role: "textbox", "aria-multiline": "true" },
    },
    onUpdate: ({ editor }) => {
      const next = editor.getHTML();
      setHtml(next);
      onChange?.(next);
    },
  });

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !editor) return;
    const alt = window.prompt("Describe this image for people who can't see it (alt text). Leave empty only if it is purely decorative.");
    if (alt === null) return;
    const fd = new FormData();
    fd.set("file", file);
    fd.set("alt", alt);
    setImgError(null);
    const res = await uploadImage(fd);
    if (!res.ok || !res.url) return setImgError(res.message ?? "Upload failed.");
    editor.chain().focus().setImage({ src: res.url, alt }).run();
  }

  return (
    <div className="rounded-xl border border-line-strong bg-surface focus-within:border-brand">
      {editor && <Toolbar editor={editor} onImage={() => fileRef.current?.click()} />}
      <EditorContent editor={editor} />
      {!editor && <div className="min-h-[320px] px-5 py-4 text-ink-2">Loading editor...</div>}
      {name && <input type="hidden" name={name} value={html} />}
      <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={onFile} />
      {imgError && <p className="border-t border-line px-5 py-2 text-sm font-bold text-urgent">{imgError}</p>}
    </div>
  );
}
