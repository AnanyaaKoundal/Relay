export type User = {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  isInstructor: boolean;
};

export type AuthResponse = {
  user: User;
  token: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export type UpgradeToInstructorPayload = {
  headline: string;
  bio?: string;
  expertise?: string;
  experience?: string;
  twitter?: string;
  linkedin?: string;
  github?: string;
  website?: string;
};

export type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (data: { email: string; password: string }) => Promise<User>;
  signup: (data: { name: string; email: string; password: string }) => Promise<User>;
  logout: () => void;
  upgradeToInstructor: (data: UpgradeToInstructorPayload) => Promise<User>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isInstructor: boolean;
};
