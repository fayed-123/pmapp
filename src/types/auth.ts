
import { User } from '@/lib/types';

// Auth-related types
export interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  login: (nameOrEmail: string, role: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id' | 'approved'>) => Promise<boolean>;
  logout: () => void;
  addUser: (name: string, role: "consultant" | "owner" | "contractor", isMainConsultant?: boolean) => Promise<boolean>; // Add Promise<boolean>
  deleteUser: (userId: string) => Promise<boolean>; // Add Promise<boolean>
  isMainConsultant: (userId: string) => Promise<boolean>; // Add Promise<boolean>
}