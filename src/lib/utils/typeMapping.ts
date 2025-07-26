// Type mapping utility functions
import { User } from "@/lib/types";

/**
 * Maps user type (Arabic) to item subcontractorType (English)
 */
export const getItemTypeForUser = (userType: string): string | null => {
  const typeMap: { [key: string]: string } = {
    "كهربائي": "electrical",
    "معماري": "architect", 
    "ميكانيكي": "mechanical"
  };
  return typeMap[userType] || null;
};

/**
 * Maps item subcontractorType (English) to user type (Arabic)
 */
export const getUserTypeForItem = (itemType: string): string | null => {
  const typeMap: { [key: string]: string } = {
    "electrical": "كهربائي",
    "architect": "معماري",
    "mechanical": "ميكانيكي"
  };
  return typeMap[itemType] || null;
};

/**
 * Checks if user has full access (can see all items)
 */
export const hasFullAccess = (userRole: string): boolean => {
  return [
    'mainConsultant',
    'consultant', 
    'contractor',
    'owner'
  ].includes(userRole);
};

/**
 * Checks if user has filtered access (can only see items of their type)
 */
export const hasFilteredAccess = (userRole: string): boolean => {
  return [
    'subconsultant',
    'subcontractor'
  ].includes(userRole);
};

/**
 * Checks if user is assigned to a project
 */
export const isUserAssignedToProject = (user: User, project: any): boolean => {
  const userId = user.id;
  
  return (
    userId === project.owner_id ||
    userId === project.consultant_id ||
    userId === project.contractor_id ||
    userId === project.electricalconsultantid ||
    userId === project.architectconsultantid ||
    userId === project.mechanicalconsultantid ||
    userId === project.electricalcontractorid ||
    userId === project.architectcontractorid ||
    userId === project.mechanicalcontractorid
  );
};