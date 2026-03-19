# Changelog

## 2026-03-17
- Initiated project planning and core requirements.
- Defined base task breakdown.

## 2026-03-17 (Update)
- Shifted project target to Next.js (App Router) as per user request. Overriding earlier Vite plans.
- Initializing development on the main Next.js layout and directory structure setup.

## 2026-03-17 (Architecture Update)
- Modularized architecture plan to separate UI `components/` from backend API routes `app/api/`. This ensures a clean separation of concerns for the Next.js setup.

## 2026-03-17 (Milestone 2 - Enhanced Dashboard & Analytics)
- Refactored `Log` system to a multi-item `Goal` list per segment.
- Implemented `SegmentBoard` with goal completion, deletion, and segment migration.
- Added `/analytics` page with Pie and Bar charts using `recharts`.
- Updated `IDatabase` and `MockDatabase` to support new interactive features.
- Configured `.env` and prepared for MongoDB integration (delayed for design iteration).
