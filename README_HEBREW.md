# 🍽️ FoodieConnect - רשת חברתית לאוהבי אוכל

## 📋 סקירה

פרויקט מלא ומקצועי לעבודת גמר - רשת חברתית לשיתוף מתכונים, ניהול קבוצות אוכל, וצ'אט בזמן אמת.

---

## ✅ כל הדרישות מולאו!

### 🎯 דרישות חובה:

✅ **4 מודלים** עם CRUD מלא:
1. User (משתמשים)
2. Recipe (מתכונים)  
3. Group (קבוצות)
4. ChatMessage (הודעות צ'אט)

✅ **2 חיפושים מתקדמים** (5 פרמטרים כל אחד):
1. חיפוש מתכונים: מטבח, קושי, זמן, תזונה, מרכיבים
2. חיפוש קבוצות: קטגוריה, מספר חברים (מינימום/מקסימום), פרטי/ציבורי, חיפוש חופשי

✅ **מערכת הרשאות מלאה:**
- משתמש רגיל / מנהל קבוצה / אדמין
- JWT Authentication
- כל משתמש רואה רק תוכן שהוא מורשה לו

✅ **Socket.io - צ'אט בזמן אמת:**
- הודעות מיידיות
- Typing indicators
- Online/offline status

✅ **HTML5 פיצ'רים:**
- Video player למתכונים
- Canvas - טיימר בישול אינטראקטיבי

✅ **CSS3 - כל 5 הפיצ'רים:**
- text-shadow
- transition
- multiple-columns
- font-face
- border-radius

✅ **D3.js - 2 גרפים:**
1. המתכונים הפופולריים (Bar Chart)
2. פעילות לאורך זמן (Line Chart)

✅ **jQuery + Ajax** - כל הקריאות ל-API

---

## 🚀 התקנה והרצה

### דרישות מקדימות:
- Node.js (v18+)
- MongoDB (מקומי או Atlas)

### שלב 1: התקנה

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### שלב 2: הגדרת MongoDB

צור קובץ `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/foodieconnect
JWT_SECRET=foodieconnect_secret_2024
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

**אם משתמשים ב-MongoDB Atlas:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/foodieconnect
```

### שלב 3: מילוי Data (חובה!)

```bash
cd server
npm run seed
```

זה ייצור:
- ✅ 5 משתמשים
- ✅ 5 מתכונים מוכנים
- ✅ 5 קבוצות

**חשבונות לדוגמה:**
- Email: `sarah@foodie.com` | Password: `password123`
- Email: `david@foodie.com` | Password: `password123`
- Email: `admin@foodie.com` | Password: `admin123`

### שלב 4: הרצה!

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd ../client
npm start
```

פתח: http://localhost:3000

---

## 🎮 שימוש במערכת

### 1️⃣ התחברות
- לחץ "Login"
- השתמש באחד מהחשבונות למעלה
- או "Register" ליצירת חשבון חדש

### 2️⃣ מתכונים
- עבור ל-"Recipes"
- **חיפוש מתקדם** עם 5 פילטרים!
- לחץ על מתכון לפרטים מלאים
- Like, Comment, Share

### 3️⃣ קבוצות
- עבור ל-"Groups"
- **חיפוש קבוצות** לפי קטגוריה, מספר חברים, וכו'
- הצטרף לקבוצה
- פרסם פוסטים

### 4️⃣ צ'אט (Socket.io)
- לחץ "Chat"
- בחר משתמש מהרשימה
- שלח הודעה בזמן אמת!
- **טיפ:** פתח 2 חלונות דפדפן לראות בזמן אמת

### 5️⃣ Dashboard (D3.js)
- לחץ "Dashboard"
- ראה 2 גרפים דינמיים:
  - המתכונים הפופולריים
  - פעילות לאורך זמן

---

## 📁 מבנה הפרויקט

```
FoodieConnect/
├── server/                      # Backend
│   ├── models/                  # 4 Models
│   │   ├── User.js
│   │   ├── Recipe.js
│   │   ├── Group.js
│   │   └── ChatMessage.js
│   ├── controllers/             # Business Logic
│   │   ├── userController.js
│   │   ├── recipeController.js  # חיפוש #1
│   │   ├── groupController.js   # חיפוש #2
│   │   ├── chatController.js
│   │   └── statsController.js   # D3.js data
│   ├── routes/                  # API Routes
│   ├── middleware/              # Auth + Validation
│   ├── socket/                  # Socket.io
│   ├── seed.js                  # Dummy Data ✨
│   └── server.js
│
└── client/                      # Frontend
    └── src/
        ├── components/
        │   ├── Auth/            # Login, Register
        │   ├── Recipes/         # + חיפוש מתקדם
        │   ├── Groups/          # + חיפוש קבוצות
        │   ├── Chat/            # Socket.io
        │   ├── Dashboard/       # D3.js
        │   ├── Video/           # HTML5 Video
        │   └── Canvas/          # HTML5 Canvas
        ├── services/api.js      # Axios + Ajax
        └── styles/main.css      # CSS3
```

---

## 🎓 הכנה להגנה

### מה להדגים:

1. **ארכיטקטורת MVC**
   - הראי Models, Controllers, Views

2. **4 מודלים + CRUD**
   - User, Recipe, Group, ChatMessage
   - הדגימי Create, Read, Update, Delete על כל אחד

3. **2 חיפושים מתקדמים**
   - מתכונים: 5 פילטרים
   - קבוצות: 5 פילטרים
   - הראי בקוד איך זה עובד

4. **Socket.io**
   - פתחי 2 חלונות
   - שלחי הודעה - תראי שזה מגיע מיד!
   - הראי typing indicator

5. **D3.js**
   - Dashboard עם 2 גרפים
   - הסבירי שהנתונים מגיעים מה-DB

6. **HTML5 + CSS3**
   - Video player
   - Canvas timer
   - הצביעי על כל 5 פיצ'רי CSS3 בקוד

7. **מערכת הרשאות**
   - משתמש רגיל vs מנהל קבוצה
   - רק בעלים יכול למחוק תוכן שלו

---

## 🔍 API Endpoints - דוגמאות

### Authentication
```
POST /api/users/register    - הרשמה
POST /api/users/login        - התחברות
```

### Recipes
```
GET  /api/recipes/search     - חיפוש מתקדם ⭐
GET  /api/recipes            - כל המתכונים
POST /api/recipes            - יצירת מתכון
PUT  /api/recipes/:id        - עדכון
DELETE /api/recipes/:id      - מחיקה
```

### Groups
```
GET  /api/groups/search      - חיפוש קבוצות ⭐
GET  /api/groups             - כל הקבוצות
POST /api/groups             - יצירת קבוצה
POST /api/groups/:id/join    - הצטרפות
```

### Chat
```
GET  /api/chat/:userId       - היסטוריית צ'אט
POST /api/chat/:userId       - שליחת הודעה
Socket.io - real-time ⚡
```

### Statistics (D3.js)
```
GET /api/stats/popular-recipes    - גרף #1
GET /api/stats/activity-timeline  - גרף #2
```

---

## 🐛 פתרון בעיות

### MongoDB לא מתחבר
```bash
# וודאי שMongoDB רץ
mongod

# או בדקי את ה-URI ב-.env
```

### Port כבר בשימוש
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID [PID] /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

### אין Data להצגה
```bash
# הרצ את ה-seed
cd server
npm run seed
```

### Socket.io לא עובד
- וודאי ש-Backend רץ על port 5000
- בדקי CLIENT_URL ב-server/.env
- רענני את הדף

---

## 📊 טבלת דרישות - סיכום מלא

| דרישה | סטטוס | מיקום בקוד |
|-------|-------|------------|
| Node.js + Express | ✅ | server/server.js |
| React | ✅ | client/src/ |
| MongoDB | ✅ | server/config/db.js |
| MVC | ✅ | models/, controllers/, components/ |
| 3+ מודלים | ✅ (4!) | server/models/ |
| CRUD מלא | ✅ | controllers/ |
| חיפוש #1 (מתכונים) | ✅ | recipeController.js:19 |
| חיפוש #2 (קבוצות) | ✅ | groupController.js:33 |
| מערכת הרשאות | ✅ | middleware/auth.js |
| ניהול קבוצות | ✅ | groupController.js |
| Socket.io | ✅ | socket/chatSocket.js |
| jQuery + Ajax | ✅ | services/api.js |
| Video | ✅ | components/Video/ |
| Canvas | ✅ | components/Canvas/ |
| CSS3 (כל 5) | ✅ | styles/main.css |
| D3.js (2 גרפים) | ✅ | Dashboard/Statistics.jsx |
| Dummy Data | ✅ | seed.js |

---

## 💡 טיפים אחרונים

✨ **לפני ההגנה:**
- הריצי `npm run seed` למילוי data
- תרגלי את ההדגמה
- הכירי את הקוד
- הכיני תשובות לשאלות נפוצות

✨ **במהלך ההגנה:**
- התחילי מהמבנה הכללי (MVC)
- הדגימי פיצ'רים מרשימים (Socket.io, D3.js)
- הסבירי החלטות טכניות
- הראי טיפול בשגיאות

---

## 🎉 בהצלחה!

הפרויקט מלא, מקצועי, ועונה על כל הדרישות.
**תהיי בטוחה בעצמך - זה עבודה מצוינת!** 💪

---

**נבנה עם ❤️ עבור FoodieConnect**
