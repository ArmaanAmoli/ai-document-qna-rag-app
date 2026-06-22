export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePic?: Uint8Array;
    passwordHash?: string;
}