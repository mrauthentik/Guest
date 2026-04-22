import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Plus, Edit2, Eye, EyeOff, Trash2, X } from 'lucide-react';
import { useAllRooms } from '@/hooks/useQueries';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { roomService } from '@/services/roomService';
import { TableSkeleton, ErrorMessage } from '@/components/ui/LoadingStates';
import { formatCurrency } from '@/utils/format';
import type { Room, RoomCategory } from '@/types';
import toast from 'react-hot-toast';

const DEFAULT_FORM: Omit<Room, 'id' | 'created_at'> = {
  name:            '',
  description:     '',
  price_per_night: 0,
  capacity:        2,
  is_active:       true,
  amenities:       ['WiFi', 'AC', 'TV'],
  images:          [],
  category:        'both',
};

export default function AdminRoomsPage() {
  const { data: rooms, isLoading, error, refetch } = useAllRooms();
  const qc = useQueryClient();

  const createRoom = useMutation({
    mutationFn: (room: Omit<Room, 'id' | 'created_at'>) => roomService.createRoom(room),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['rooms'] }); toast.success('Room created!'); setModal(null); },
    onError:   (e: Error) => toast.error(e.message),
  });

  const updateRoom = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Room> }) => roomService.updateRoom(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['rooms'] }); toast.success('Room updated!'); setModal(null); },
    onError:   (e: Error) => toast.error(e.message),
  });

  const [modal,   setModal]   = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Room | null>(null);
  const [form,    setForm]    = useState(DEFAULT_FORM);
  const [amenityInput, setAmenityInput] = useState('');

  function openCreate() {
    setEditing(null);
    setForm(DEFAULT_FORM);
    setModal('create');
  }

  function openEdit(room: Room) {
    setEditing(room);
    setForm({
      name:            room.name,
      description:     room.description,
      price_per_night: room.price_per_night,
      capacity:        room.capacity,
      is_active:       room.is_active,
      amenities:       room.amenities ?? [],
      images:          room.images ?? [],
      category:        room.category ?? 'both',
    });
    setModal('edit');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim())        { toast.error('Room name required.'); return; }
    if (form.price_per_night <= 0){ toast.error('Price must be > 0.'); return; }

    if (modal === 'create') {
      createRoom.mutate(form);
    } else if (editing) {
      updateRoom.mutate({ id: editing.id, data: form });
    }
  }

  function addAmenity() {
    const a = amenityInput.trim();
    if (!a || form.amenities?.includes(a)) return;
    setForm(f => ({ ...f, amenities: [...(f.amenities ?? []), a] }));
    setAmenityInput('');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-white mb-1">Rooms Management</h2>
          <p className="text-gray-400 text-sm">{(rooms ?? []).length} rooms total.</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm">
          <Plus className="w-4 h-4" />
          Add Room
        </button>
      </div>

      {isLoading ? (
        <TableSkeleton rows={4} />
      ) : error ? (
        <ErrorMessage error={error} retry={refetch} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {(rooms ?? []).map(room => (
            <motion.div
              key={room.id}
              layout
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-semibold text-white text-base">{room.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Capacity: {room.capacity} guests</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${room.is_active ? 'bg-brand-500/15 text-brand-400' : 'bg-gray-500/15 text-gray-400'}`}>
                    {room.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    room.category === 'foreigner'         ? 'bg-[#f0b429]/15 text-[#f0b429]' :
                    room.category === 'nigerian_resident' ? 'bg-[#10bc96]/15 text-[#10bc96]' :
                                                           'bg-white/8 text-gray-400'
                  }`}>
                    {room.category === 'foreigner' ? 'Foreigner' : room.category === 'nigerian_resident' ? 'NG Resident' : 'All Guests'}
                  </span>
                  <span className="text-brand-400 font-bold text-sm">{formatCurrency(room.price_per_night)}/night</span>
                </div>
              </div>

              <p className="text-gray-400 text-xs line-clamp-2 mb-3">{room.description}</p>

              {(room.amenities?.length ?? 0) > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {room.amenities?.slice(0, 3).map(a => (
                    <span key={a} className="text-[10px] bg-white/5 text-gray-400 px-2 py-0.5 rounded">{a}</span>
                  ))}
                  {(room.amenities?.length ?? 0) > 3 && (
                    <span className="text-[10px] text-gray-600">+{(room.amenities?.length ?? 0) - 3}</span>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-3 border-t border-white/8">
                <button onClick={() => openEdit(room)} className="btn-ghost text-sm px-3 py-1.5 flex-1 justify-center">
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => updateRoom.mutate({ id: room.id, data: { is_active: !room.is_active } })}
                  className="btn-ghost text-sm px-3 py-1.5 flex-1 justify-center"
                >
                  {room.is_active
                    ? <><EyeOff className="w-3.5 h-3.5" />Deactivate</>
                    : <><Eye className="w-3.5 h-3.5" />Activate</>
                  }
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-bold text-white text-lg">
                  {modal === 'create' ? 'Add New Room' : 'Edit Room'}
                </h3>
                <button onClick={() => setModal(null)} className="btn-ghost px-2 py-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="input-label">Room Name *</label>
                  <input
                    className="input"
                    placeholder="e.g. Deluxe Suite"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="input-label">Description *</label>
                  <textarea
                    rows={3}
                    className="input resize-none"
                    placeholder="Describe the room…"
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Price per Night (₦) *</label>
                    <input
                      type="number"
                      min={0}
                      className="input"
                      value={form.price_per_night || ''}
                      onChange={e => setForm(f => ({ ...f, price_per_night: Number(e.target.value) }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="input-label">Capacity (guests) *</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      className="input"
                      value={form.capacity}
                      onChange={e => setForm(f => ({ ...f, capacity: Number(e.target.value) }))}
                      required
                    />
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <label className="input-label">Amenities</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      className="input flex-1"
                      placeholder="e.g. WiFi, AC, TV…"
                      value={amenityInput}
                      onChange={e => setAmenityInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addAmenity(); } }}
                    />
                    <button type="button" onClick={addAmenity} className="btn-secondary text-sm px-3">
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(form.amenities ?? []).map(a => (
                      <span
                        key={a}
                        className="flex items-center gap-1 bg-brand-500/10 border border-brand-500/20 text-brand-400 px-2 py-0.5 rounded-md text-xs"
                      >
                        {a}
                        <button
                          type="button"
                          onClick={() => setForm(f => ({ ...f, amenities: f.amenities?.filter(x => x !== a) }))}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="input-label">Guest Category *</label>
                  <select
                    className="input"
                    value={form.category ?? 'both'}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value as RoomCategory }))}
                    required
                  >
                    <option value="both">All Guests (Foreigner & Resident)</option>
                    <option value="foreigner">Foreigners Only</option>
                    <option value="nigerian_resident">Nigerian Residents Only</option>
                  </select>
                </div>

                {/* Active toggle */}
                <div className="flex items-center justify-between p-3 glass rounded-xl">
                  <span className="text-sm text-gray-300">Room Active</span>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                    className={`w-11 h-6 rounded-full transition-colors ${form.is_active ? 'bg-brand-500' : 'bg-dark-600'} relative`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form.is_active ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={createRoom.isPending || updateRoom.isPending}
                  className="btn-primary w-full justify-center py-3"
                >
                  {createRoom.isPending || updateRoom.isPending ? 'Saving…' : modal === 'create' ? 'Create Room' : 'Save Changes'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
