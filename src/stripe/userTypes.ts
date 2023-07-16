import { GB } from '../utils/consts.js';
import { UserType } from '@prisma/client';

type UserTypes = {
  [key in UserType]: {
    limitBytes: number;
  };
};

// TODO: Move to DB?
export const userTypes: UserTypes = {
  [UserType.FREE]: {
    limitBytes: 0,
  },
  [UserType.PREMIUM]: {
    limitBytes: 1 * GB,
  },
  [UserType.ADMIN]: {
    limitBytes: 1 * GB,
  },
} as const;
