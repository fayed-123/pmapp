
import { User } from "../types";
import { MAIN_CONSULTANT_NAME, MAIN_CONSULTANT_EMAIL } from "@/context/AuthContext";

// Helper functions
const genId = (): string => Date.now().toString() + Math.floor(Math.random() * 100000).toString();

// User functions
export function loadUsers(): User[] {
  try {
    const users = JSON.parse(localStorage.getItem('ppm_users') || "[]");
    
    // First launch: create default consultant user
    if (users.length === 0) {
      const defaultUser = {
        id: genId(),
        name: MAIN_CONSULTANT_NAME,
        email: MAIN_CONSULTANT_EMAIL,
        phone: "0500000000",
        role: "consultant" as const,
        password: "123456",
        approved: true,
        isMainConsultant: true
      };
      
      localStorage.setItem('ppm_users', JSON.stringify([defaultUser]));
      return [defaultUser];
    }
    
    return users;
  } catch (error) {
    console.error("Error loading users:", error);
    return [];
  }
}

export function saveUsers(users: User[]): void {
  try {
    localStorage.setItem('ppm_users', JSON.stringify(users));
  } catch (error) {
    console.error("Error saving users:", error);
  }
}

export function getUserById(id: string): User | undefined {
  return loadUsers().find(user => user.id === id);
}

export function getUserNameById(id: string): string {
  const user = getUserById(id);
  return user ? user.name : "-";
}

// Session management
export function getCurrentUser(): User | null {
  try {
    return JSON.parse(sessionStorage.getItem('ppm_current_user') || "null");
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export function setCurrentUser(user: User | null): void {
  try {
    if (user) {
      sessionStorage.setItem('ppm_current_user', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('ppm_current_user');
    }
  } catch (error) {
    console.error("Error setting current user:", error);
  }
}
