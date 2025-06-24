
import { User } from '@/lib/types';

// Auth-related types
export interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isLoading: boolean;
  login: (nameOrEmail: string, role: string) => Promise<boolean>;
  register: (user: Omit<User, 'id' | 'approved'>) => Promise<boolean>;
  logout: () => void;
  addUser: (name: string, role: "owner" | "contractor" | "consultant", isMainConsultant?: boolean) => boolean;
  deleteUser: (userId: string) => boolean;
  isMainConsultant: (userId: string) => boolean;
}
