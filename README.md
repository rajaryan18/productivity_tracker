# Productivity Tracker & Focus Dashboard 🚀

FocusFlow is a premium, goal-centric productivity application designed to help you reclaim your time and achieve your daily objectives through a structured, segment-based approach.

## 🌟 Key Features

- **Segment-Based Goal Management**: Organize your day into clear time blocks (e.g., *Before breakfast*, *Before gym*) to maintain focus throughout the day.
- **Advanced Recurring Goals**: Automate your habits. Set goals that repeat every day, or define specific ranges with custom start and end dates.
- **Productivity Insights**: Visualize your performance with a dedicated analytics dashboard. Compare "Productive" vs "Time Waste" activities to optimize your efficiency.
- **Premium Glassmorphic UI**: Experience a modern, sleek interface with smooth animations, dark mode elegance, and a responsive design.
- **Hybrid Data Persistence**: Robust integration with MongoDB for cross-device consistency, paired with Browser Local Storage for snappy, offline-resilient habit syncing.

## 🛠️ Built With

- **Frontend**: [Next.js](https://nextjs.org/) (App Router), React, Tailwind CSS
- **Visualization**: [Recharts](https://recharts.org/)
- **Database**: [MongoDB](https://www.mongodb.com/) (Mongoose)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (>= 18.x)
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account or a local MongoDB instance.

### ⚙️ Environment Configuration

Create a `.env` file in the root directory and add the following MongoDB credentials:

```bash
MONGODB_USERNAME=your_username
MONGODB_PASSWORD=your_password
MONGODB_DBNAME=your_db_name
MONGODB_HOST=your_cluster_address (e.g., cluster0.xxxx.mongodb.net)
```

### 📦 Installation

```bash
# Clone the repository
git clone https://github.com/rajaryan18/productivity_tracker.git

# Navigate to the project directory
cd productivity_tracker

# Install dependencies
npm install
```

### 🏃 Running Locally

To start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to start tracking your focus!

---

## 🧹 Maintenance & Best Practices

- **Database Abstraction**: The project uses a `DatabaseFactory` to switch between `MongoDatabase` and `MockDatabase` automatically based on your environment settings.
- **Classification Status**: Most goals default to `none`. Remember to classify them as *Productive* or *Waste* once completed to populate your Insights dashboard accurately.

---

> [!TIP]
> Use the **Recurring Goals** manager to schedule your non-negotiable daily habits (like "Read for 30m" or "Workout"). The app will handle the scheduling so you can focus on the work.
