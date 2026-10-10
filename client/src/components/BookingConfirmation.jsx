import './BookingConfirmation.css';

export default function BookingConfirmation({ booking, onReset }) {
  const { parent, mentor, meetingLink } = booking;
  return (
    <div className="card app-card confirmation-card">
      <div className="card-body p-4 text-center">
        <div className="confirm-icon mb-3">&#10003;</div>
        <h2 className="h4">Your trial class is booked!</h2>
        <p className="text-muted">A confirmation with the class link has been emailed to {parent.email}.</p>

        <ul className="list-group text-start my-4">
          <li className="list-group-item">
            <div className="small text-muted">Your local time</div>
            <strong>{parent.local.full}</strong>
          </li>
          <li className="list-group-item">
            <div className="small text-muted">Mentor</div>
            <strong>{mentor.name}</strong>
            <div className="small text-muted">Mentor's local time: {mentor.local.full}</div>
          </li>
          <li className="list-group-item">
            <div className="small text-muted">Class link</div>
            <a href={meetingLink} target="_blank" rel="noreferrer">{meetingLink}</a>
          </li>
        </ul>

        <button className="btn btn-outline-primary" onClick={onReset}>Book another class</button>
      </div>
    </div>
  );
}
