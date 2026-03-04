import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Task {
    id: bigint;
    title: string;
    createdAt: bigint;
    completed: boolean;
    dueDate?: string;
    description: string;
    dueTime?: string;
    priority: Priority;
}
export interface UserProfile {
    name: string;
}
export enum Priority {
    low = "low",
    high = "high",
    medium = "medium"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createTask(title: string, description: string, dueDate: string | null, dueTime: string | null, priority: Priority): Promise<Task>;
    deleteTask(id: bigint): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getTasks(): Promise<Array<Task>>;
    getTasksByDate(date: string): Promise<Array<Task>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    toggleComplete(id: bigint): Promise<Task>;
    updateTask(id: bigint, title: string, description: string, dueDate: string | null, dueTime: string | null, priority: Priority): Promise<Task>;
}
