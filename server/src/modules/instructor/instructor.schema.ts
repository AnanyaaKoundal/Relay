import { z } from "zod";

export const onboardSchema = z.object({
  headline: z.string().min(10, "Headline must be at least 10 characters").max(100),
  bio: z.string().max(500).nullable().optional(),
  expertise: z.string().nullable().optional(),
  experience: z.string().max(1000).nullable().optional(),
  twitter: z.string().nullable().optional(),
  linkedin: z.string().nullable().optional(),
  github: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
});
