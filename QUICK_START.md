# ⚡ Quick Start Guide - 5 Minutes to Running!

## 🎯 Get FoodieConnect Running in 5 Easy Steps

---

## Step 1: Make Sure You Have These (2 minutes)

### Check Node.js
```bash
node --version
# Should show v14 or higher
```

**Don't have Node.js?**
- Download from: https://nodejs.org/
- Install the LTS version

### Check MongoDB
```bash
mongod --version
# Should show MongoDB version
```

**Don't have MongoDB?**
- **Windows**: https://www.mongodb.com/try/download/community
- **Mac**: `brew install mongodb-community`
- **Linux**: `sudo apt-get install mongodb`

---

## Step 2: Start MongoDB (30 seconds)

```bash
# Just run this:
mongod

# You should see: "waiting for connections on port 27017"
```

**Keep this terminal open!**

---

## Step 3: Install Backend (1 minute)

Open a **NEW terminal**:

```bash
cd FoodieConnect/server
npm install
```

Wait for packages to install...

---

## Step 4: Install Frontend (1 minute)

Open **ANOTHER new terminal**:

```bash
cd FoodieConnect/client
npm install
```

Wait for packages to install...

---

## Step 5: Start Everything! (30 seconds)

### Terminal 2 (Backend):
```bash
cd FoodieConnect/server
npm run dev
```

You should see:
```
╔═══════════════════════════════════════════╗
║   🍽️  FoodieConnect Server Running      ║
║   Port: 5000                              ║
╚═══════════════════════════════════════════╝
✅ MongoDB Connected
```

### Terminal 3 (Frontend):
```bash
cd FoodieConnect/client
npm start
```

Browser should open automatically to:
**http://localhost:3000**

---

## 🎉 You're Done!

### What You'll See:
1. Login page opens automatically
2. Click "Register here" to create account
3. Fill in the form and register
4. You're in!

---

## 🧪 Quick Test (2 minutes)

### Test 1: Create Recipe
1. After login, click "Recipes"
2. Click "Create Recipe"
3. Fill in details
4. Submit

### Test 2: Advanced Search
1. Go to "Recipe Search"
2. Select cuisine, difficulty, time
3. See results!

### Test 3: Chat (need 2 users)
1. Register second user (use incognito window)
2. Open chat with first user
3. Send message
4. See it appear instantly!

### Test 4: Statistics
1. Go to "Statistics" page
2. See D3.js graphs
3. Watch animations!

---

## ⚠️ Troubleshooting

### Problem: "Cannot connect to MongoDB"
**Solution**: Make sure MongoDB is running in Terminal 1
```bash
mongod
```

### Problem: "Port 5000 already in use"
**Solution**: Kill the process
```bash
# Find what's using port 5000
lsof -i :5000

# Kill it
kill -9 <PID>
```

### Problem: "Module not found"
**Solution**: Reinstall dependencies
```bash
# In server folder:
rm -rf node_modules
npm install

# In client folder:
rm -rf node_modules
npm install
```

### Problem: Frontend won't start
**Solution**: Clear cache and restart
```bash
cd client
rm -rf node_modules
npm cache clean --force
npm install
npm start
```

---

## 📝 Quick Reference

### URLs
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **MongoDB**: mongodb://localhost:27017

### Test Users (After you create them)
- Email: test@foodie.com
- Password: test123

### Important Files
- **Backend config**: `server/.env`
- **Backend entry**: `server/server.js`
- **Frontend entry**: `client/src/index.js`
- **Main app**: `client/src/App.jsx`

---

## 🎓 For Demo Preparation

### Create Test Data:
1. **2-3 Users** (for chat demo)
2. **10+ Recipes** (for search demo)
3. **5+ Events** (for event search)
4. **2+ Groups** (for group features)

### Demo Checklist:
- [ ] MongoDB running
- [ ] Backend running (port 5000)
- [ ] Frontend running (port 3000)
- [ ] Test users created
- [ ] Sample recipes created
- [ ] Sample events created
- [ ] Graphs showing data

---

## 💡 Pro Tips

1. **Keep all 3 terminals open** during development
   - Terminal 1: MongoDB
   - Terminal 2: Backend
   - Terminal 3: Frontend

2. **Create good test data** before demo
   - Makes demonstration smoother
   - Shows features better

3. **Test chat with 2 browsers**
   - Normal window: User 1
   - Incognito: User 2

4. **Practice the demo flow** 2-3 times
   - Login → Create → Search → Chat → Stats

---

## 🚀 That's It!

You now have a **fully functional** social network running locally!

### Next Steps:
- Read `README.md` for full documentation
- Check `SETUP_GUIDE.md` for detailed info
- Review `PROJECT_SUMMARY.md` for features

---

## 🎯 Common Commands

### Start Backend
```bash
cd server && npm run dev
```

### Start Frontend
```bash
cd client && npm start
```

### Install Dependencies
```bash
npm install
```

### Stop Everything
```
Press Ctrl+C in each terminal
```

---

**🍽️ Enjoy FoodieConnect!**

Need help? Check the other documentation files!
- README.md
- SETUP_GUIDE.md
- PROJECT_SUMMARY.md
- FILES_LIST.md
