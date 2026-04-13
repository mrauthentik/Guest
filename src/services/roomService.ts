import { supabase } from '@/lib/supabase';
import type { Room } from '@/types';

export const roomService = {
  async getRooms(): Promise<Room[]> {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('is_active', true)
      .order('price_per_night', { ascending: true });
    if (error) throw error;
    return (data ?? []) as Room[];
  },

  async getRoom(id: string): Promise<Room> {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as Room;
  },

  async getAllRooms(): Promise<Room[]> {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []) as Room[];
  },

  async createRoom(room: Omit<Room, 'id' | 'created_at'>): Promise<Room> {
    const { data, error } = await supabase
      .from('rooms')
      .insert([room])
      .select()
      .single();
    if (error) throw error;
    return data as Room;
  },

  async updateRoom(id: string, updates: Partial<Room>): Promise<Room> {
    const { data, error } = await supabase
      .from('rooms')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Room;
  },

  async checkAvailability(
    roomId: string,
    checkIn: string,
    checkOut: string,
  ): Promise<boolean> {
    const { data, error } = await supabase
      .from('bookings')
      .select('id')
      .eq('room_id', roomId)
      .not('status', 'in', '("CANCELLED","CHECKED_OUT")')
      .or(
        `check_in_date.lt.${checkOut},check_out_date.gt.${checkIn}`,
      );
    if (error) throw error;
    return (data ?? []).length === 0;
  },
};
