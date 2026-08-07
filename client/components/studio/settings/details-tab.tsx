"use client";

import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { FilterSelect } from "@/components/shared/filter-select";
import { getCategories, type Category } from "@/services/studio.service";

interface Props {
  title: string;
  setTitle: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  difficulty: string;
  setDifficulty: (v: string) => void;
  bannerUrl: string;
  setBannerUrl: (v: string) => void;
}

export function DetailsTab({
  title, setTitle,
  description, setDescription,
  category, setCategory,
  difficulty, setDifficulty,
  bannerUrl, setBannerUrl,
}: Props) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(console.error);
  }, []);

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
        <Textarea
          id="s-desc"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 resize-none"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="s-category" className="text-xs font-medium text-muted-foreground">Category</label>
          <FilterSelect
            value={category}
            placeholder="Select category"
            onChange={setCategory}
            options={categories.map((c) => ({ label: c.name, value: c.id }))}
            className="mt-1"
          />
        </div>
        <div>
          <label htmlFor="s-difficulty" className="text-xs font-medium text-muted-foreground">Difficulty</label>
          <FilterSelect
            value={difficulty}
            placeholder="Select difficulty"
            onChange={setDifficulty}
            options={[
              { label: "Beginner", value: "BEGINNER" },
              { label: "Intermediate", value: "INTERMEDIATE" },
              { label: "Advanced", value: "ADVANCED" },
            ]}
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <label htmlFor="s-thumb" className="text-xs font-medium text-muted-foreground">Banner URL</label>
        <input
          id="s-thumb"
          value={bannerUrl}
          onChange={(e) => setBannerUrl(e.target.value)}
          placeholder="https://..."
          className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
    </>
  );
}
