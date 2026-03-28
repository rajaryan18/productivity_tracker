"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Event } from "@/lib/data/models";
import { authenticatedFetch } from "@/lib/api";

const HOUR_HEIGHT = 60; // pixels

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

  const getTimeOffset = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return (hours + minutes / 60) * HOUR_HEIGHT;
  };

  const getDurationHeight = (start: string, end: string) => {
    const startOffset = getTimeOffset(start);
    const endOffset = getTimeOffset(end);
    return Math.max(endOffset - startOffset, 30); // minimum 30px height
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => (a.startTime || "00:00").localeCompare(b.startTime || "00:00"));
  }, [events]);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const isToday = date === new Date().toISOString().split("T")[0];
  const currentTimeOffset = useMemo(() => {
    if (!isToday) return -1;
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    return (hours + minutes / 60) * HOUR_HEIGHT;
  }, [currentTime, isToday]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "32px", alignItems: "flex-start" }}>
      
      {/* Left: Time Grid */}
      <div className="glass-panel" style={{ padding: "24px", position: "relative", overflowX: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <h2 className="gradient-text" style={{ fontSize: "2rem", margin: 0 }}>Schedule</h2>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button 
              className="tab-pill" 
              onClick={() => setDate(new Date().toISOString().split("T")[0])}
              style={{ padding: "6px 12px", fontSize: "0.8rem", height: "auto" }}
            >
              Today
            </button>
            <input 
              type="date" 
              className="input-field" 
              style={{ width: "auto", padding: "8px 16px" }}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ color: "var(--text-secondary)", height: "400px", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading events...</div>
        ) : (
          <div style={{ position: "relative", marginLeft: "60px", borderLeft: "1px solid rgba(255,255,255,0.1)" }}>
            
            {/* Current Time Indicator */}
            {isToday && currentTimeOffset >= 0 && (
              <div style={{ 
                position: "absolute", 
                top: `${currentTimeOffset}px`, 
                left: "-5px", 
                right: 0, 
                height: "2px", 
                backgroundColor: "#ef4444", 
                zIndex: 50,
                pointerEvents: "none"
              }}>
                <div style={{ 
                  position: "absolute", 
                  left: "-10px", 
                  top: "-4px", 
                  width: "10px", 
                  height: "10px", 
                  borderRadius: "50%", 
                  backgroundColor: "#ef4444" 
                }} />
              </div>
            )}

            {/* Hour Grid Lines */}
            {hours.map((hour) => (
              <div key={hour} style={{ height: `${HOUR_HEIGHT}px`, borderBottom: "1px solid rgba(255,255,255,0.05)", position: "relative" }}>
                <span style={{ 
                  position: "absolute", 
                  left: "-60px", 
                  top: "-10px", 
                  fontSize: "0.80rem", 
                  color: "var(--text-secondary)", 
                  width: "50px", 
                  textAlign: "right",
                  fontVariantNumeric: "tabular-nums"
                }}>
                  {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
                </span>
              </div>
            ))}

            {/* Events Area */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
              {sortedEvents.map((event) => {
                if (!event.startTime || !event.endTime) return null;
                const top = getTimeOffset(event.startTime);
                const height = getDurationHeight(event.startTime, event.endTime);
                
                return (
                  <div 
                    key={event.id} 
                    className="glass-panel"
                    style={{ 
                      position: "absolute", 
                      top: `${top}px`, 
                      height: `${height}px`, 
                      left: "4px", 
                      right: "4px", 
                      padding: "8px 12px", 
                      zIndex: 10,
                      backgroundColor: "rgba(var(--accent-primary-rgb), 0.15)",
                      borderLeft: "4px solid var(--accent-primary)",
                      overflow: "hidden",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: height < 40 ? "center" : "flex-start"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.02)";
                      e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.4)";
                      e.currentTarget.style.zIndex = "20";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.zIndex = "10";
                    }}
                  >
                    <div style={{ fontWeight: "bold", fontSize: "0.9rem", color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {event.title}
                    </div>
                    {height > 50 && (
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                        {event.startTime} - {event.endTime}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Right: Add Event Form */}
      <div className="glass-panel" style={{ position: "sticky", top: "100px", padding: "24px" }}>
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
              placeholder="Deep Work Session"
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
              placeholder="Focus on the core engine refactoring"
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
