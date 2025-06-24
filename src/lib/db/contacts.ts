
import { Contact } from "../types";

export function loadContacts(): Contact[] {
  try {
    return JSON.parse(localStorage.getItem('ppm_contacts') || "[]");
  } catch (error) {
    console.error("Error loading contacts:", error);
    return [];
  }
}

export function saveContacts(contacts: Contact[]): void {
  try {
    localStorage.setItem('ppm_contacts', JSON.stringify(contacts));
  } catch (error) {
    console.error("Error saving contacts:", error);
  }
}

// Function to delete contacts by project ID
export function deleteContactsByProjectId(projectId: string): void {
  try {
    const contacts = loadContacts();
    const updatedContacts = contacts.filter(c => c.projectId !== projectId);
    saveContacts(updatedContacts);
  } catch (error) {
    console.error("Error deleting contacts by project ID:", error);
  }
}
