export type User = Readonly<{
  id: string;
  email: string;
  hashedPassword: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
}>;

export type CreateUserInput = {
  email: string;
  hashedPassword: string;
  name?: string;
};

export type UpdateUserInput = {
  name?: string;
  email?: string;
};

export function createUser(input: CreateUserInput): Omit<User, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    email: input.email,
    hashedPassword: input.hashedPassword,
    name: input.name ?? null,
  };
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function canUpdateEmail(currentUser: User, newEmail: string): boolean {
  return currentUser.email !== newEmail && validateEmail(newEmail);
}