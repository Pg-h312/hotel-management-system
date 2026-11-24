# Hotel Management System (MERN)

A practical hotel operations dashboard for live-project practice. Includes room management, guest bookings, dashboard statistics, search/filtering, and REST APIs.

## Tech stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- API testing: Postman collection included

## 1. Requirements
Install Node.js LTS and MongoDB Community Server, or create a MongoDB Atlas database.

## 2. Configure the backend
Open a terminal in `backend`:

```bash
npm install
```

Copy `.env.example` to `.env` and set your MongoDB connection string:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/hotel_management
CLIENT_URL=http://localhost:5173
```

For Atlas, replace `MONGODB_URI` with your Atlas connection string.

Start the API:

```bash
npm run dev
```

API health check: http://localhost:5000/api/health

## 3. Configure the frontend
Open another terminal in `frontend`:

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal (normally http://localhost:5173).

The dashboard loads data from the backend. Add rooms and bookings from the UI. If MongoDB is not connected, the API will report a database error; configure MongoDB before testing CRUD.

## 4. Main features
- Dashboard: total rooms, available rooms, occupied rooms, active bookings and revenue
- Rooms: add, search, filter and delete rooms
- Bookings: create guest bookings, list and cancel bookings
- Booking status: Confirmed / Checked-in / Checked-out / Cancelled
- Responsive layout for desktop and mobile

## 5. Postman testing
Import `postman/Hotel-Management-System.postman_collection.json` into Postman.
Set collection variable `baseUrl` to `http://localhost:5000`.

Suggested order:
1. `Health Check`
2. `Create Room`
3. `Get All Rooms`
4. `Create Booking` (use a real room ID returned by Create Room)
5. `Get Dashboard Stats`
6. `Get All Bookings`
7. `Delete Room` (only after its booking is cancelled/deleted)

## 6. Important live-project workflow
1. Run and test locally.
2. Verify all APIs in Postman.
3. Fix bugs and validate required fields / error cases.
4. Push the project to GitHub (do not commit `.env`).
5. Deploy the backend and database, then deploy the frontend.
6. Set the frontend API URL to the deployed backend URL and test the live site.

This is a learning/demo project. Before production use, add authentication, role-based authorization, payment gateway integration, audit logs, stronger validation, rate limiting and secure deployment settings.
