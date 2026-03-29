export enum Role {
  ADMIN = 'admin',
  INSTRUCTOR = 'instructor',
  STUDENT = 'student',
}

export const ROLE_VALUES = ['admin', 'instructor', 'student'] as const;
export type RoleValue = (typeof ROLE_VALUES)[number];
