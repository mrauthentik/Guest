import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
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

  async uploadRoomImage(file: File): Promise<string> {
    const ext      = file.name.split('.').pop();
    const filename = `${uuidv4()}.${ext}`;
    const path     = `room-images/${filename}`;

    const { error } = await supabase.storage
      .from('rooms')
      .upload(path, file, { upsert: false });
    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('rooms')
      .getPublicUrl(path);

    return urlData.publicUrl;
  },
};
