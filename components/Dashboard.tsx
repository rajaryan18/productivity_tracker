"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Goal, TimeSegment } from "@/lib/data/models";
import SegmentBoard from "./SegmentBoard";
import Link from "next/link";
import { authenticatedFetch } from "@/lib/api";

const SEGMENTS: TimeSegment[] = [
  "Before breakfast",
  "Before lunch",
  "Before gym",
  "Before dinner",
  "Before sleep",
];

export default function Dashboard() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);
  const [recurringGoals, setRecurringGoals] = useState<any[]>([]);
  const [showRecurringManager, setShowRecurringManager] = useState(false);
  const [newRecurringText, setNewRecurringText] = useState("");
  const [newRecurringSegment, setNewRecurringSegment] = useState<TimeSegment>("Before breakfast");
  const [newRecurringStart, setNewRecurringStart] = useState(new Date().toISOString().split("T")[0]);
  const [newRecurringEnd, setNewRecurringEnd] = useState("");
  const [isAlwaysRecurring, setIsAlwaysRecurring] = useState(true);

  const fetchGoals = useCallback(async () => {
    if (goals.length === 0) setLoading(true);
    try {
      const response = await authenticatedFetch(`/api/goals?date=${date}`);
      if (response.ok) {
        const data = await response.json();
        setGoals(data);
      }
    } catch (error) {
      console.error("Failed to fetch goals:", error);
    } finally {
      setLoading(false);
    }
  }, [date]);

  const fetchRecurringGoals = useCallback(async () => {
    try {
      const response = await authenticatedFetch("/api/recurring-goals");
      if (response.ok) setRecurringGoals(await response.json());
    } catch (error) {
      console.error("Failed to fetch recurring goals:", error);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
    fetchRecurringGoals();
  }, [fetchGoals, fetchRecurringGoals]);

  // Sync recurring goals for today
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];

    // Sync with Local Storage for indefinite goals
    if (recurringGoals.length > 0) {
      const alwaysRecurring = recurringGoals.filter(rg => rg.isAlwaysRecurring);
      localStorage.setItem("recurring-goals-templates", JSON.stringify(alwaysRecurring));
    }

    if (date === today && recurringGoals.length > 0 && goals.length >= 0 && !loading) {
      const syncRecurring = async () => {
        let needsUpdate = false;

        // Fetch indefinite goals from localStorage as secondary source (following user request)
        const localTemplatesStr = localStorage.getItem("recurring-goals-templates");
        const templates = localTemplatesStr ? JSON.parse(localTemplatesStr) : [];

        // Merge server and local templates (de-duplicated)
        const combined = [...recurringGoals];
        templates.forEach((t: any) => {
          if (!combined.find(c => c.id === t.id)) combined.push(t);
        });

        for (const rg of combined) {
          const start = new Date(rg.startDate);
          const current = new Date(today);
          const end = rg.endDate ? new Date(rg.endDate) : null;

          if (current >= start && (!end || current <= end)) {
            const exists = goals.find(g => g.text === rg.text && g.segment === rg.segment);
            if (!exists) {
              needsUpdate = true;
              await authenticatedFetch("/api/goals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date: today, segment: rg.segment, text: rg.text }),
              });
            }
          }
        }
        if (needsUpdate) fetchGoals();
      };
      syncRecurring();
    }
  }, [date, recurringGoals, goals, loading, fetchGoals]);

  const handleAddRecurring = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecurringText.trim()) return;
    try {
      const response = await authenticatedFetch("/api/recurring-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: newRecurringText,
          segment: newRecurringSegment,
          startDate: newRecurringStart,
          endDate: isAlwaysRecurring ? null : newRecurringEnd,
          isAlwaysRecurring
        }),
      });
      if (response.ok) {
        setNewRecurringText("");
        setIsAlwaysRecurring(true);
        fetchRecurringGoals();
      }
    } catch (error) {
      console.error("Failed to add recurring goal:", error);
    }
  };

  const handleDeleteRecurring = async (id: string) => {
    try {
      const response = await authenticatedFetch(`/api/recurring-goals?id=${id}`, { method: "DELETE" });
      if (response.ok) fetchRecurringGoals();
    } catch (error) {
      console.error("Failed to delete recurring goal:", error);
    }
  };

  const stats = useMemo(() => {
    const total = goals.length;
    const completed = goals.filter((g) => g.isCompleted).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  }, [goals]);

  const getGoalsForSegment = (segment: TimeSegment) => {
    return goals.filter((g) => g.segment === segment);
  };

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="animate-fade-in" style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 20px" }}>
      <header style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: "48px",
        paddingTop: "20px"
      }}>
        <div>
          <p style={{ color: "var(--accent-primary)", fontWeight: "600", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>
            {formattedDate}
          </p>
          <h1 className="gradient-text" style={{ fontSize: "3rem", margin: 0, filter: "drop-shadow(0 0 20px rgba(59, 130, 246, 0.2))" }}>
            Daily Focus
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            onClick={() => setShowRecurringManager(true)}
            className="glass-panel"
            style={{
              padding: "10px 18px",
              borderRadius: "14px",
              color: "var(--accent-primary)",
              fontWeight: "700",
              fontSize: "0.9rem",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.3s ease",
              border: "1px solid rgba(59, 130, 246, 0.2)",
              cursor: "pointer",
              background: "transparent"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(59, 130, 246, 0.1)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            <span>🔄</span> Recurring
          </button>
          <Link href="/insights" className="glass-panel" style={{
            padding: "10px 18px",
            borderRadius: "14px",
            color: "var(--accent-secondary)",
            fontWeight: "700",
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.3s ease",
            border: "1px solid rgba(16, 185, 129, 0.2)"
          }} onMouseEnter={(e) => e.currentTarget.style.background = "rgba(16, 185, 129, 0.1)"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
            <span>📊</span> Insights
          </Link>
          <div className="glass-panel" style={{ padding: "12px 20px", borderRadius: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontWeight: "500" }}>Select Date:</span>
            <input
              type="date"
              className="input-field"
              style={{ width: "auto", border: "none", background: "transparent", padding: "4px", fontSize: "1rem", fontWeight: "600", color: "white", cursor: "pointer" }}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>
      </header>

      {showRecurringManager && (
        <div style={{ 
          position: "fixed", 
          inset: 0, 
          background: "rgba(0,0,0,0.9)", // Darker backdrop
          backdropFilter: "blur(15px)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px"
        }} onClick={() => setShowRecurringManager(false)}>
          <div className="glass-panel animate-scale-in" style={{ 
            width: "100%", 
            maxWidth: "600px", 
            padding: "40px", 
            maxHeight: "80vh", 
            overflowY: "auto",
            position: "relative",
            background: "rgba(15, 23, 42, 0.95)", // Much more opaque background (Slate 900)
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            border: "1px solid rgba(255, 255, 255, 0.1)"
          }} onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowRecurringManager(false)}
              style={{ position: "absolute", top: "20px", right: "20px", background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.5rem" }}
            >✕</button>
            <h2 className="gradient-text" style={{ fontSize: "2rem", marginBottom: "24px" }}>Recurring Goals</h2>

            <form onSubmit={handleAddRecurring} style={{ display: "flex", gap: "12px", marginBottom: "32px", flexDirection: "column" }}>
              <div style={{ display: "flex", gap: "12px" }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Task name"
                  value={newRecurringText}
                  onChange={e => setNewRecurringText(e.target.value)}
                  style={{ flex: 2 }}
                />
                <select
                  className="input-field"
                  value={newRecurringSegment}
                  onChange={e => setNewRecurringSegment(e.target.value as TimeSegment)}
                  style={{ flex: 1.5 }}
                >
                  {SEGMENTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Start Date</label>
                  <input type="date" className="input-field" value={newRecurringStart} onChange={e => setNewRecurringStart(e.target.value)} />
                </div>
                {!isAlwaysRecurring && (
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>End Date</label>
                    <input type="date" className="input-field" value={newRecurringEnd} onChange={e => setNewRecurringEnd(e.target.value)} />
                  </div>
                )}
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", cursor: "pointer", marginTop: "12px" }}>
                <input type="checkbox" checked={isAlwaysRecurring} onChange={e => setIsAlwaysRecurring(e.target.checked)} />
                Always recurring
              </label>
              <button type="submit" className="primary-button" style={{ width: "100%", marginTop: "12px" }}>Schedule Recurring Task</button>
            </form>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {recurringGoals.map(rg => (
                <div key={rg.id} className="glass-panel" style={{ padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.03)" }}>
                  <div>
                    <div style={{ fontWeight: "600" }}>{rg.text}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      {rg.segment} • {rg.isAlwaysRecurring ? "Always" : `${rg.startDate} to ${rg.endDate}`}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteRecurring(rg.id)}
                    style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", padding: "8px" }}
                  >✕</button>
                </div>
              ))}
              {recurringGoals.length === 0 && (
                <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "20px" }}>No recurring goals set yet.</div>
              )}
            </div>
          </div>
        </div>
      )}

      <section className="stats-container">
        <div className="glass-panel stat-card">
          <div className="stat-label">Total Goals</div>
          <div className="stat-value text-glow">{stats.total}</div>
        </div>
        <div className="glass-panel stat-card">
          <div className="stat-label">Completed</div>
          <div className="stat-value" style={{ color: "var(--accent-secondary)" }}>{stats.completed}</div>
        </div>
        <div className="glass-panel stat-card">
          <div className="stat-label">Progress</div>
          <div className="stat-value" style={{ color: "var(--accent-tertiary)" }}>{stats.percentage}%</div>
          <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "10px", marginTop: "12px", overflow: "hidden" }}>
            <div style={{
              width: `${stats.percentage}%`,
              height: "100%",
              background: "linear-gradient(90deg, var(--accent-secondary), var(--accent-tertiary))",
              borderRadius: "10px",
              transition: "width 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)"
            }} />
          </div>
        </div>
      </section>

      {loading ? (
        <div style={{ textAlign: "center", padding: "80px", color: "var(--text-secondary)", fontSize: "1.2rem", fontWeight: "300" }}>
          <div className="animate-pulse" style={{ marginBottom: "16px" }}>Refining your agenda...</div>
        </div>
      ) : (
        <div className="card-grid">
          {SEGMENTS.map((segment, index) => (
            <div key={`${date}-${segment}`} style={{ animationDelay: `${index * 0.1}s` }} className="animate-fade-in">
              <SegmentBoard
                segment={segment}
                date={date}
                goals={getGoalsForSegment(segment)}
                onGoalUpdated={fetchGoals}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
