# 🍽️ FoodieConnect

> **A Modern Social Network for Food Enthusiasts**  
> Connect, share, and discover amazing recipes with fellow food lovers in real-time.

[![React](https://img.shields.io/badge/React-18.0-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.0-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green.svg)](https://mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.0-black.svg)](https://socket.io/)

---

## ✨ Features

- **🍳 Recipe Management** - Advanced search (5+ parameters), media uploads, interactive cooking timer
- **👥 Social Groups** - Create groups, manage members, share group recipes with admin controls
- **💬 Real-time Chat** - Socket.io powered messaging with typing indicators and online status
- **📊 Data Visualization** - D3.js charts for popular recipes and cuisine distribution
- **🎨 Modern UI** - Responsive design with CSS3 animations and HTML5 Canvas effects
- **🔐 User Management** - Role-based permissions (user, group_admin) with secure authentication

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18+)
- **MongoDB** (local or Atlas)

### Installation

1. **Clone & Install**
   ```bash
   git clone https://github.com/yourusername/foodieconnect.git
   cd foodieconnect
   
   # Backend
   cd server && npm install
   
   # Frontend  
   cd ../client && npm install
   ```

2. **Environment Setup**
   ```bash
   cd server
   cp .env.example .env
   # Edit .env with your values
   ```

   **For MongoDB Atlas (Cloud):**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/foodieconnect
   ```

   **For Local MongoDB:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/foodieconnect
   ```

3. **Run**
   ```bash
   # Terminal 1 - Backend
   cd server && npm run dev
   
   # Terminal 2 - Frontend
   cd client && npm start
   ```

4. **Access**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

---

## 🔐 Environment Variables

Create `server/.env`:
```env
PORT=5000
# MongoDB Atlas (Cloud) - Recommended for production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/foodieconnect

# OR Local MongoDB (Development)
# MONGODB_URI=mongodb://localhost:27017/foodieconnect

JWT_SECRET=your_super_secret_key
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

**Security:** Never commit `.env` to git. Use `.env.example` for sharing config.

**MongoDB Options:**
- **Atlas (Cloud):** More reliable, no local setup required
- **Local:** Requires MongoDB installation on your machine

---

## 🏗️ Tech Stack

**Backend:** Node.js, Express, MongoDB, Socket.io, JWT  
**Frontend:** React 18, React Router, D3.js, Socket.io Client  
**Features:** Real-time chat, Data visualization, HTML5 Canvas, File uploads

---

## 📁 Project Structure

```
FoodieConnect/
├── server/          # Backend API
│   ├── models/      # MongoDB schemas
│   ├── controllers/ # Business logic
│   ├── routes/      # API endpoints
│   └── socket/      # Real-time chat
└── client/          # React frontend
    └── src/
        ├── components/  # UI components
        ├── context/     # State management
        └── services/    # API calls
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

<div align="center">

**Made with ❤️ by the FoodieConnect Team**

</div>