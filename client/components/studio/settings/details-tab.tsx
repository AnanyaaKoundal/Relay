"use client";

interface Props {
  title: string;
  setTitle: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  difficulty: string;
  setDifficulty: (v: string) => void;
  thumbnailUrl: string;
  setThumbnailUrl: (v: string) => void;
}

export function DetailsTab({
  title, setTitle,
  description, setDescription,
  category, setCategory,
  difficulty, setDifficulty,
  thumbnailUrl, setThumbnailUrl,
}: Props) {
  return (
    <>
      <div>
        <label htmlFor="s-title" className="text-xs font-medium text-muted-foreground">Title</label>
        <input
          id="s-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label htmlFor="s-desc" className="text-xs font-medium text-muted-foreground">Description</label>
        <textarea
          id="s-desc"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="s-category" className="text-xs font-medium text-muted-foreground">Category</label>
          <input
            id="s-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Web Development"
            className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label htmlFor="s-difficulty" className="text-xs font-medium text-muted-foreground">Difficulty</label>
          <select
            id="s-difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="s-thumb" className="text-xs font-medium text-muted-foreground">Thumbnail URL</label>
        <input
          id="s-thumb"
          value={thumbnailUrl}
          onChange={(e) => setThumbnailUrl(e.target.value)}
          placeholder="https://..."
          className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
    </>
  );
}
