# Productivity Tracker Architecture

## 1. Overview
The application is a frontend-heavy productivity tracker providing a daily section-based dashboard and a calendar view. Built with React and TypeScript, styling uses a custom Vanilla CSS design system.

## 2. Core Components
- **Dashboard**: A goal-tracking board divided into five daily segments (Before breakfast, lunch, gym, dinner, sleep). Supports multi-goal management, completion toggling, and segment migration.
- **Calendar**: A view for scheduling events and appointments.
- **Analytics**: Visualization of productivity data (completion rates, segment distribution) using Recharts.

## 3. Data Layer
To decouple the UI from data persistence, we use the Repository/Factory pattern:
- **`Goal` & `Event` Models**: Define the core data structures.
- **`IDatabase` Interface**: Operations for CRUD on Goals and Events.
- **`DatabaseFactory`**: Manages the database instance.
- **`MockDatabase`**: In-memory storage for rapid design iteration.
- **`MongoDatabase` (Upcoming)**: MongoDB integration via Mongoose (connection string ready in `.env`).

## 4. UI/UX
- **Framework**: Next.js (App Router).
- **Styling**: Vanilla CSS with a focus on vibrant aesthetics, glassmorphism, and responsive layouts.
- **Analytics**: Recharts for data visualization.
