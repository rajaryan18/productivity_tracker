"use client";

import { useState } from "react";
import { Goal, TimeSegment, GoalClassification } from "@/lib/data/models";
import { authenticatedFetch } from "@/lib/api";

const SEGMENTS: TimeSegment[] = [
  "Before breakfast",
  "Before lunch",
  "Before gym",
  "Before dinner",
  "Before sleep",
];

const SEGMENT_ICONS: Record<TimeSegment, string> = {
  "Before breakfast": "🌅",
  "Before lunch": "☀️",
  "Before gym": "💪",
  "Before dinner": "🌙",
  "Before sleep": "💤",
};

const SEGMENT_COLORS: Record<TimeSegment, string> = {
  "Before breakfast": "#f59e0b",
  "Before lunch": "#3b82f6",
  "Before gym": "#10b981",
  "Before dinner": "#8b5cf6",
  "Before sleep": "#6366f1",
};

interface SegmentBoardProps {
  segment: TimeSegment;
  goals: Goal[];
  date: string;
  onGoalUpdated: () => void;
}

export default function SegmentBoard({ segment, goals, date, onGoalUpdated }: SegmentBoardProps) {
  const [newGoalText, setNewGoalText] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [classifyingGoalId, setClassifyingGoalId] = useState<string | null>(null);

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;

    setIsAdding(true);
    try {
      const response = await authenticatedFetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, segment, text: newGoalText }),
      });
      if (response.ok) {
        setNewGoalText("");
        onGoalUpdated();
      }
    } catch (error) {
      console.error("Failed to add goal:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggle = async (goal: Goal) => {
    if (goal.isCompleted) {
      // Direct un-complete
      await updateGoalStatus(goal.id, { isCompleted: false, classification: "none" });
    } else {
      // Start classification process
      setClassifyingGoalId(goal.id);
    }
  };

  const updateGoalStatus = async (id: string, updates: Partial<Pick<Goal, "isCompleted" | "classification">>) => {
    try {
      const response = await authenticatedFetch("/api/goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      });
      if (response.ok) {
        onGoalUpdated();
        setClassifyingGoalId(null);
      }
    } catch (error) {
      console.error("Failed to update goal:", error);
    }
  };

  const handleMoveSegment = async (goal: Goal, newSegment: TimeSegment) => {
    try {
      const response = await authenticatedFetch("/api/goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: goal.id, segment: newSegment }),
      });
      if (response.ok) onGoalUpdated();
    } catch (error) {
      console.error("Failed to move goal:", error);
    }
  };

  const handleDelete = async (goalId: string) => {
    if (!confirm("Delete this goal?")) return;
    try {
      const response = await authenticatedFetch(`/api/goals?id=${goalId}`, { method: "DELETE" });
      if (response.ok) onGoalUpdated();
    } catch (error) {
      console.error("Failed to delete goal:", error);
    }
  };

  const completedCount = goals.filter(g => g.isCompleted).length;
  const progressPercentage = goals.length > 0 ? (completedCount / goals.length) * 100 : 0;

  return (
    <div className="glass-panel" style={{ 
      height: "100%", 
      display: "flex", 
      flexDirection: "column",
      borderLeft: `4px solid ${SEGMENT_COLORS[segment] || "var(--accent-primary)"}`
    }}>
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "1.4rem" }}>{SEGMENT_ICONS[segment]}</span>
            {segment}
          </h3>
          <span style={{ 
            fontSize: "0.8rem", 
            fontWeight: "700", 
            padding: "4px 10px", 
            borderRadius: "100px", 
            background: "rgba(255,255,255,0.05)",
            color: progressPercentage === 100 ? "var(--accent-secondary)" : "var(--text-secondary)"
          }}>
            {completedCount} / {goals.length}
          </span>
        </div>
        <div style={{ width: "100%", height: "3px", background: "rgba(255,255,255,0.03)", borderRadius: "10px", overflow: "hidden" }}>
          <div style={{ 
            width: `${progressPercentage}%`, 
            height: "100%", 
            background: SEGMENT_COLORS[segment] || "var(--accent-primary)",
            transition: "width 0.4s ease"
          }} />
        </div>
      </div>
      
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
        {goals.map((goal) => (
          <div key={goal.id} className="goal-item animate-slide-in" style={{ 
            display: "flex", 
            flexDirection: "column",
            gap: "8px",
            padding: "12px 16px", 
            background: "rgba(255,255,255,0.02)",
            borderRadius: "16px",
            border: "1px solid var(--border-color)",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%" }}>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input 
                  type="checkbox" 
                  checked={goal.isCompleted} 
                  onChange={() => handleToggle(goal)}
                  style={{ 
                    width: "20px", 
                    height: "20px", 
                    cursor: "pointer",
                    accentColor: SEGMENT_COLORS[segment],
                  }}
                />
              </div>
              
              <span style={{ 
                flex: 1, 
                color: goal.isCompleted ? "var(--text-muted)" : "white",
                textDecoration: goal.isCompleted ? "line-through" : "none",
                fontSize: "0.95rem",
                fontWeight: "400",
                opacity: goal.isCompleted ? 0.6 : 1,
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                {goal.text}
                {goal.isCompleted && goal.classification && (
                  <span style={{ 
                    fontSize: "0.75rem", 
                    padding: "2px 8px", 
                    borderRadius: "4px", 
                    background: goal.classification === "productive" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                    color: goal.classification === "productive" ? "#10b981" : "#ef4444",
                    fontWeight: "600",
                    textTransform: "capitalize"
                  }}>
                    {goal.classification === "productive" ? "🚀 Productive" : "🗑️ Waste"}
                  </span>
                )}
              </span>

              <div style={{ display: "flex", gap: "6px", opacity: 0.4, transition: "opacity 0.2s" }} className="goal-actions">
                <select 
                  value={goal.segment}
                  onChange={(e) => handleMoveSegment(goal, e.target.value as TimeSegment)}
                  className="input-field"
                  style={{ width: "28px", padding: "4px", fontSize: "0.7rem", background: "transparent", border: "none", borderRadius: "6px", cursor: "pointer" }}
                  title="Move to segment"
                >
                  {SEGMENTS.map(s => <option key={s} value={s}>{SEGMENT_ICONS[s]}</option>)}
                </select>

                <button 
                  onClick={() => handleDelete(goal.id)}
                  style={{ 
                    background: "transparent", 
                    border: "none", 
                    color: "#ef4444", 
                    cursor: "pointer", 
                    padding: "4px",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.9rem"
                  }}
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            </div>

            {classifyingGoalId === goal.id && (
              <div className="animate-fade-in" style={{ 
                display: "flex", 
                gap: "8px", 
                marginTop: "4px", 
                padding: "8px", 
                background: "rgba(255,255,255,0.03)", 
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.05)"
              }}>
                <button 
                  onClick={() => updateGoalStatus(goal.id, { isCompleted: true, classification: "productive" })}
                  className="primary-button"
                  style={{ 
                    flex: 1, 
                    padding: "6px", 
                    fontSize: "0.8rem", 
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)"
                  }}
                >
                  🚀 Productive
                </button>
                <button 
                  onClick={() => updateGoalStatus(goal.id, { isCompleted: true, classification: "waste" })}
                  className="primary-button"
                  style={{ 
                    flex: 1, 
                    padding: "6px", 
                    fontSize: "0.8rem", 
                    background: "linear-gradient(135deg, #ef4444, #dc2626)",
                    boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)"
                  }}
                >
                  🗑️ Time Waste
                </button>
                <button 
                  onClick={() => setClassifyingGoalId(null)}
                  style={{ 
                    padding: "6px 10px", 
                    border: "none", 
                    background: "transparent", 
                    color: "var(--text-secondary)", 
                    cursor: "pointer",
                    fontSize: "0.8rem"
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))}
        {goals.length === 0 && (
          <div style={{ 
            height: "100px", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            border: "2px dashed rgba(255,255,255,0.03)",
            borderRadius: "20px",
            color: "var(--text-muted)",
            fontSize: "0.85rem",
            fontStyle: "italic"
          }}>
            Empty segment
          </div>
        )}
      </div>

      <form onSubmit={handleAddGoal} style={{ display: "flex", gap: "8px", position: "relative" }}>
        <input
          type="text"
          className="input-field"
          placeholder="New goal..."
          style={{ paddingRight: "40px", fontSize: "0.9rem" }}
          value={newGoalText}
          onChange={(e) => setNewGoalText(e.target.value)}
          disabled={isAdding}
        />
        <button 
          type="submit" 
          disabled={isAdding || !newGoalText.trim()}
          style={{
            position: "absolute",
            right: "8px",
            top: "50%",
            transform: "translateY(-50%)",
            background: SEGMENT_COLORS[segment],
            color: "white",
            border: "none",
            width: "28px",
            height: "28px",
            borderRadius: "8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.2rem",
            fontWeight: "bold"
          }}
        >
          {isAdding ? "..." : "+"}
        </button>
      </form>
    </div>
  );
}
