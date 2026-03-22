# CoachAction 🚀

A high-performance, premium SaaS platform tailored for coaching centers and private institutions. **CoachAction** provides a clean, intentional interface to manage students, track engagement, and optimize revenue through strategic insights.

![CoachAction Dashboard](https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426&ixlib=rb-4.0.3)

---

## ✨ Strategic Advantages

*   **Executive Overview**: Real-time briefing on revenue, growth streak, and critical alerts.
*   **Operational Leak Detection**: Algorithmic engine that identifies missing revenue and at-risk students.
*   **Engagement History**: Visual analytics for individual student commitment and attendance.
*   **Financial Ledger**: Simplified tracking of pending fees with one-click collection reminders.
*   **Premium Soft UI**: Immersive, macOS-inspired interface optimized for focus and long-term usage.

---

## 🛠 Technology Architecture

### **Core Stack**
- **Frontend**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/), [Tailwind CSS 4.0](https://tailwindcss.com/)
- **Backend**: [Node.js](https://nodejs.org/), [Express](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/)
- **Analytics**: [Recharts](https://recharts.org/) for data visualization

### **Key Features**
- **JWT-based Authentication**: Secure session management with encrypted token storage.
- **Responsive Management**: Fluid layouts that adapt from ultra-wide desktops to mobile devices (320px).
- **Proactive Growth Engine**: Automated advice based on inquiry conversion and retention rates.

---

## 🚦 Getting Started

### **Prerequisites**
- Node.js (v20+)
- MongoDB (Local or Atlas Atlas)

### **1. Clone the repository**
```bash
git clone https://github.com/SIFLE69/CoachAction.git
cd CoachAction
```

### **2. Backend Setup**
Navigate to the server directory and install dependencies:
```bash
cd server
npm install
```
Create a `.env` file in the root of the `/server` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_strategic_secret_key
```
Start the server:
```bash
npm start
```

### **3. Frontend Setup**
Navigate to the client directory and install dependencies:
```bash
cd ../client
npm install
```
Start the development server:
```bash
npm run dev
```

---

## 🌍 Deployment

The application is architected for separate deployment of frontend (Vercel/Netlify) and backend (DigitalOcean/Railway). Ensure the frontend environment variables point to the correct production API endpoint.

---

## 🤝 Contributing

Contributions are welcome! Please ensure all UI modifications follow the **Soft UI** and **Typography Standards** documented in the `index.css` design system.

---

## ⚖️ License

Built with ❤️ for High-Density Strategic Management.
© 2026 CoachAction Technologies.
