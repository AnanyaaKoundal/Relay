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

function emptyToNull(value?: string | null): string | null {
  return value && value.trim() ? value.trim() : null;
}

function toProfileData(data: OnboardData) {
  return {
    headline: data.headline,
    bio: emptyToNull(data.bio),
    expertise: emptyToNull(data.expertise),
    experience: emptyToNull(data.experience),
    twitter: emptyToNull(data.twitter),
    linkedin: emptyToNull(data.linkedin),
    github: emptyToNull(data.github),
    website: emptyToNull(data.website),
  };
}

export async function onboard(userId: string, data: OnboardData) {
  const profileData = toProfileData(data);

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

const PROFILE_SELECT = {
  name: true,
  email: true,
  profile: true,
} as const;

export async function getProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: PROFILE_SELECT,
  });
}

export async function updateProfile(userId: string, data: OnboardData) {
  const profileData = toProfileData(data);
  return prisma.user.update({
    where: { id: userId },
    data: {
      profile: {
        upsert: {
          create: profileData,
          update: profileData,
        },
      },
    },
    select: PROFILE_SELECT,
  });
}
