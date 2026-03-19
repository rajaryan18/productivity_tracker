"use client";

import { useEffect, useState, useCallback } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface AnalyticsData {
  date: string;
  totalGoals: number;
  completedGoals: number;
  completionRate: number;
  segmentBreakdown: { segment: string; total: number; completed: number }[];
}

const COLORS = ["#10b981", "#ef4444"]; // Green for done, Red for pending

export default function AnalyticsView() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics?date=${date}`);
      if (response.ok) {
        setData(await response.json());
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) return <div style={{ textAlign: "center", color: "var(--text-secondary)" }}>Loading stats...</div>;
  if (!data) return <div style={{ textAlign: "center", color: "var(--text-secondary)" }}>No data available.</div>;

  const pieData = [
    { name: "Completed", value: data.completedGoals },
    { name: "Pending", value: data.totalGoals - data.completedGoals },
  ];

  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
        <div>
          <h2 className="gradient-text" style={{ fontSize: "2.5rem", margin: 0 }}>Analytics Overview</h2>
          <p style={{ color: "var(--text-secondary)", marginTop: "4px" }}>Visualizing your productivity and goals</p>
        </div>
        <input 
          type="date" 
          className="input-field" 
          style={{ width: "auto" }}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
        {/* Summary Card */}
        <div className="glass-panel" style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "300px" }}>
          <h3 style={{ color: "var(--text-secondary)", marginBottom: "16px", fontSize: "1.1rem" }}>Completion Rate</h3>
          <h1 style={{ fontSize: "5rem", margin: 0, background: "linear-gradient(135deg, #60a5fa, #a78bfa, #f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            {data.completionRate}%
          </h1>
          <div style={{ marginTop: "24px", padding: "8px 20px", background: "rgba(255,255,255,0.05)", borderRadius: "30px", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            {data.completedGoals} of {data.totalGoals} goals complete
          </div>
        </div>

        {/* Pie Chart */}
        <div className="glass-panel" style={{ height: "300px" }}>
          <h3 style={{ textAlign: "center", color: "white", marginBottom: "20px", fontSize: "1.1rem" }}>Status Distribution</h3>
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie
                data={pieData}
                innerRadius={70}
                outerRadius={90}
                paddingAngle={8}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ background: "rgba(18, 18, 18, 0.9)", border: "1px solid var(--border-color)", borderRadius: "12px" }}
                itemStyle={{ color: "white" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="glass-panel" style={{ gridColumn: "1 / -1", minHeight: "450px" }}>
          <div style={{ marginBottom: "32px" }}>
            <h3 style={{ color: "white", fontSize: "1.1rem", marginBottom: "4px" }}>Activity by Section</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>Tracking productivity across time periods</p>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data.segmentBreakdown} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <XAxis 
                dataKey="segment" 
                stroke="var(--text-secondary)" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis 
                stroke="var(--text-secondary)" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                contentStyle={{ background: "rgba(18, 18, 18, 0.9)", border: "1px solid var(--border-color)", borderRadius: "12px" }}
              />
              <Bar dataKey="completed" stackId="a" fill="var(--accent-primary)" radius={[0, 0, 0, 0]} name="Completed" />
              <Bar dataKey="pending" stackId="a" fill="rgba(255,255,255,0.05)" radius={[6, 6, 0, 0]} name="Pending" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
