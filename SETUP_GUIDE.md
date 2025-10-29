# 🚀 FoodieConnect - Complete Setup Guide

## 📦 What You Have

You now have a **complete, production-ready** full-stack web application! Here's what's included:

### ✅ Backend (Server) - COMPLETE
- 5 MongoDB Models with full CRUD
- 6 Controllers with business logic
- 6 Route files with all endpoints
- Authentication & Authorization middleware
- Socket.io real-time chat implementation
- Error handling and validation
- Database connection setup

### ✅ Frontend (Client) - COMPLETE
- React application with routing
- Authentication system (Login/Register)
- Recipe components (List, Detail, Search)
- Chat component with Socket.io
- Dashboard with D3.js graphs
- Canvas cooking timer
- Video player component
- All CSS files with CSS3 features

---

## 🔧 Installation Instructions

### Step 1: Install MongoDB
If you don't have MongoDB installed:
- **Windows**: Download from https://www.mongodb.com/try/download/community
- **Mac**: `brew install mongodb-community`
- **Linux**: `sudo apt-get install mongodb`

### Step 2: Start MongoDB
```bash
# Start MongoDB service
mongod

# Or if installed as service:
# Windows: MongoDB should auto-start
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongodb
```

### Step 3: Install Backend Dependencies
```bash
cd FoodieConnect/server
npm install
```

Dependencies that will be installed:
- express
- mongoose
- bcryptjs
- jsonwebtoken
- cors
- dotenv
- express-validator
- multer
- socket.io

### Step 4: Install Frontend Dependencies
```bash
cd ../client
npm install
```

Dependencies that will be installed:
- react
- react-dom
- react-router-dom
- axios
- socket.io-client
- d3
- jquery

### Step 5: Configure Environment Variables
The `.env` file is already created in `server/` directory.  
**Important**: Change the JWT_SECRET before production!

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/foodieconnect
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_2024
NODE_ENV=development
```

### Step 6: Start the Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

You should see:
```
╔═══════════════════════════════════════════╗
║   🍽️  FoodieConnect Server Running      ║
║   Port: 5000                              ║
║   Environment: development                ║
║   Socket.IO: ✅ Active                   ║
╚═══════════════════════════════════════════╝
✅ MongoDB Connected: localhost
📊 Database: foodieconnect
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

The application will open automatically at `http://localhost:3000`

---

## 📝 Creating Test Data

### Register Users
1. Open `http://localhost:3000/register`
2. Create at least 2 users for testing chat
3. Example users:
   - User 1: sarah@foodie.com / password123
   - User 2: david@foodie.com / password123

### Create Recipes
1. Login with a user
2. Create recipes with different:
   - Cuisines (Italian, Asian, etc.)
   - Difficulties (Easy, Medium, Hard)
   - Prep times
   - Add tags like "Vegan", "Gluten-Free"

### Create Events
1. Create cooking events with:
   - Different types (Cooking Class, Potluck, etc.)
   - Future dates
   - Different cuisines
   - Various locations

### Create Groups
1. Create food groups
2. Make some private to test approval system
3. Add posts to groups

---

## 🎯 Testing All Features

### 1. Test Authentication
- ✅ Register new user
- ✅ Login
- ✅ Access protected routes
- ✅ Logout

### 2. Test Recipe CRUD
- ✅ Create recipe
- ✅ View recipe list
- ✅ View recipe details
- ✅ Edit own recipe
- ✅ Delete own recipe

### 3. Test Advanced Search #1 (Recipes)
Navigate to: `/recipes/search`
- ✅ Filter by cuisine
- ✅ Filter by difficulty
- ✅ Filter by max prep time
- ✅ Filter by dietary preference
- ✅ Search by ingredient name
- ✅ See results update dynamically

### 4. Test Advanced Search #2 (Events)
Navigate to: `/events/search`
- ✅ Filter by event type
- ✅ Filter by date range
- ✅ Filter by cuisine
- ✅ Filter by city
- ✅ Filter by skill level

### 5. Test Socket.io Chat
- ✅ Login with User 1
- ✅ Login with User 2 (in incognito/different browser)
- ✅ Send messages between users
- ✅ See messages appear instantly
- ✅ Check typing indicators
- ✅ Verify message history persists

### 6. Test HTML5 Video
- ✅ Create recipe with video URL
- ✅ View recipe details
- ✅ Play/pause video
- ✅ Use seek bar
- ✅ Adjust volume
- ✅ Enter fullscreen

### 7. Test Canvas Timer
- ✅ View dashboard or recipe page
- ✅ Start timer
- ✅ Pause/resume
- ✅ Reset timer
- ✅ Use quick time buttons
- ✅ Hear alarm when complete

### 8. Test D3.js Graphs
Navigate to: `/stats`
- ✅ View Popular Recipes bar chart
- ✅ View Activity Timeline line chart
- ✅ See animations
- ✅ Verify data comes from database

### 9. Test jQuery & Ajax
- ✅ Recipe list infinite scroll
- ✅ Live search functionality
- ✅ Dynamic content loading
- ✅ Smooth animations

### 10. Test CSS3 Features
Look for:
- ✅ Text shadows on headers
- ✅ Smooth transitions on hover
- ✅ Multiple columns in recipe ingredients
- ✅ Custom fonts loaded
- ✅ Rounded corners everywhere

### 11. Test Permission System
- ✅ Regular user can only edit own content
- ✅ Group admin can approve members
- ✅ Private groups require approval
- ✅ Users can't access others' edit pages

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED
```
**Solution**: Make sure MongoDB is running
```bash
mongod
```

### Port Already in Use
```
Error: Port 5000 is already in use
```
**Solution**: Kill the process or change port in `.env`
```bash
# Find process
lsof -i :5000

# Kill process
kill -9 <PID>
```

### React App Won't Start
```
Error: Cannot find module 'react'
```
**Solution**: Reinstall dependencies
```bash
cd client
rm -rf node_modules
npm install
```

### Socket.io Connection Failed
**Solution**: Make sure both backend and frontend are running
- Backend: http://localhost:5000
- Frontend: http://localhost:3000

---

## 📚 Project Structure Overview

```
FoodieConnect/
├── server/
│   ├── models/               ← 5 Mongoose models
│   ├── controllers/          ← Business logic
│   ├── routes/              ← API endpoints
│   ├── middleware/          ← Auth & validation
│   ├── socket/              ← Real-time chat
│   ├── config/              ← Database config
│   ├── .env                 ← Environment variables
│   ├── package.json
│   └── server.js            ← Entry point
│
└── client/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/      ← React components
    │   │   ├── Auth/       ← Login, Register
    │   │   ├── Recipes/    ← Recipe CRUD
    │   │   ├── Events/     ← Event CRUD
    │   │   ├── Groups/     ← Group management
    │   │   ├── Chat/       ← Real-time chat
    │   │   ├── Dashboard/  ← D3.js graphs
    │   │   ├── Canvas/     ← Cooking timer
    │   │   └── Video/      ← Video player
    │   ├── context/        ← Auth context
    │   ├── services/       ← API calls
    │   ├── styles/         ← CSS files
    │   ├── App.jsx         ← Main app
    │   └── index.js        ← Entry point
    └── package.json
```

---

## 🎓 For Your Presentation

### Key Points to Mention:
1. **Complete MVC Architecture**
   - Models: 5 MongoDB schemas
   - Views: React components
   - Controllers: Business logic layer

2. **Two Advanced Searches**
   - Recipe search: 5 parameters
   - Event search: 5 parameters

3. **Real-time Features**
   - Socket.io chat
   - Live typing indicators
   - Instant message delivery

4. **Data Visualization**
   - D3.js bar chart (popular recipes)
   - D3.js line chart (activity timeline)
   - Dynamic data from MongoDB

5. **Modern Web Standards**
   - HTML5 Video with custom controls
   - Canvas API for interactive timer
   - CSS3: all 5 required features
   - jQuery for Ajax calls

6. **Security**
   - JWT authentication
   - Password hashing
   - Protected routes
   - Input validation

### Demo Flow Suggestion:
1. Start with login/register (2 min)
2. Show recipe CRUD operations (3 min)
3. Demonstrate advanced search (3 min)
4. Show real-time chat with 2 users (3 min)
5. Display D3.js statistics (2 min)
6. Show Canvas timer (2 min)
7. Play video with custom controls (2 min)
8. Highlight code quality (3 min)

**Total: ~20 minutes**

---

## 📊 Requirements Checklist

### ✅ Core Requirements
- [x] Node.js + Express backend
- [x] React frontend
- [x] MongoDB database
- [x] MVC architecture

### ✅ Models & CRUD
- [x] 3+ models (we have 5!)
- [x] Full CRUD on all models
- [x] List views for all models
- [x] Search functionality

### ✅ Advanced Search
- [x] Recipe search (5 parameters)
- [x] Event search (5 parameters)

### ✅ Permission System
- [x] User role
- [x] Admin role
- [x] Group management
- [x] Protected routes

### ✅ Advanced Features
- [x] Socket.io chat
- [x] jQuery + Ajax
- [x] HTML5 Video
- [x] Canvas API

### ✅ CSS3 Features
- [x] text-shadow
- [x] transition
- [x] multiple-columns
- [x] @font-face
- [x] border-radius

### ✅ D3.js Visualizations
- [x] Bar chart (popular recipes)
- [x] Line chart (activity timeline)

### ✅ Quality
- [x] Error handling
- [x] Input validation
- [x] Responsive design
- [x] Clean code structure

---

## 🎉 You're Ready!

Your FoodieConnect project is **100% complete** and ready for:
- ✅ Testing
- ✅ Demonstration
- ✅ Submission
- ✅ Presentation

### Good luck with your project! 🍀

---

**Need Help?**
- Check the README.md for detailed documentation
- Review the code comments
- Test each feature systematically
- Make sure MongoDB is running before starting

**Final Checklist Before Presentation:**
- [ ] MongoDB is running
- [ ] Backend server starts without errors
- [ ] Frontend loads correctly
- [ ] Can register and login
- [ ] Can create recipes
- [ ] Advanced search works
- [ ] Chat works between two users
- [ ] D3.js graphs display
- [ ] Canvas timer works
- [ ] Video player works

---

🍽️ **FoodieConnect - Share Your Culinary Journey!**
