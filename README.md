# Codeyoung Trial Class Booking (MERN)

MongoDB + Express + React (Vite) + Node. Bootstrap 5 for UI; every component that needs custom
styling has its own `.css` file next to it.

## Run it (step by step)
1. Install Node 18+ and MongoDB (local) or create a free MongoDB Atlas cluster.
2. `npm run install:all`  (installs root, server and client dependencies)
3. Edit `server/.env` if needed (copy of `.env.example`; set `MONGODB_URI` for Atlas).
4. Make sure MongoDB is running.
5. `npm run seed`  (creates the 10 mentors, timezone Asia/Kolkata)
6. `npm run dev`   (API on :5000, React on :5173)
7. Open http://localhost:5173 and book a class. Emails are printed in the server terminal.

## Rules implemented
- 10 mentors, 30 min slots, mentor works 09:00-23:00 IST (configurable in `.env`)
- Max 2 classes per mentor per (mentor-local) day -> 10 x 2 = 20 classes/day capacity
- Times stored in UTC; shown to each person in their own zone (Luxon + IANA tz database -> DST safe)
- Mentor with the fewest classes that day is assigned first (even load spreading)
- Double-booking protected by a unique DB index + a post-insert daily-limit check
- No mentor free -> empty-state message on the slot list, or a 409 NO_MENTOR_AVAILABLE warning if the slot was just taken
