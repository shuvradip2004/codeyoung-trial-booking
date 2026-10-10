import { useEffect, useState } from 'react';
import TimezoneSelect from './TimezoneSelect.jsx';
import SlotPicker from './SlotPicker.jsx';
import ErrorAlert from './ErrorAlert.jsx';
import { fetchSlots, createBooking } from '../api/client.js';
import { browserTimezone, dateInZone } from '../utils/timezones.js';
import './BookingForm.css';

export default function BookingForm({ onBooked }) {
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [timezone, setTimezone] = useState(browserTimezone());
  const [date, setDate] = useState(dateInZone(browserTimezone()));
  const [slots, setSlots] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const minDate = dateInZone(timezone);
  const maxDate = dateInZone(timezone, 30);

  const handleTimezone = (tz) => {
    setTimezone(tz);
    if (date < dateInZone(tz)) setDate(dateInZone(tz));
  };

  // load slots whenever date / timezone changes
  useEffect(() => {
    let cancelled = false;
    setLoadingSlots(true);
    setSelected(null);
    fetchSlots(date, timezone)
      .then((s) => !cancelled && (setSlots(s), setError(null)))
      .catch((e) => !cancelled && (setSlots(null), setError(e)))
      .finally(() => !cancelled && setLoadingSlots(false));
    return () => {
      cancelled = true;
    };
  }, [date, timezone, refreshKey]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected) return setError({ code: 'VALIDATION', message: 'Please select a time slot.' });
    setSubmitting(true);
    setError(null);
    try {
      const booking = await createBooking({ parentName, parentEmail, timezone, startUtc: selected.startUtc });
      onBooked(booking);
    } catch (err) {
      setError(err);
      if (err.code === 'NO_MENTOR_AVAILABLE') setRefreshKey((k) => k + 1); // slot got taken -> refresh list
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="card app-card booking-form" onSubmit={handleSubmit}>
      <div className="card-body p-4">
        <ErrorAlert error={error} onClose={() => setError(null)} />

        <h2 className="h5 mb-3">1. Your details</h2>
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <label className="form-label">Parent name</label>
            <input className="form-control" required value={parentName} onChange={(e) => setParentName(e.target.value)} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" required value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} />
          </div>
        </div>

        <h2 className="h5 mb-3">2. Pick a date &amp; time zone</h2>
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <label className="form-label">Your time zone</label>
            <TimezoneSelect value={timezone} onChange={handleTimezone} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Date</label>
            <input type="date" className="form-control" min={minDate} max={maxDate} value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
        </div>

        <h2 className="h5 mb-3">3. Choose a slot</h2>
        <div className="slot-area mb-4">
          <SlotPicker slots={slots} loading={loadingSlots} selected={selected} onSelect={setSelected} timezone={timezone} />
        </div>

        <button className="btn btn-primary btn-lg w-100" disabled={!selected || submitting}>
          {submitting ? 'Booking...' : 'Confirm trial class'}
        </button>
      </div>
    </form>
  );
}
