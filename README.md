# SkillSwap – A Skill Exchange Platform

**SkillSwap** is a full-stack peer-to-peer web application where learners and mentors exchange skills with one another without monetary transactions. One user can teach Python and learn Web Design or Spanish in return from another community member.

---

## 🌟 Features

- **Peer-to-Peer Skill Exchange**: Discover community members, propose skill swaps, and exchange knowledge directly.
- **Interactive Explore & Search**: Real-time keyword search and category filtering across Programming, Design, Languages, Marketing, Music, and Business.
- **Request Management**: Send, receive, accept, or reject skill exchange requests with real-time status tracking.
- **Personal Dashboard**: View skills offered, skills wanted, active exchange metrics, and recent activities.
- **Profile Customization**: Add, remove, and manage the skills you teach and the skills you are eager to learn.
- **Secure Authentication**: User signup and login powered by JWT (JSON Web Tokens) and bcrypt password hashing.

---

## 🛠️ Technologies Used

### Frontend
- **React.js** (Functional Components & Hooks)
- **Vite** (Next-generation frontend tooling)
- **JavaScript (ES6+)**
- **HTML5 & CSS3** (Custom modular stylesheets, light blue-purple aesthetic)
- **React Router DOM** (Client-side page navigation)
- **Axios** (HTTP client for backend REST API communication)
- **Lucide React** (Clean, modern iconography)

### Backend
- **Node.js** (JavaScript runtime environment)
- **Express.js** (Fast, minimalist backend web framework)
- **MongoDB Atlas** (Cloud-hosted NoSQL database)
- **Mongoose** (Elegant MongoDB object modeling)
- **JSON Web Tokens (JWT)** (Stateless user authentication)
- **bcryptjs** (Password hashing and verification)
- **dotenv** (Environment variable management)
- **CORS** (Cross-Origin Resource Sharing middleware)

---

## 📁 Project Folder Structure

```text
SkillSwap/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── SkillCard.jsx
│   │   │   └── RequestCard.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ExploreSkills.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── MyRequests.jsx
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   ├── styles/
│   │   │   ├── Navbar.css
│   │   │   ├── Home.css
│   │   │   ├── Auth.css
│   │   │   ├── Dashboard.css
│   │   │   ├── ExploreSkills.css
│   │   │   └── Profile.css
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── config/
│   │   └── db.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Skill.js
│   │   └── Request.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── skillController.js
│   │   └── requestController.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── skillRoutes.js
│   │   └── requestRoutes.js
│   │
│   ├── middleware/
│   │   └── authMiddleware.js
│   │
│   ├── .env
│   ├── .env.example
│   ├── server.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## ⚙️ Setup Instructions

### Prerequisites
Make sure you have installed on your computer:
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- [npm](https://www.npmjs.com/) (bundled with Node.js)
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account

---

### 1. Backend Setup

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
     *(On Windows Command Prompt, use `copy .env.example .env`)*
   - Open `.env` and fill in your values:
     ```env
     PORT=5000
     MONGO_URI=your_mongodb_atlas_connection_string
     JWT_SECRET=your_jwt_secret_key_here
     ```

4. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend API will run on `http://localhost:5000`.

---

### 2. Frontend Setup

1. Open a new terminal window and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend application will run on `http://localhost:5173` (or `http://localhost:5174`).

---

## 🍃 MongoDB Atlas Configuration Guide

1. Log in to [MongoDB Atlas](https://account.mongodb.com/account/login).
2. Create a free shared cluster (e.g. M0 tier).
3. Under **Security > Database Access**:
   - Click **Add New Database User**.
   - Choose **Password** authentication, create a username and strong password, and select **Read and write to any database**.
4. Under **Security > Network Access**:
   - Click **Add IP Address**.
   - Click **Allow Access from Anywhere** (`0.0.0.0/0`) for development.
5. In your cluster dashboard, click **Connect**:
   - Select **Drivers** (Node.js).
   - Copy the connection string format:
     ```
     mongodb+srv://<username>:<password>@cluster0.mongodb.net/skillswap?retryWrites=true&w=majority
     ```
   - Replace `<username>` and `<password>` with your database user credentials.
   - Paste the connection string into `backend/.env` as `MONGO_URI`.

---

## 🚀 API Endpoint Reference

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user account | Public |
| `POST` | `/api/auth/login` | Log in and receive JWT token | Public |
| `GET` | `/api/auth/profile` | Get logged-in user profile | Private (JWT) |
| `PUT` | `/api/auth/profile` | Update profile information | Private (JWT) |
| `GET` | `/api/skills` | Explore skills with search/filter | Public |
| `GET` | `/api/skills/:id` | Get single skill details | Public |
| `POST` | `/api/skills` | Create a new skill listing | Private (JWT) |
| `GET` | `/api/skills/user` | Get skills created by logged-in user | Private (JWT) |
| `DELETE` | `/api/skills/:id` | Delete an offered skill | Private (JWT) |
| `POST` | `/api/requests` | Send a skill exchange proposal | Private (JWT) |
| `GET` | `/api/requests/received` | View incoming exchange requests | Private (JWT) |
| `GET` | `/api/requests/sent` | View outgoing exchange requests | Private (JWT) |
| `PUT` | `/api/requests/:id/status` | Accept or reject a request | Private (JWT) |

---

## 💻 Commands Summary

| Action | Command | Directory |
|---|---|---|
| Run Backend (Development) | `npm run dev` | `SkillSwap/backend` |
| Run Backend (Production) | `npm start` | `SkillSwap/backend` |
| Run Frontend (Development) | `npm run dev` | `SkillSwap/frontend` |
| Build Frontend (Production) | `npm run build` | `SkillSwap/frontend` |
| Lint Frontend | `npm run lint` | `SkillSwap/frontend` |
