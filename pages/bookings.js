import { useState } from "react";
import axios from "axios";

export default function ViewBookings() {
    const [date, setDate] = useState("");
    const [bookings, setBookings] = useState([]);
    const [fetchError, setFetchError] = useState("");

    const fetchBookings = async () => {
        try {
            setFetchError("");
            const response = await axios.get(`http://localhost:3001/api/bookings?date=${date}`);
            setBookings(response.data);
        } catch (error) {
            setFetchError("Failed to fetch bookings. Please try again.");
        }
    };

    return (
        <div>
            <h1>View Bookings</h1>
            <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
            />
            <button onClick={fetchBookings}>Fetch Bookings</button>
            
            {fetchError && <p style={{ color: "red" }}>{fetchError}</p>}

            <ul>
                {bookings.map((booking) => (
                    <li key={booking.id}>
                        {booking.name}, {booking.time}, Guests: {booking.guests}
                    </li>
                ))}
            </ul>
        </div>
    );
}
