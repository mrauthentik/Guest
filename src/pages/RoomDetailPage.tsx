import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  BedDouble, Users, Star, Wifi, Wind, Tv, Coffee,
  Bath, Car, Dumbbell, ArrowLeft, Calendar, Shield,
  AlertCircle,
} from 'lucide-react';
import { useRoom } from '@/hooks/useQueries';
import { useCreateBooking } from '@/hooks/useQueries';
import { useAuth } from '@/context/AuthContext';
import { roomService } from '@/services/roomService';
import { PageLoader, ErrorMessage } from '@/components/ui/LoadingStates';
import { formatCurrency, calcNights } from '@/utils/format';
import toast from 'react-hot-toast';

const amenityIconMap: Record<string, React.ReactNode> = {
  WiFi:    <Wifi    className="w-4 h-4 text-brand-400" />,
  AC:      <Wind    className="w-4 h-4 text-brand-400" />,
  TV:      <Tv      className="w-4 h-4 text-brand-400" />,
  Coffee:  <Coffee  className="w-4 h-4 text-brand-400" />,
  Bath:    <Bath    className="w-4 h-4 text-brand-400" />,
  Parking: <Car     className="w-4 h-4 text-brand-400" />,
  Gym:     <Dumbbell className="w-4 h-4 text-brand-400" />,
};

function today() { return new Date().toISOString().split('T')[0]; }
function minCheckout(checkIn: string) {
  const d = new Date(checkIn);
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

export default function RoomDetailPage() {
  const { id }  = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: room, isLoading, error } = useRoom(id!);
  const createBooking = useCreateBooking();

  const [checkIn,   setCheckIn]   = useState(today());
  const [checkOut,  setCheckOut]  = useState(minCheckout(today()));
  const [available, setAvailable] = useState<boolean | null>(null);
  const [checking,  setChecking]  = useState(false);
  const [imgIdx,    setImgIdx]    = useState(0);

  const nights = calcNights(checkIn, checkOut);
  const total  = room ? room.price_per_night * nights : 0;

  async function checkAvail() {
    if (!id || !checkIn || !checkOut) return;
    setChecking(true);
    try {
      const ok = await roomService.checkAvailability(id, checkIn, checkOut);
      setAvailable(ok);
    } catch {
      toast.error('Could not check availability.');
    } finally {
      setChecking(false);
    }
  }

  useEffect(() => { setAvailable(null); }, [checkIn, checkOut]);

  async function handleBook() {
    if (!user) { navigate('/login'); return; }
    if (!room)  return;

    if (available === null) {
      await checkAvail();
      return;
    }
    if (!available) { toast.error('Room unavailable for selected dates.'); return; }

    createBooking.mutate(
      { form: { room_id: room.id, check_in_date: checkIn, check_out_date: checkOut }, total },
      { onSuccess: b => navigate(`/bookings/${b.id}/payment`) },
    );
  }

  if (isLoading) return <PageLoader />;
  if (error || !room) return (
    <div className="min-h-screen flex items-center justify-center">
      <ErrorMessage error={error ?? new Error('Room not found')} retry={() => navigate('/rooms')} />
    </div>
  );

  const images = room.images?.length ? room.images : ['/images/room-default.jpg'];

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container-max px-4">
        {/* Back */}
        <Link to="/rooms" className="btn-ghost mb-8 inline-flex">
          <ArrowLeft className="w-4 h-4" />
          All Rooms
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left: images + info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image gallery */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative rounded-2xl overflow-hidden h-80 md:h-[440px] bg-dark-700"
            >
              <img
                src={images[imgIdx]}
                alt={room.name}
                className="w-full h-full object-cover"
                onError={e => { (e.target as HTMLImageElement).src = '/images/room-default.jpg'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-900/60 via-transparent to-transparent" />

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIdx(i)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${i === imgIdx ? 'bg-brand-400 w-6' : 'bg-white/40'}`}
                    />
                  ))}
                </div>
              )}
            </motion.div>

            {/* Room info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">{room.name}</h1>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-brand-400" />
                      Up to {room.capacity} guests
                    </span>
                    <span className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 text-gold-400 fill-gold-400" />
                      ))}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-2xl font-bold text-brand-400">{formatCurrency(room.price_per_night)}</div>
                  <div className="text-gray-500 text-sm">per night</div>
                </div>
              </div>

              <p className="text-gray-300 leading-relaxed mb-6">{room.description}</p>

              {/* Amenities */}
              {room.amenities && room.amenities.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Amenities</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {room.amenities.map(a => (
                      <div key={a} className="flex items-center gap-2 px-3 py-2 glass rounded-lg text-sm text-gray-300">
                        {amenityIconMap[a] ?? <BedDouble className="w-4 h-4 text-brand-400" />}
                        {a}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right: booking widget */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="card sticky top-28"
            >
              <h3 className="font-display font-bold text-white text-xl mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-400" />
                Book Your Stay
              </h3>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="input-label">Check-in Date</label>
                  <input
                    type="date"
                    value={checkIn}
                    min={today()}
                    onChange={e => {
                      setCheckIn(e.target.value);
                      if (e.target.value >= checkOut) setCheckOut(minCheckout(e.target.value));
                    }}
                    className="input"
                  />
                </div>
                <div>
                  <label className="input-label">Check-out Date</label>
                  <input
                    type="date"
                    value={checkOut}
                    min={minCheckout(checkIn)}
                    onChange={e => setCheckOut(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              {/* Price breakdown */}
              <div className="glass-brand rounded-xl p-4 mb-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>{formatCurrency(room.price_per_night)} × {nights} night{nights !== 1 ? 's' : ''}</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <div className="h-px bg-brand-500/20 my-2" />
                <div className="flex justify-between font-semibold text-white">
                  <span>Total</span>
                  <span className="text-brand-400 text-base">{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Availability indicator */}
              {available !== null && (
                <div className={`flex items-center gap-2 mb-4 text-sm px-3 py-2 rounded-lg ${available ? 'bg-brand-500/10 text-brand-400' : 'bg-red-500/10 text-red-400'}`}>
                  <AlertCircle className="w-4 h-4" />
                  {available ? 'Room is available for selected dates!' : 'Room unavailable for these dates.'}
                </div>
              )}

              <button
                onClick={handleBook}
                disabled={createBooking.isPending || checking}
                className="btn-primary w-full justify-center py-3.5 text-base"
              >
                {checking ? 'Checking…' : createBooking.isPending ? 'Booking…' : available === null ? 'Check & Book' : 'Confirm Booking'}
              </button>

              {!user && (
                <p className="text-xs text-center text-gray-500 mt-3">
                  <Link to="/login" className="text-brand-400 hover:underline">Sign in</Link> to book this room.
                </p>
              )}

              <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
                <Shield className="w-3.5 h-3.5 text-brand-400" />
                Booking expires 2 hours after creation if unpaid.
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
