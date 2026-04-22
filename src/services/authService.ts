import { supabase } from '@/lib/supabase';
import type { Profile, RegisterForm } from '@/types';

// ── Auth Service ──────────────────────────────────────────────────────────────

export const authService = {
  async signUp(form: RegisterForm) {
    const { data, error } = await supabase.auth.signUp({
      email:    form.email,
      password: form.password,
      options: {
        // All fields land in raw_user_meta_data → picked up by handle_new_user() trigger
        data: {
          full_name:        form.full_name,
          phone:            form.phone,
          // PM § 3.2 — extended registration fields
          gender:           form.gender           ?? null,
          marital_status:   form.marital_status   ?? null,
          age_bracket:      form.age_bracket      ?? null,
          nationality:      form.nationality      ?? null,
          residency_status: form.residency_status ?? null,
          health_status:    form.health_status    ?? null,
          health_notes:     form.health_notes     ?? null,
          special_requests: form.special_requests ?? null,
        },
      },
    });
    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async getUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },
};

// ── Profile Service ───────────────────────────────────────────────────────────

export const profileService = {
  async getProfile(userId: string): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data as Profile;
  },

  async updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data as Profile;
  },

  async isAdmin(userId: string): Promise<boolean> {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    return data?.role === 'admin' || data?.role === 'superadmin';
  },
};
