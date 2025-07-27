export type GetUserQueryInput = {
  userId: string;
};

export type GetUserQueryResult = {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
};