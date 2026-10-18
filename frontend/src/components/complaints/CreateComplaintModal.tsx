import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { hostelsApi } from '../../api/hostels.api';
import { complaintsApi } from '../../api/complaints.api';
import { Hostel, ComplaintCategory, ComplaintPriority } from '../../types';
import {
  Loader2,
  AlertCircle,
  Utensils,
  Trophy,
  Wifi,
  Wrench,
  Zap,
  Sparkles,
  Box,
  Tag,
  Building,
  CheckCircle,
} from 'lucide-react';

interface CreateComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Issue suggestions for fast selection
const CATEGORY_SUGGESTIONS: Record<string, string[]> = {
  Mess: [
    'Poor food quality or taste',
    'Unhygienic food or mess area',
    'Drinking water problems',
    'Menu or food availability issues',
    'Mess timing issues',
  ],
  Sports: [
    'Damaged sports equipment',
    'Missing sports equipment',
    'Playground or court maintenance',
    'Sports facility problems',
    'Lighting or cleanliness issues in sports areas',
  ],
  Network: [
    'LAN connectivity issue (Ethernet port not working)',
    'Wi-Fi not working',
    'Slow internet',
    'No network connectivity',
    'Login or authentication issues',
    'Network problems in a particular hostel area',
  ],
  Electrical: [
    'Ceiling fan not working or vibrating',
    'Tube light flickering / fused',
    'Power socket / switch board spark',
    'Main switch tripping continuously',
  ],
  Plumbing: [
    'Bathroom tap leaking continuously',
    'Washbasin drainage blocked',
    'Low or no water pressure',
    'Flush tank malfunctioning',
  ],
  Cleaning: [
    'Room floor mopping required',
    'Washroom deep cleaning required',
    'Corridor dustbin overflow',
    'Cobwebs and window glass cleaning',
  ],
  Furniture: [
    'Study chair broken or loose',
    'Study desk drawer jammed',
    'Wardrobe lock or hinge broken',
    'Bed frame or ply damaged',
  ],
};

export const CreateComplaintModal: React.FC<CreateComplaintModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [categories, setCategories] = useState<ComplaintCategory[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<number | ''>('');
  const [selectedHostel, setSelectedHostel] = useState<number | ''>('');
  const [roomNumber, setRoomNumber] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [priority, setPriority] = useState<ComplaintPriority>('MEDIUM');

  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch hostels and categories when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const loadInitialData = async () => {
      try {
        setIsLoadingDropdowns(true);
        setError(null);
        const [hostelsData, categoriesData] = await Promise.all([
          hostelsApi.getHostels(),
          hostelsApi.getCategories(),
        ]);
        setHostels(hostelsData);
        setCategories(categoriesData);

        if (hostelsData.length > 0 && !selectedHostel) {
          setSelectedHostel(hostelsData[0].hostel_id);
        }
        if (categoriesData.length > 0 && !selectedCategory) {
          setSelectedCategory(categoriesData[0].category_id);
          setPriority(categoriesData[0].default_priority || 'MEDIUM');
        }
      } catch (err: any) {
        console.error('Failed to load initial data:', err);
        setError(err.response?.data?.message || 'Failed to load hostels and categories');
      } finally {
        setIsLoadingDropdowns(false);
      }
    };

    loadInitialData();
  }, [isOpen]);

  const currentCategoryObj = categories.find((c) => c.category_id === selectedCategory);
  const currentCategoryName = currentCategoryObj?.category_name || '';
  const isLanIssue =
    currentCategoryName.toLowerCase() === 'network' &&
    (/\blan\b/i.test(title) ||
     /\blan\b/i.test(description) ||
     /ethernet/i.test(title) ||
     /ethernet/i.test(description));
  const isLocationIndependent =
    ['mess', 'sports'].includes(currentCategoryName.toLowerCase()) ||
    (currentCategoryName.toLowerCase() === 'network' && !isLanIssue);

  const handleCategorySelect = (cat: ComplaintCategory) => {
    setSelectedCategory(cat.category_id);
    if (cat.default_priority) {
      setPriority(cat.default_priority);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setTitle(suggestion);
    if (!description) {
      setDescription(`Issue reported regarding: ${suggestion}. Please inspect and rectify at the earliest.`);
    }
  };

  const getCategoryIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'mess':
        return <Utensils className="w-4 h-4 text-orange-500" />;
      case 'sports':
        return <Trophy className="w-4 h-4 text-emerald-500" />;
      case 'network':
        return <Wifi className="w-4 h-4 text-indigo-500" />;
      case 'electrical':
        return <Zap className="w-4 h-4 text-amber-500" />;
      case 'plumbing':
        return <Wrench className="w-4 h-4 text-blue-500" />;
      case 'cleaning':
        return <Sparkles className="w-4 h-4 text-teal-500" />;
      case 'furniture':
        return <Box className="w-4 h-4 text-slate-500" />;
      default:
        return <Tag className="w-4 h-4 text-slate-500" />;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) {
      setError('Please select a complaint category');
      return;
    }

    // Room Number Validation (1 to 1056)
    const trimmedRoom = roomNumber.trim();
    if (!isLocationIndependent) {
      if (!trimmedRoom) {
        setError(
          isLanIssue
            ? 'Room number is required for LAN connectivity issues (1 to 1056)'
            : `Room number is required for ${currentCategoryName} complaints (1 to 1056)`
        );
        return;
      }
    }

    let parsedRoomNumber: number | undefined = undefined;
    if (trimmedRoom) {
      const num = Number(trimmedRoom);
      if (!Number.isInteger(num) || num < 1 || num > 1056) {
        setError('Room number must be an integer between 1 and 1056 (inclusive)');
        return;
      }
      parsedRoomNumber = num;
    }

    if (title.trim().length < 5) {
      setError('Title must be at least 5 characters');
      return;
    }
    if (description.trim().length < 10) {
      setError('Description must be at least 10 characters');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await complaintsApi.createComplaint({
        hostelId: selectedHostel ? Number(selectedHostel) : undefined,
        roomNumber: parsedRoomNumber,
        categoryId: Number(selectedCategory),
        title: title.trim(),
        description: description.trim(),
        priority,
      });

      // Reset form & close
      setTitle('');
      setDescription('');
      setRoomNumber('');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to submit complaint:', err);
      setError(err.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="File a Maintenance or Facility Complaint" maxWidth="2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center space-x-2 p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isLoadingDropdowns ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading categories and hostels...</div>
        ) : (
          <>
            {/* ─── 1. Category Selection ─────────────────────────── */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                1. Select Complaint Category
              </label>

              {/* Campus Amenities & Services (Mess, Sports, Network) */}
              <div className="mb-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Campus Facilities & Amenities (Location-Independent)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {categories
                    .filter((c) => ['mess', 'sports', 'network'].includes(c.category_name.toLowerCase()))
                    .map((cat) => {
                      const isSelected = selectedCategory === cat.category_id;
                      return (
                        <button
                          key={cat.category_id}
                          type="button"
                          onClick={() => handleCategorySelect(cat)}
                          className={`flex items-center space-x-2 p-2.5 rounded-xl border text-left transition ${
                            isSelected
                              ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-500/20 text-sky-900 font-bold'
                              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100 shrink-0">
                            {getCategoryIcon(cat.category_name)}
                          </div>
                          <span className="text-xs">{cat.category_name}</span>
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Hostel Maintenance (Plumbing, Electrical, Cleaning, Furniture) */}
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Hostel Room Maintenance (Room Required)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {categories
                    .filter((c) => !['mess', 'sports', 'network'].includes(c.category_name.toLowerCase()))
                    .map((cat) => {
                      const isSelected = selectedCategory === cat.category_id;
                      return (
                        <button
                          key={cat.category_id}
                          type="button"
                          onClick={() => handleCategorySelect(cat)}
                          className={`flex items-center space-x-2 p-2.5 rounded-xl border text-left transition ${
                            isSelected
                              ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-500/20 text-sky-900 font-bold'
                              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100 shrink-0">
                            {getCategoryIcon(cat.category_name)}
                          </div>
                          <span className="text-xs">{cat.category_name}</span>
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* ─── 2. Quick Issue Suggestions ─────────────────────── */}
            {currentCategoryName && CATEGORY_SUGGESTIONS[currentCategoryName] && (
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Common {currentCategoryName} Issues (Click to auto-fill title)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORY_SUGGESTIONS[currentCategoryName].map((sugg) => (
                    <button
                      key={sugg}
                      type="button"
                      onClick={() => handleSuggestionClick(sugg)}
                      className="text-xs bg-white hover:bg-sky-50 hover:text-sky-700 border border-slate-200 hover:border-sky-300 px-2.5 py-1 rounded-lg text-slate-600 transition"
                    >
                      + {sugg}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ─── 3. Location Details (Hostel + Direct Room 1-1056) ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>Hostel / Block</span>
                </label>
                <select
                  value={selectedHostel}
                  onChange={(e) => setSelectedHostel(Number(e.target.value))}
                  className="w-full text-sm rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  <option value="">Select Hostel (Optional)</option>
                  {hostels.map((h) => (
                    <option key={h.hostel_id} value={h.hostel_id}>
                      {h.hostel_name} ({h.location || 'Campus'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Room Number (1 to 1056)
                  </label>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isLocationIndependent
                        ? 'bg-slate-100 text-slate-500'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {isLanIssue
                      ? 'Required for LAN (1 - 1056)'
                      : isLocationIndependent
                      ? 'Optional for ' + currentCategoryName
                      : 'Required'}
                  </span>
                </div>
                <input
                  type="number"
                  min="1"
                  max="1056"
                  step="1"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder={
                    isLanIssue
                      ? 'Enter room number (1 - 1056, required for LAN)'
                      : isLocationIndependent
                      ? 'e.g. 101 (optional for ' + currentCategoryName + ')'
                      : 'Enter room number 1 to 1056'
                  }
                  required={!isLocationIndependent}
                  className="w-full text-sm rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>

            {/* ─── 4. Title & Priority ───────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Complaint Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Wi-Fi dropping frequently in evening hours"
                  maxLength={150}
                  className="w-full text-sm rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as ComplaintPriority)}
                  className="w-full text-sm rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  required
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>

            {/* ─── 5. Description ─────────────────────────────────── */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Detailed Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the problem, specific location (e.g. 2nd floor corridor / table 4 in mess), and when it occurs..."
                rows={3}
                className="w-full text-sm rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                required
              />
            </div>

            {/* ─── 6. Action Buttons ─────────────────────────────── */}
            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-6 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-400 text-white text-sm font-bold rounded-xl shadow-md shadow-sky-600/20 transition cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Submit Complaint</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </form>
    </Modal>
  );
};
