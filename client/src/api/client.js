import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

// Normalise errors to { code, message }
function toError(err) {
  const apiErr = err.response?.data?.error;
  if (apiErr) return apiErr;
  return { code: 'NETWORK', message: 'Cannot reach the server. Please check your connection and try again.' };
}

export async function fetchSlots(date, tz) {
  try {
    const { data } = await api.get('/slots', { params: { date, tz } });
    return data.slots;
  } catch (e) {
    throw toError(e);
  }
}

export async function createBooking(payload) {
  try {
    const { data } = await api.post('/bookings', payload);
    return data.booking;
  } catch (e) {
    throw toError(e);
  }
}
