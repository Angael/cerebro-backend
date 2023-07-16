import { GB } from '../utils/consts.js';
import { UserType } from '@prisma/client';

// TODO: Move to DB?
export const userTypes = {
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
