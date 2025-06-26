import { supabase } from "@/lib/supabase"; 
import { User } from "../types";
import { MAIN_CONSULTANT_NAME, MAIN_CONSULTANT_EMAIL } from "@/context/AuthContext";

// Helper functions
const genId = (): string => Date.now().toString() + Math.floor(Math.random() * 100000).toString();

// User functions
export async function loadUsers(): Promise<User[]> {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Convert database format to app format
    const convertedUsers = (users || []).map(user => ({
      ...user,
      isMainConsultant: user.is_main_consultant
    }));
    
    // Create default consultant if no users exist
    if (convertedUsers.length === 0) {
      await supabase
        .from('users')
        .insert({
          name: MAIN_CONSULTANT_NAME,
          email: MAIN_CONSULTANT_EMAIL,
          phone: "0500000000",
          role: "mainConsultant",
          password: "123456",
          approved: true,
          is_main_consultant: true
        });
      
      return await loadUsers(); // Reload after insertion
    }
    
    return convertedUsers;
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

export async function getUserById(id: string): Promise<User | undefined> {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !user) return undefined;
    
    return {
      ...user,
      isMainConsultant: user.is_main_consultant
    };
  } catch (error) {
    console.error("Error getting user by ID:", error);
    return undefined;
  }
}

export async function getUserNameById(id: string): Promise<string> {
  if (!id) {
    return "-";
  }
  const user = await getUserById(id);
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
