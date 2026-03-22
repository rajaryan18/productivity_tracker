"use client";

import { useEffect, useState, useCallback } from "react";
import { Event } from "@/lib/data/models";
import { authenticatedFetch } from "@/lib/api";

export default function CalendarView() {
  const [events, setEvents] = useState<Event[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await authenticatedFetch(`/api/events?date=${date}`);
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    setIsAdding(true);
    try {
      const response = await authenticatedFetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, title, description, startTime, endTime }),
      });

      if (response.ok) {
        setTitle("");
        setDescription("");
        setStartTime("");
        setEndTime("");
        fetchEvents(); // Refresh list
      }
    } catch (error) {
      console.error("Failed to add event:", error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", alignItems: "flex-start" }}>
      
      {/* Left List */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <h2 className="gradient-text" style={{ fontSize: "2rem", margin: 0 }}>Schedule</h2>
          <input 
            type="date" 
            className="input-field" 
            style={{ width: "auto" }}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {loading ? (
          <div style={{ color: "var(--text-secondary)" }}>Loading events...</div>
        ) : events.length === 0 ? (
          <div className="glass-panel" style={{ textAlign: "center", color: "var(--text-secondary)" }}>
            No events scheduled for this day.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {events.map((event) => (
              <div key={event.id} className="glass-panel" style={{ padding: "16px" }}>
                <h3 style={{ margin: "0 0 8px 0", color: "white" }}>{event.title}</h3>
                {event.description && <p style={{ color: "var(--text-secondary)", margin: "0 0 12px 0", fontSize: "0.9rem" }}>{event.description}</p>}
                
                <div style={{ display: "flex", gap: "16px", fontSize: "0.85rem", color: "var(--accent-primary)", fontWeight: "bold" }}>
                  {event.startTime && <span>Start: {event.startTime}</span>}
                  {event.endTime && <span>End: {event.endTime}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Form */}
      <div className="glass-panel" style={{ position: "sticky", top: "100px" }}>
        <h3 style={{ margin: "0 0 24px 0", color: "white" }}>Add Event</h3>
        <form onSubmit={handleAddEvent} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "8px", color: "var(--text-secondary)", fontSize: "0.9rem" }}>Event Title</label>
            <input 
              type="text" 
              className="input-field" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required 
            />
          </div>
          
          <div>
            <label style={{ display: "block", marginBottom: "8px", color: "var(--text-secondary)", fontSize: "0.9rem" }}>Description (Optional)</label>
            <textarea 
              className="input-field" 
              rows={3} 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              style={{ resize: "vertical" }}
            />
          </div>

          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: "8px", color: "var(--text-secondary)", fontSize: "0.9rem" }}>Start Time</label>
              <input 
                type="time" 
                className="input-field" 
                value={startTime} 
                onChange={(e) => setStartTime(e.target.value)} 
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: "8px", color: "var(--text-secondary)", fontSize: "0.9rem" }}>End Time</label>
              <input 
                type="time" 
                className="input-field" 
                value={endTime} 
                onChange={(e) => setEndTime(e.target.value)} 
              />
            </div>
          </div>

          <button type="submit" className="primary-button" style={{ marginTop: "16px", width: "100%" }} disabled={isAdding || !title}>
            {isAdding ? "Adding..." : "Add Event"}
          </button>
        </form>
      </div>

    </div>
  );
}
