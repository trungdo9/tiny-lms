export declare enum Role {
    ADMIN = "admin",
    INSTRUCTOR = "instructor",
    STUDENT = "student"
}
export declare const ROLE_VALUES: readonly ["admin", "instructor", "student"];
export type RoleValue = (typeof ROLE_VALUES)[number];
