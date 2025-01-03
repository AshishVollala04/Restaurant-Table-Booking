import { useState } from "react";
import axios from "axios";


export default function ViewBookings() {
    const [date, setDate] = useState("");
    const [bookings, setBookings] = useState([]);
    const [fetchError, setFetchError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const fetchBookings = async () => {
        if (!date) {
            setFetchError("Please select a date.");
            return;
        }

        setFetchError("");
        setIsLoading(true);
        try {
            const response = await axios.get(`http://localhost:3001/api/bookings?date=${date}`);
            setBookings(response.data);
        } catch (error) {
            setFetchError("Failed to fetch bookings. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container">
            <h1>View Bookings</h1>
            <div>
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="input"
                />
                <button onClick={fetchBookings} className="button">Fetch Bookings</button>
            </div>
            {fetchError && <p className="error-message">{fetchError}</p>}
            {isLoading && <p>Loading...</p>}
            <ul>
                {bookings.length > 0 ? (
                    bookings.map((booking) => (
                        <li key={booking.id} className="booking-item">
                            <strong>{booking.name}</strong>, {booking.time}, Guests: {booking.guests}
                        </li>
                    ))
                ) : (
                    !isLoading && <p>No bookings available for the selected date.</p>
                )}
            </ul>
        </div>
    );
}
