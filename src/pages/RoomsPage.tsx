import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BedDouble, Users, Star, Wifi, Wind, Tv, Coffee,
  Bath, Car, Dumbbell, ArrowRight, Search, SlidersHorizontal,
  Globe, Flag, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useRooms } from '@/hooks/useQueries';
import { CardSkeleton, ErrorMessage } from '@/components/ui/LoadingStates';
import type { Room, RoomCategory } from '@/types';
import { formatCurrency } from '@/utils/format';
import { useAuth } from '@/context/AuthContext';

const fadeUp = {
  hidden:  { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: 'easeOut' },
  }),
};

const amenityIconMap: Record<string, typeof Wifi> = {
  WiFi: Wifi, AC: Wind, TV: Tv, Coffee, Bath, Parking: Car, Gym: Dumbbell,
};

function AmenityIcon({ name }: { name: string }) {
  const Icon = amenityIconMap[name] ?? Star;
  return (
    <span className="flex items-center gap-1 text-xs text-gray-400 bg-white/5 px-2 py-1 rounded-md">
      <Icon className="w-3 h-3 text-brand-400" />
      {name}
    </span>
  );
}

/** Badge showing which guest category the room targets */
function CategoryBadge({ category }: { category: RoomCategory }) {
  if (category === 'both') return null;
  const isForeigner = category === 'foreigner';
  return (
    <div
      className={`absolute top-4 left-4 flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${
        isForeigner
          ? 'bg-[#f0b429]/20 text-[#f0b429] border border-[#f0b429]/30'
          : 'bg-[#10bc96]/20 text-[#10bc96] border border-[#10bc96]/30'
      }`}
    >
      {isForeigner ? <Globe className="w-3 h-3" /> : <Flag className="w-3 h-3" />}
      {isForeigner ? 'Foreigner' : 'Nigerian Resident'}
    </div>
  );
}

function RoomCard({ room, index }: { room: Room; index: number }) {
  const [hovered, setHovered] = useState(false);
  const [currentImg, setCurrentImg] = useState(0);
  
  const images = room.images?.length ? room.images : [`/images/room-${(index % 3) + 1}.jpg`];

  const nextImg = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setCurrentImg(prev => (prev + 1) % images.length);
  };
  const prevImg = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setCurrentImg(prev => (prev - 1 + images.length) % images.length);
  };

  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      viewport={{ once: true }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group h-full"
    >
      <div className="glass rounded-2xl overflow-hidden border border-white/8 hover:border-brand-500/30 transition-all duration-500 hover:shadow-[0_20px_60px_rgba(16,188,150,0.1)] flex flex-col h-full relative">
        {/* Image Slider */}
        <div className="relative h-56 overflow-hidden bg-dark-700">
          <AnimatePresence initial={false}>
            <motion.img
              key={currentImg}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, scale: hovered ? 1.05 : 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              src={images[currentImg]}
              alt={room.name}
              className="absolute inset-0 w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).src = `/images/room-${(index % 3) + 1}.jpg`; }}
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900/90 via-transparent to-transparent pointer-events-none" />
          
          {/* Slider Controls */}
          {images.length > 1 && (
            <div className={`absolute inset-0 flex items-center justify-between px-2 transition-opacity duration-300 ${hovered ? 'opacity-100' : 'opacity-0'} pointer-events-none`}>
              <button onClick={prevImg} className="p-1 rounded-full bg-black/40 text-white hover:bg-brand-500 backdrop-blur-md pointer-events-auto transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={nextImg} className="p-1 rounded-full bg-black/40 text-white hover:bg-brand-500 backdrop-blur-md pointer-events-auto transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Dots */}
          {images.length > 1 && (
            <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-1.5 z-10">
              {images.map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentImg ? 'bg-brand-400 w-3' : 'bg-white/50'}`} />
              ))}
            </div>
          )}
          {/* Category badge — top left */}
          <CategoryBadge category={room.category} />
          {/* Price badge — top right */}
          <div className="absolute top-4 right-4 glass-brand px-3 py-1.5 rounded-full">
            <span className="text-brand-400 font-bold text-sm">{formatCurrency(room.price_per_night)}</span>
            <span className="text-gray-400 text-xs">/night</span>
          </div>
          {/* Capacity */}
          <div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-white text-sm">
            <Users className="w-4 h-4 text-brand-400" />
            <span>Up to {room.capacity} guests</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-3 flex-1">
          <div>
            <h3 className="font-display font-bold text-white text-xl mb-1 group-hover:text-brand-300 transition-colors">
              {room.name}
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed line-clamp-2">{room.description}</p>
          </div>

          {/* Amenities */}
          {room.amenities && room.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {room.amenities.slice(0, 4).map(a => <AmenityIcon key={a} name={a} />)}
              {room.amenities.length > 4 && (
                <span className="text-xs text-gray-500 px-2 py-1">+{room.amenities.length - 4} more</span>
              )}
            </div>
          )}

          {/* Stars */}
          <div className="flex gap-0.5 mt-auto">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 text-gold-400 fill-gold-400" />
            ))}
            <span className="text-xs text-gray-400 ml-1">5.0</span>
          </div>

          <Link to={`/rooms/${room.id}`} className="btn-primary mt-2 justify-center group">
            Book This Room
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function RoomsPage() {
  const { profile } = useAuth();
  const { data: rooms, isLoading, error, refetch } = useRooms();

  const [search,       setSearch]       = useState('');
  const [maxPrice,     setMaxPrice]     = useState<number | ''>('');
  const [maxCapacity,  setMaxCapacity]  = useState<number | ''>('');
  const [showFilters,  setShowFilters]  = useState(false);

  // PM § 4.1 — residency-based filtering:
  // If user has a residency_status set → only show rooms that match their status OR 'both'
  // Public visitors / users without residency set → show all rooms
  const userResidency = profile?.residency_status;

  const filtered = (rooms ?? []).filter(r => {
    // Residency filter (server-side logic mirrored client-side)
    if (userResidency && r.category !== 'both' && r.category !== userResidency) return false;

    if (search      && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (maxPrice    && r.price_per_night > Number(maxPrice))                  return false;
    if (maxCapacity && r.capacity        > Number(maxCapacity))               return false;
    return true;
  });

  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Header */}
      <div className="container-max px-4 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="divider mx-auto mb-4" />
          <h1 className="text-4xl md:text-6xl font-display font-black text-white mb-4">
            Our <span className="gradient-text">Premium Rooms</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Each room is a carefully crafted haven of luxury, comfort, and modern elegance.
          </p>

          {/* Residency notice — only if logged in and residency is set */}
          {userResidency && (
            <div className={`inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full text-sm font-semibold ${
              userResidency === 'foreigner'
                ? 'bg-[#f0b429]/10 text-[#f0b429] border border-[#f0b429]/20'
                : 'bg-[#10bc96]/10 text-[#10bc96] border border-[#10bc96]/20'
            }`}>
              {userResidency === 'foreigner'
                ? <><Globe className="w-4 h-4" /> Showing rooms designated for foreigners</>
                : <><Flag className="w-4 h-4" /> Showing rooms for Nigerian residents</>
              }
            </div>
          )}
        </motion.div>

        {/* Search & Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search rooms…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input pl-11"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary px-4 ${showFilters ? 'border-brand-500 text-brand-400' : ''}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="glass rounded-xl mt-3 p-5 grid grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Max Price / Night (₦)</label>
                    <input
                      type="number"
                      placeholder="e.g. 50000"
                      value={maxPrice}
                      onChange={e => setMaxPrice(e.target.value ? Number(e.target.value) : '')}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="input-label">Max Capacity</label>
                    <input
                      type="number"
                      placeholder="e.g. 4"
                      value={maxCapacity}
                      onChange={e => setMaxCapacity(e.target.value ? Number(e.target.value) : '')}
                      className="input"
                    />
                  </div>
                  <button
                    onClick={() => { setSearch(''); setMaxPrice(''); setMaxCapacity(''); }}
                    className="col-span-2 btn-ghost justify-center text-sm"
                  >
                    Clear Filters
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Grid */}
      <div className="container-max px-4">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : error ? (
          <ErrorMessage error={error} retry={refetch} />
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <BedDouble className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Rooms Found</h3>
            <p className="text-gray-400">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-400 mb-6">{filtered.length} room{filtered.length !== 1 ? 's' : ''} available</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((room, i) => <RoomCard key={room.id} room={room} index={i} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
