import { supabase } from '@/lib/supabase';
import { Contact } from "../types";

export async function loadContacts(): Promise<Contact[]> {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error loading contacts:", error);
    return [];
  }
}

export async function saveContact(contact: Contact): Promise<boolean> {
  try {
    if (contact.id) {
      // Update existing contact
      const { error } = await supabase
        .from('contacts')
        .update({
          project_id: contact.projectId,
          name: contact.name,
          phone: contact.phone,
          role: contact.role
        })
        .eq('id', contact.id);
      
      if (error) throw error;
    } else {
      // Insert new contact
      const { error } = await supabase
        .from('contacts')
        .insert({
          project_id: contact.projectId,
          name: contact.name,
          phone: contact.phone,
          role: contact.role
        });
      
      if (error) throw error;
    }
    return true;
  } catch (error) {
    console.error("Error saving contact:", error);
    return false;
  }
}


export async function deleteContact(contactId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', contactId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting contact:", error);
    return false;
  }
}

// Function to delete contacts by project ID
export async function deleteContactsByProjectId(projectId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('project_id', projectId);
    
    if (error) throw error;
  } catch (error) {
    console.error("Error deleting contacts by project ID:", error);
  }
}
