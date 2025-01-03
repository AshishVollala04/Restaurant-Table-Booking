import React from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useState, useEffect } from "react";


export default function BookingForm() {
    const { register, handleSubmit, reset, watch } = useForm();
    const [availableSlots, setAvailableSlots] = useState([]);
    const [summary, setSummary] = useState(null);
    const [fetchError, setFetchError] = useState("");
    const [bookingError, setBookingError] = useState("");
    const [loadingSlots, setLoadingSlots] = useState(false);

    const selectedDate = watch("date");

    useEffect(() => {
        if (!selectedDate) {
            setAvailableSlots([]);
            return;
        }

        const fetchAvailability = async () => {
            setLoadingSlots(true);
            setFetchError("");
            try {
                const response = await axios.get(`http://localhost:3001/api/availability?date=${selectedDate}`);
                setAvailableSlots(response.data);
            } catch (err) {
                console.error("Failed to fetch availability:", err);
                setFetchError("Failed to fetch available slots. Please try again.");
            } finally {
                setLoadingSlots(false);
            }
        };

        fetchAvailability();
    }, [selectedDate]);

    const onSubmit = async (data) => {
        setBookingError("");
        setSummary(null);

        if (!data.time) {
            setBookingError("Please select a time slot.");
            return;
        }

        console.log("Submitting data:", data);

        try {
            const response = await axios.post("http://localhost:3001/api/bookings", data);
            setSummary(data);
            alert("Booking confirmed!");
            reset();
        } catch (err) {
            console.error("API Error:", err.response);
            setBookingError(err.response?.data?.message || "Failed to book. Please try another slot.");
        }
    };

    return (
        <div className="container">
            <h1>Restaurant Table Booking</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="form">
                <input {...register("name", { required: "Name is required" })} placeholder="Name" required />
                <input
                    {...register("contact_details", {
                        required: "Contact is required",
                        pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: "Invalid contact (e.g., john@example.com)",
                        },
                    })}
                    placeholder="Contact (email)"
                    required
                />
                <input {...register("date", { required: "Date is required" })} type="date" required />
                {loadingSlots ? (
                    <p>Fetching slots...</p>
                ) : fetchError ? (
                    <p className="error-message">{fetchError}</p>
                ) : availableSlots.length > 0 ? (
                    <select {...register("time", { required: "Time is required" })}>
                        <option value="">Select a time slot</option>
                        {availableSlots.map((slot) => (
                            <option key={slot} value={slot}>
                                {slot}
                            </option>
                        ))}
                    </select>
                ) : (
                    <p>No slots available for the selected date.</p>
                )}
                <input {...register("guests", { required: true, min: 1 })} type="number" placeholder="Guests" min="1" required />
                <input {...register("table", { required: true, min: 1, max: 15 })} type="number" placeholder="Table (1-15)" min="1" max="15" required />
                <button type="submit" disabled={loadingSlots}>Submit</button>
                {bookingError && <p className="error-message">{bookingError}</p>}
                {summary && (
                    <div className="summary">
                        <h3>Booking Summary</h3>
                        <p><strong>Name:</strong> {summary.name}</p>
                        <p><strong>Contact:</strong> {summary.contact_details}</p>
                        <p><strong>Date:</strong> {summary.date}</p>
                        <p><strong>Time:</strong> {summary.time}</p>
                        <p><strong>Guests:</strong> {summary.guests}</p>
                        <p><strong>Table:</strong> {summary.table}</p>
                    </div>
                )}
            </form>
        </div>
    );
}
