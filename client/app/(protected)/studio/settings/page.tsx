"use client";

import { useEffect, useState } from "react";
import { Save, Check } from "lucide-react";
import { Spinner } from "@/components/shared/spinner";
import { AvatarUpload } from "@/components/shared/avatar-upload";
import { InstructorPreview } from "@/components/studio/settings/instructor-preview";
import { Textarea } from "@/components/ui/textarea";
import * as studioApi from "@/services/studio.service";
import { removeAvatar } from "@/services/upload.service";
import { useAuth } from "@/hooks/useAuth";
import type { InstructorProfile } from "@/types/studio.types";

const emptyProfile: InstructorProfile = { name: null, email: null, avatarUrl: null, profile: null };

export default function StudioSettingsPage() {
  const { user: authUser, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<InstructorProfile>(emptyProfile);

  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [expertise, setExpertise] = useState("");
  const [experience, setExperience] = useState("");
  const [twitter, setTwitter] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [website, setWebsite] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    studioApi
      .getInstructorProfile()
      .then((profile) => {
        setData(profile);
        setAvatarUrl(profile.avatarUrl ?? null);
        setHeadline(profile.profile?.headline ?? "");
        setBio(profile.profile?.bio ?? "");
        setExpertise(profile.profile?.expertise ?? "");
        setExperience(profile.profile?.experience ?? "");
        setTwitter(profile.profile?.twitter ?? "");
        setLinkedin(profile.profile?.linkedin ?? "");
        setGithub(profile.profile?.github ?? "");
        setWebsite(profile.profile?.website ?? "");
      })
      .catch(() => setError("Failed to load your profile"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setError("");
    if (!headline.trim()) {
      setError("Headline is required (min 10 characters)");
      return;
    }
    if (headline.trim().length < 10) {
      setError("Headline must be at least 10 characters");
      return;
    }

    setSaving(true);
    setSaved(false);
    try {
      const profile = await studioApi.updateInstructorProfile({
        headline: headline.trim(),
        bio: bio.trim() || null,
        expertise: expertise.trim() || null,
        experience: experience.trim() || null,
        twitter: twitter.trim() || null,
        linkedin: linkedin.trim() || null,
        github: github.trim() || null,
        website: website.trim() || null,
      });
      setData(profile);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-80 items-center justify-center gap-2 text-sm text-muted-foreground">
        <Spinner />
        Loading settings...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Profile Settings</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            How you appear to students on your courses.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1 text-xs text-emerald-600">
              <Check className="size-3.5" />
              Saved
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/80 disabled:opacity-50"
          >
            <Save className="size-3.5" />
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="space-y-5 rounded-xl border bg-card p-5">
          {error && <p className="text-sm text-red-500">{error}</p>}

          <div>
            <label className="text-xs font-medium text-muted-foreground">Avatar</label>
            <div className="mt-1">
              <AvatarUpload
                userId={authUser?.id ?? ""}
                currentUrl={avatarUrl}
                onUploadComplete={(url) => {
                  setAvatarUrl(url);
                  if (authUser) updateUser({ ...authUser, avatarUrl: url });
                }}
                onRemove={async () => {
                  await removeAvatar();
                  setAvatarUrl(null);
                  if (authUser) updateUser({ ...authUser, avatarUrl: null });
                }}
              />
            </div>
          </div>

          <div>
            <label htmlFor="p-headline" className="text-xs font-medium text-muted-foreground">
              Headline
            </label>
            <input
              id="p-headline"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Full-stack developer & instructor"
              className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">Min 10 characters</p>
          </div>

          <div>
            <label htmlFor="p-bio" className="text-xs font-medium text-muted-foreground">
              Bio
            </label>
            <Textarea
              id="p-bio"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell students about yourself, your teaching style, and your experience..."
              className="mt-1 resize-none"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">{bio.length}/500</p>
          </div>

          <div>
            <label htmlFor="p-expertise" className="text-xs font-medium text-muted-foreground">
              Expertise
            </label>
            <input
              id="p-expertise"
              value={expertise}
              onChange={(e) => setExpertise(e.target.value)}
              placeholder="Comma separated, e.g. React, TypeScript, Node"
              className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="p-experience" className="text-xs font-medium text-muted-foreground">
              Experience
            </label>
            <Textarea
              id="p-experience"
              rows={3}
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="e.g. 5 years building production apps..."
              className="mt-1 resize-none"
            />
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground">Social links</p>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="p-twitter" className="text-[11px] text-muted-foreground">
                  Twitter / X
                </label>
                <input
                  id="p-twitter"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  placeholder="@handle"
                  className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label htmlFor="p-linkedin" className="text-[11px] text-muted-foreground">
                  LinkedIn
                </label>
                <input
                  id="p-linkedin"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="username"
                  className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label htmlFor="p-github" className="text-[11px] text-muted-foreground">
                  GitHub
                </label>
                <input
                  id="p-github"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="username"
                  className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label htmlFor="p-website" className="text-[11px] text-muted-foreground">
                  Website
                </label>
                <input
                  id="p-website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://..."
                  className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Preview</p>
          <div className="lg:sticky lg:top-0">
            <InstructorPreview
              profile={data}
              avatarUrl={avatarUrl}
              headline={headline}
              bio={bio}
              expertise={expertise}
              twitter={twitter}
              linkedin={linkedin}
              github={github}
              website={website}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
