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
