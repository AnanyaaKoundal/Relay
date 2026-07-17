import { prisma } from "../../lib/prisma.js";
import { signToken } from "../auth/auth.service.js";

export type OnboardData = {
  headline: string;
  bio?: string | null | undefined;
  expertise?: string | null | undefined;
  experience?: string | null | undefined;
  twitter?: string | null | undefined;
  linkedin?: string | null | undefined;
  github?: string | null | undefined;
  website?: string | null | undefined;
};

export async function onboard(userId: string, data: OnboardData) {
  const profileData = {
    headline: data.headline,
    bio: data.bio ?? null,
    expertise: data.expertise ?? null,
    experience: data.experience ?? null,
    twitter: data.twitter ?? null,
    linkedin: data.linkedin ?? null,
    github: data.github ?? null,
    website: data.website ?? null,
  };

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      isInstructor: true,
      profile: {
        upsert: {
          create: profileData,
          update: profileData,
        },
      },
    },
    select: { id: true, name: true, email: true, isAdmin: true, isInstructor: true },
  });

  const token = signToken({
    userId: user.id,
    email: user.email,
    isAdmin: user.isAdmin,
    isInstructor: user.isInstructor,
  });

  return { user, token };
}
