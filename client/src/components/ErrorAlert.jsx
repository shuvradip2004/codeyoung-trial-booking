export default function ErrorAlert({ error, onClose }) {
  if (!error) return null;
  const variant = error.code === 'NO_MENTOR_AVAILABLE' ? 'warning' : 'danger';
  return (
    <div className={`alert alert-${variant} alert-dismissible`} role="alert">
      {error.message}
      {onClose && <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />}
    </div>
  );
}
