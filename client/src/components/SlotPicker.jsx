import './SlotPicker.css';

export default function SlotPicker({ slots, loading, selected, onSelect, timezone }) {
  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status" />
        <div className="small text-muted mt-2">Checking mentor availability...</div>
      </div>
    );
  }

  if (!slots) return null;

  if (slots.length === 0) {
    return (
      <div className="alert alert-warning mb-0">
        <strong>No mentors are available on this date.</strong>
        <br />
        All mentors are fully booked or outside working hours. Please try another date.
      </div>
    );
  }

  return (
    <>
      <div className="small text-muted mb-2">
        Times shown in <strong>{timezone.replace(/_/g, ' ')}</strong> ({slots[0].tzLabel})
      </div>
      <div className="slot-grid">
        {slots.map((s) => (
          <button
            key={s.startUtc}
            type="button"
            className={`btn slot-btn ${selected?.startUtc === s.startUtc ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => onSelect(s)}
          >
            {s.time}
          </button>
        ))}
      </div>
    </>
  );
}
