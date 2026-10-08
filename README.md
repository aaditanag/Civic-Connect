# CivicConnect 🏙️

A **crowdsourced civic issue reporting and resolution system** that empowers citizens to report local problems and enables municipal staff to manage, prioritize, and resolve them efficiently.

---

## 🚀 Features

- **Citizen Portal** — Report issues with photos, GPS location, and detailed descriptions
- **Admin Dashboard** — Manage all issues, approve department staff, and send reminders for stale cases
- **Department Staff View** — Dedicated view for assigned departments to update issue status
- **Interactive Map** — Visual representation of reported issues using Leaflet.js
- **Real-time Status Updates** — Citizens can track progress of their reports
- **Analytics** — Track resolution rates and departmental performance
- **Role-based Access Control** — Citizen / Department Staff / Admin roles with JWT auth

---

## 🛠️ Tech Stack

### Frontend
- **React.js** (Create React App)
- **Tailwind CSS** — Utility-first styling
- **Leaflet / React-Leaflet** — Interactive maps
- **Axios** — API communication
- **React Router v7** — Client-side routing

### Backend
- **Node.js + Express.js** — REST API
- **MongoDB + Mongoose** — Database
- **JWT** — Authentication & authorization
- **Cloudinary** — Image/photo storage
- **Helmet + express-rate-limit** — Security

---

## 📦 Installation & Setup

### Prerequisites
- Node.js ≥ 18
- MongoDB running locally (or a MongoDB Atlas URI)

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/civic-issue-reporter.git
cd civic-issue-reporter
```

### 2. Install frontend dependencies
```bash
npm install
```

### 3. Install backend dependencies
```bash
cd backend
npm install
```

### 4. Configure environment variables
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your MongoDB URI, JWT secret, and Cloudinary credentials
```

### 5. Start the servers

**Backend** (from `/backend`):
```bash
npm run dev      # uses nodemon for hot-reload
# or
npm start        # plain node
```

**Frontend** (from root):
```bash
npm start
```

The frontend runs on `http://localhost:3000` and the backend on `http://localhost:5001`.

---

## 👤 Default Admin Account

On first run, register a user and then manually set their `role` to `"admin"` in MongoDB, or use the provided `backend/reset-admin.js` utility.

---

## 📁 Project Structure

```
civic-issue-reporter/
├── backend/                  # Express API
│   ├── config/               # DB & Cloudinary config
│   ├── controllers/          # Route handlers
│   ├── middleware/           # Auth, upload, validation
│   ├── models/               # Mongoose schemas
│   ├── routes/               # API routes
│   │   ├── auth.js
│   │   ├── issues.js
│   │   ├── departments.js
│   │   └── admin.js
│   └── server.js
├── src/                      # React frontend
│   ├── components/           # Reusable UI components
│   ├── context/              # Auth context
│   ├── hooks/                # Custom hooks
│   ├── pages/                # Page-level components
│   ├── services/             # API service layer
│   └── utils/                # Helpers & constants
├── public/
└── package.json
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📝 License

This project is licensed under the **MIT License**.