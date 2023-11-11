export const Role = {
  Admin: 'Admin',
  User: 'User',
  Premium: 'Premium',
} as const;

export type UserClaims = {
  roles: Array<keyof typeof Role>;
};
