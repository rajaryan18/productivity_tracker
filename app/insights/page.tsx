"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell
} from "recharts";

const COLORS = ["#10b981", "#ef4444"];

interface InsightData {
  name: string;
  productive: number;
  waste: number;
  none: number;
}

interface WeeklyInsightData {
  date: string;
  productive: number;
  waste: number;
  none: number;
}

export default function InsightsPage() {
  const [dailyData, setDailyData] = useState<InsightData[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyInsightData[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 6);
  const startDate = lastWeek.toISOString().split("T")[0];

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [dailyRes, weeklyRes] = await Promise.all([
          fetch(`/api/insights?type=daily&date=${today}`),
          fetch(`/api/insights?type=weekly&startDate=${startDate}&endDate=${today}`)
        ]);

        if (dailyRes.ok) setDailyData(await dailyRes.json());
        if (weeklyRes.ok) setWeeklyData(await weeklyRes.json());
      } catch (error) {
        console.error("Failed to fetch insight data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [today, startDate]);

  const totalProductive = dailyData.reduce((acc, curr) => acc + curr.productive, 0);
  const totalWaste = dailyData.reduce((acc, curr) => acc + curr.waste, 0);
  const overallEfficiency = totalProductive + totalWaste > 0
    ? Math.round((totalProductive / (totalProductive + totalWaste)) * 100)
    : 0;

  const pieData = [
    { name: "Productive", value: totalProductive },
    { name: "Waste", value: totalWaste }
  ];

  if (loading) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--background-dark)" }}>
        <div className="animate-pulse" style={{ color: "var(--accent-primary)", fontSize: "1.5rem", fontWeight: "300" }}>
          Analyzing your productivity patterns...
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: "1400px", margin: "0 auto", padding: "40px 20px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "48px" }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: "3rem", marginBottom: "8px" }}>Productivity Insights</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>Understand where your time goes and optimize your focus.</p>
        </div>
        <Link href="/" className="primary-button" style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid var(--border-color)",
          padding: "12px 24px",
          borderRadius: "14px"
        }}>
          &larr; Back to Dashboard
        </Link>
      </header>

      <div className="stats-container" style={{ marginBottom: "40px" }}>
        <div className="glass-panel stat-card">
          <div className="stat-label">Daily Efficiency</div>
          <div className="stat-value text-glow" style={{ color: "var(--accent-secondary)" }}>{overallEfficiency}%</div>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "8px" }}>Productive vs Total completed today</p>
        </div>
        <div className="glass-panel stat-card">
          <div className="stat-label">Tasks Today</div>
          <div className="stat-value">{totalProductive + totalWaste}</div>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "8px" }}>Classified tasks today</p>
        </div>
        <div className="glass-panel stat-card">
          <div className="stat-label">Top Session</div>
          <div className="stat-value" style={{ fontSize: "1.8rem", color: "var(--accent-primary)" }}>
            {dailyData.sort((a, b) => b.productive - a.productive)[0]?.name.split(' ')[1] || "N/A"}
          </div>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "8px" }}>Most productive time of day</p>
        </div>
      </div>

      <div className="card-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(600px, 1fr))", gap: "32px" }}>
        <div className="glass-panel" style={{ padding: "32px", minHeight: "450px" }}>
          <h3 style={{ marginBottom: "24px", fontSize: "1.4rem", fontWeight: "700" }}>Todays Sessions</h3>
          <div style={{ width: "100%", height: "350px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickFormatter={(v) => v.split(' ')[1]} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: "rgba(20, 20, 20, 0.9)", border: "1px solid var(--border-color)", borderRadius: "12px" }}
                  itemStyle={{ fontWeight: "600" }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="productive" name="Productive" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="waste" name="Time Waste" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "32px" }}>
          <h3 style={{ marginBottom: "24px", fontSize: "1.4rem", fontWeight: "700" }}>Weekly Trend</h3>
          <div style={{ width: "100%", height: "350px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickFormatter={(v) => v.split('-').slice(1).join('/')} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: "rgba(20, 20, 20, 0.9)", border: "1px solid var(--border-color)", borderRadius: "12px" }}
                />
                <Legend iconType="circle" />
                <Area type="monotone" dataKey="productive" name="Productive" stroke="#10b981" fillOpacity={1} fill="url(#colorProd)" strokeWidth={3} />
                <Area type="monotone" dataKey="waste" name="Time Waste" stroke="#ef4444" fillOpacity={0} strokeWidth={3} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={{ marginTop: "32px", display: "grid", gridTemplateColumns: "1fr 2fr", gap: "32px" }}>
        <div className="glass-panel" style={{ padding: "32px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <h3 style={{ marginBottom: "24px", fontSize: "1.4rem", fontWeight: "700", width: "100%" }}>Task Mix</h3>
          <div style={{ width: "100%", height: "300px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "rgba(20, 20, 20, 0.9)", border: "1px solid var(--border-color)", borderRadius: "12px" }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
