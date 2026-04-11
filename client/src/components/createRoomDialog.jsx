import { useEffect, useMemo, useRef, useState } from 'react';
import AsyncSelect from 'react-select/async';
import Select from 'react-select';
import axiosInstance from '../utils/axiosInstance';

const CreateRoomDialog = ({ open, onClose, onSubmit }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const [dietaryPreference, setDietaryPreference] = useState({
    value: 'Both',
    label: 'Both',
  });
  const [budgetRange, setBudgetRange] = useState({
    min: 100,
    max: 1000,
  });
  const [minimumRating, setMinimumRating] = useState(3);
  const [maxGuests, setMaxGuests] = useState(4);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const locationDebounceRef = useRef(null);

  const locationPlaceholder = useMemo(() => {
    if (selectedLocation?.data?.properties?.name) {
      return selectedLocation.data.properties.name;
    }
    return 'Koramangala, Bengaluru';
  }, [selectedLocation]);

  useEffect(() => {
    if (!open) {
      setSelectedLocation(null);
      setSelectedCuisines([]);
      setDietaryPreference({ value: 'Both', label: 'Both' });
      setBudgetRange({ min: 100, max: 1000 });
      setMinimumRating(3);
      setMaxGuests(4);
      setError(null);
      setIsLoading(false);
    }
  }, [open]);

  const loadLocationOptions = inputValue =>
    new Promise(resolve => {
      if (locationDebounceRef.current) {
        clearTimeout(locationDebounceRef.current);
      }

      if (!inputValue || inputValue.trim().length < 2) {
        resolve([]);
        return;
      }

      locationDebounceRef.current = setTimeout(async () => {
        try {
          const response = await fetch(
            `https://photon.komoot.io/api/?q=${encodeURIComponent(inputValue)}`
          );
          if (!response.ok) {
            throw new Error('Failed to fetch locations');
          }
          const data = await response.json();
          const features = Array.isArray(data?.features) ? data.features : [];
          const seen = new Set();
          const unique = features.filter(feature => {
            const name = feature?.properties?.name || '';
            const city = feature?.properties?.city || '';
            const state = feature?.properties?.state || '';
            const country = feature?.properties?.country || '';
            const coords = Array.isArray(feature?.geometry?.coordinates)
              ? feature.geometry.coordinates.join(',')
              : '';
            const key = `${name}|${city}|${state}|${country}|${coords}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });

          const options = unique.map(result => {
            const labelParts = [
              result?.properties?.name,
              result?.properties?.city,
              result?.properties?.state,
              result?.properties?.country,
            ].filter(Boolean);
            return {
              label: labelParts.join(', ') || 'Unnamed place',
              value: `${result?.properties?.name || 'place'}-${result?.geometry?.coordinates?.join(',') || ''}`,
              data: result,
              meta: [
                result?.properties?.city,
                result?.properties?.state,
                result?.properties?.country,
              ]
                .filter(Boolean)
                .join(', '),
            };
          });

          resolve(options);
        } catch (error) {
          resolve([]);
        }
      }, 3000);
    });

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async event => {
    event.preventDefault();
    setError(null);

    // Validation checks
    const roomNameInput = document.querySelector('input[name="name"]');
    const roomName = roomNameInput?.value?.trim();

    if (!roomName) {
      setError('Please enter a room name');
      return;
    }

    if (roomName.length < 3) {
      setError('Room name must be at least 3 characters long');
      return;
    }

    if (roomName.length > 50) {
      setError('Room name must be 50 characters or less');
      return;
    }

    if (!selectedLocation) {
      setError('Please select a location');
      return;
    }

    if (selectedCuisines.length === 0) {
      setError('Please select at least one cuisine type');
      return;
    }

    if (budgetRange.min >= budgetRange.max) {
      setError('Budget minimum must be less than maximum');
      return;
    }

    if (budgetRange.min < 0 || budgetRange.max > 10000) {
      setError('Budget range must be between 0 and 10000');
      return;
    }

    if (minimumRating < 1 || minimumRating > 5) {
      setError('Rating must be between 1 and 5');
      return;
    }

    if (maxGuests < 1 || maxGuests > 100) {
      setError('Maximum guests must be between 1 and 100');
      return;
    }

    const searchRadiusInput = document.querySelector(
      'input[name="searchRadius"]'
    );
    const searchRadius = Number(searchRadiusInput?.value);
    if (searchRadius < 1 || searchRadius > 15) {
      setError('Search radius must be between 1 and 15 km');
      return;
    }

    // Prepare payload
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    payload.preferredCuisine = selectedCuisines.map(item => item.value);
    payload.dietaryPreferences = dietaryPreference?.value || 'Both';
    payload.budgetRangeMin = budgetRange.min;
    payload.budgetRangeMax = budgetRange.max;
    payload.minimumRating = minimumRating;
    payload.maxGuests = maxGuests;

    if (selectedLocation?.label) {
      payload.location = selectedLocation.label;
    }
    if (selectedLocation?.data?.geometry?.coordinates?.length === 2) {
      const [lng, lat] = selectedLocation.data.geometry.coordinates;
      payload.locationName =
        selectedLocation.data.properties?.name || payload.location;
      payload.locationCity = selectedLocation.data.properties?.city || '';
      payload.locationState = selectedLocation.data.properties?.state || '';
      payload.locationCountry = selectedLocation.data.properties?.country || '';
      payload.locationLat = String(lat);
      payload.locationLng = String(lng);
    }

    setIsLoading(true);
    try {
      const response = await axiosInstance.post('/rooms', payload);
      setError(null);
      onSubmit(response.data);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to create room. Please try again.';
      setError(errorMessage);
      console.error('Error creating room:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: '1rem',
      borderColor: state.isFocused ? '#94a3b8' : '#e2e8f0',
      boxShadow: 'none',
      padding: '2px 6px',
      minHeight: '44px',
    }),
    singleValue: base => ({
      ...base,
      color: '#0f172a',
      fontWeight: 600,
    }),
    menu: base => ({
      ...base,
      borderRadius: '1rem',
      padding: '0.5rem',
    }),
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-10 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-room-title"
    >
      <div className="flex w-full max-w-lg flex-col rounded-3xl border border-slate-200 bg-white shadow-[0_30px_60px_rgba(15,23,42,0.25)]">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2
              id="create-room-title"
              className="text-lg font-semibold text-slate-900"
            >
              Create Swipe Room
            </h2>
            <p className="text-xs text-slate-500">
              Add a few details to get started.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex max-h-[70vh] flex-col">
          <div className="grid gap-4 overflow-y-auto px-6 py-5">
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <label className="grid gap-1 text-sm font-semibold text-slate-700">
              Room name
              <input
                name="name"
                required
                maxLength={50}
                placeholder="Friday Dinner Picks"
                onChange={() =>
                  error && error.includes('name') && setError(null)
                }
                className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400"
              />
            </label>

            <label className="grid gap-1 text-sm font-semibold text-slate-700">
              Location
              <AsyncSelect
                cacheOptions
                defaultOptions={false}
                loadOptions={loadLocationOptions}
                value={selectedLocation}
                onChange={option => {
                  setSelectedLocation(option || null);
                  if (error && error.includes('location')) setError(null);
                }}
                placeholder={locationPlaceholder}
                className="react-select-container text-sm"
                classNamePrefix="react-select"
                noOptionsMessage={() => 'No results found'}
                loadingMessage={() => 'Searching locations...'}
                styles={{
                  ...selectStyles,
                  option: (base, state) => ({
                    ...base,
                    borderRadius: '0.75rem',
                    margin: '4px 0',
                    backgroundColor: state.isFocused ? '#f8fafc' : '#ffffff',
                    color: '#0f172a',
                  }),
                }}
                formatOptionLabel={option => (
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-900">
                      {option.label}
                    </span>
                    <span className="text-xs text-slate-500">
                      {option.meta || 'Tap to select'}
                    </span>
                  </div>
                )}
              />
            </label>

            <label className="grid gap-1 text-sm font-semibold text-slate-700">
              Search Radius (km)
              <input
                name="searchRadius"
                type="number"
                min="1"
                max="15"
                defaultValue="5"
                className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400"
              />
            </label>

            <label className="grid gap-1 text-sm font-semibold text-slate-700">
              Preferred Cuisine Types
              <Select
                isMulti
                name="preferredCuisine"
                value={selectedCuisines}
                onChange={value => {
                  setSelectedCuisines(value || []);
                  if (error && error.includes('cuisine')) setError(null);
                }}
                options={[
                  { value: 'Italian', label: 'Italian' },
                  { value: 'Japanese', label: 'Japanese' },
                  { value: 'Mexican', label: 'Mexican' },
                  { value: 'Indian', label: 'Indian' },
                  { value: 'Chinese', label: 'Chinese' },
                  { value: 'Mediterranean', label: 'Mediterranean' },
                  { value: 'American', label: 'American' },
                  { value: 'Thai', label: 'Thai' },
                  { value: 'Korean', label: 'Korean' },
                  { value: 'French', label: 'French' },
                  { value: 'Middle Eastern', label: 'Middle Eastern' },
                  { value: 'Spanish', label: 'Spanish' },
                  { value: 'Vietnamese', label: 'Vietnamese' },
                  { value: 'Fusion', label: 'Fusion' },
                ]}
                placeholder="Select cuisines"
                className="react-select-container text-sm"
                classNamePrefix="react-select"
                styles={{
                  ...selectStyles,
                  multiValue: base => ({
                    ...base,
                    borderRadius: '999px',
                    backgroundColor: '#f1f5f9',
                  }),
                  multiValueLabel: base => ({
                    ...base,
                    color: '#0f172a',
                    fontWeight: 600,
                  }),
                }}
              />
            </label>

            <label className="grid gap-1 text-sm font-semibold text-slate-700">
              Dietary Preferences
              <Select
                name="dietaryPreferences"
                value={dietaryPreference}
                onChange={value => {
                  setDietaryPreference(value);
                  if (error && error.includes('Dietary')) setError(null);
                }}
                options={[
                  { value: 'Vegetarian', label: 'Vegetarian' },
                  { value: 'Non-Vegetarian', label: 'Non-Vegetarian' },
                  { value: 'Both', label: 'Both' },
                ]}
                className="react-select-container text-sm"
                classNamePrefix="react-select"
                styles={selectStyles}
              />
            </label>

            <label className="grid gap-1 text-sm font-semibold text-slate-700">
              Budget Range
              <div className="mt-3 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Min:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max={budgetRange.max}
                      value={budgetRange.min}
                      onChange={e => {
                        setBudgetRange({
                          ...budgetRange,
                          min: Math.min(
                            Number(e.target.value),
                            budgetRange.max
                          ),
                        });
                        if (error && error.includes('Budget')) setError(null);
                      }}
                      className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-sm font-semibold text-slate-900 outline-none focus:border-slate-400"
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  value={budgetRange.min}
                  onChange={e => {
                    setBudgetRange({
                      ...budgetRange,
                      min: Math.min(Number(e.target.value), budgetRange.max),
                    });
                    if (error && error.includes('Budget')) setError(null);
                  }}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-slate-900"
                />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Max:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={budgetRange.min}
                      max="10000"
                      value={budgetRange.max}
                      onChange={e => {
                        setBudgetRange({
                          ...budgetRange,
                          max: Math.max(
                            Number(e.target.value),
                            budgetRange.min
                          ),
                        });
                        if (error && error.includes('Budget')) setError(null);
                      }}
                      className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-sm font-semibold text-slate-900 outline-none focus:border-slate-400"
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  value={budgetRange.max}
                  onChange={e => {
                    setBudgetRange({
                      ...budgetRange,
                      max: Math.max(Number(e.target.value), budgetRange.min),
                    });
                    if (error && error.includes('Budget')) setError(null);
                  }}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-slate-900"
                />

                <div className="flex items-center justify-center rounded-lg bg-white py-2 text-sm font-semibold text-slate-900">
                  {budgetRange.min} - {budgetRange.max}
                </div>
              </div>
            </label>

            <label className="grid gap-1 text-sm font-semibold text-slate-700">
              Minimum Rating
              <div className="mt-3 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Rating:</span>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    step="0.5"
                    value={minimumRating}
                    onChange={e => {
                      setMinimumRating(
                        Math.max(1, Math.min(5, Number(e.target.value)))
                      );
                      if (error && error.includes('Rating')) setError(null);
                    }}
                    className="w-16 rounded-lg border border-slate-300 px-2 py-1 text-sm font-semibold text-slate-900 outline-none focus:border-slate-400"
                  />
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.5"
                  value={minimumRating}
                  onChange={e => {
                    setMinimumRating(Number(e.target.value));
                    if (error && error.includes('Rating')) setError(null);
                  }}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-slate-900"
                />
                <div className="flex items-center justify-center rounded-lg bg-white py-2 text-sm font-semibold text-slate-900">
                  {minimumRating}+ Stars
                </div>
              </div>
            </label>

            <label className="grid gap-1 text-sm font-semibold text-slate-700">
              Maximum Guests
              <input
                name="maxGuests"
                type="number"
                min="1"
                max="100"
                value={maxGuests}
                onChange={e => {
                  setMaxGuests(Math.max(1, Number(e.target.value)));
                  if (error && error.includes('guests')) setError(null);
                }}
                placeholder="Enter number of guests"
                className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400"
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-2xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(15,23,42,0.35)] transition hover:-translate-y-[1px] hover:shadow-[0_16px_35px_rgba(15,23,42,0.45)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating room...' : 'Create room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoomDialog;
