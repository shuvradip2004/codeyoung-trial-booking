import { useState } from 'react';
import Header from './components/Header.jsx';
import BookingForm from './components/BookingForm.jsx';
import BookingConfirmation from './components/BookingConfirmation.jsx';

export default function App() {
  const [booking, setBooking] = useState(null);

  return (
    <>
      <Header />
      <main className="container py-4" style={{ maxWidth: 760 }}>
        {booking ? (
          <BookingConfirmation booking={booking} onReset={() => setBooking(null)} />
        ) : (
          <BookingForm onBooked={setBooking} />
        )}
      </main>
    </>
  );
}
