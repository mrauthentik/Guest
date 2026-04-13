import { supabase } from '@/lib/supabase';

export interface Complaint {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'in_review' | 'resolved';
  admin_note?: string;
  created_at: string;
}

export const contactService = {
  async submitComplaint(payload: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }): Promise<Complaint> {
    const { data, error } = await supabase
      .from('complaints')
      .insert([{ ...payload, status: 'new' }])
      .select()
      .single();
    if (error) throw error;
    return data as Complaint;
  },

  async getAllComplaints(): Promise<Complaint[]> {
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as Complaint[];
  },

  async updateComplaintStatus(
    id: string,
    status: Complaint['status'],
    admin_note?: string,
  ): Promise<void> {
    const { error } = await supabase
      .from('complaints')
      .update({ status, ...(admin_note !== undefined ? { admin_note } : {}) })
      .eq('id', id);
    if (error) throw error;
  },
};
