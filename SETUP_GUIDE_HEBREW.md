# 📖 FoodieConnect - מדריך התקנה והרצה מפורט

## 🎯 דרישות מקדימות

לפני שמתחילים, וודאי שיש לך:

1. **Node.js** (גרסה 18 ומעלה)
   - להורדה: https://nodejs.org/
   - בדיקה: `node --version`

2. **MongoDB** 
   - **אופציה A:** התקנה מקומית - https://www.mongodb.com/try/download/community
   - **אופציה B:** MongoDB Atlas (בענן) - https://www.mongodb.com/cloud/atlas
   - בדיקה: `mongod --version`

3. **Git** (אופציונלי)
   - להורדה: https://git-scm.com/

---

## 📥 שלב 1: הורדת הפרויקט

אם יש לך את הקבצים ב-ZIP:
```bash
# חלץ את הקובץ למיקום הרצוי
# פתח Terminal/CMD במיקום התיקייה
cd FoodieConnect
```

---

## ⚙️ שלב 2: התקנת Dependencies

### Backend (Server)

```bash
cd server
npm install
```

זה יתקין:
- express
- mongoose  
- socket.io
- jsonwebtoken
- bcryptjs
- cors
- dotenv
- express-validator
- multer

### Frontend (Client)

```bash
cd ../client
npm install
```

זה יתקין:
- react
- react-dom
- react-router-dom
- axios
- socket.io-client
- d3
- jquery

---

## 🗄️ שלב 3: הגדרת MongoDB

### אופציה A: MongoDB מקומי

1. התחל את MongoDB:
```bash
# Windows
mongod

# Mac/Linux
sudo service mongod start
```

2. ה-URI יהיה:
```
mongodb://localhost:27017/foodieconnect
```

### אופציה B: MongoDB Atlas (מומלץ)

1. צור חשבון ב-https://www.mongodb.com/cloud/atlas
2. צור Cluster חדש (Free Tier)
3. לחץ "Connect" → "Connect your application"
4. העתק את ה-Connection String
5. החלף `<password>` בסיסמה שלך

---

## 🔐 שלב 4: הגדרת קובץ .env

צור קובץ בשם `.env` בתיקיית `server/`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/foodieconnect
JWT_SECRET=foodieconnect_secret_key_2024_change_this
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

**חשוב:** אם אתה משתמש ב-MongoDB Atlas, החלף את MONGODB_URI ב-Connection String שלך!

---

## 🚀 שלב 5: הרצת האפליקציה

**פתח 2 Terminals/CMD windows:**

### Terminal 1 - Backend:

```bash
cd server
npm run dev
```

אמור להופיע:
```
╔═══════════════════════════════════════════╗
║   🍽️  FoodieConnect Server Running      ║
║   Port: 5000                             ║
║   Environment: development               ║
║   Socket.IO: ✅ Active                   ║
╚═══════════════════════════════════════════╝
✅ MongoDB Connected: localhost
```

### Terminal 2 - Frontend:

```bash
cd client
npm start
```

הדפדפן אמור להיפתח אוטומטית ל-http://localhost:3000

---

## ✅ בדיקה שהכל עובד

1. **דף הבית:** http://localhost:3000 - צריך להציג דף נחיתה
2. **הרשמה:** לחץ על "Register" וצור משתמש חדש
3. **התחברות:** התחבר עם המשתמש שיצרת
4. **Recipes:** עבור ל-Recipes וצור מתכון ראשון
5. **Dashboard:** בדוק שהגרפים של D3.js מוצגים
6. **Chat:** נסה לשלוח הודעה (Socket.io)

---

## 🐛 פתרון בעיות נפוצות

### ❌ "Cannot connect to MongoDB"

**פתרון:**
```bash
# בדוק ש-MongoDB רץ
mongod

# או בדוק את ה-Connection String ב-.env
```

### ❌ "Port 5000 already in use"

**פתרון:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID [PID_NUMBER] /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

### ❌ "Module not found"

**פתרון:**
```bash
# מחק node_modules והתקן מחדש
rm -rf node_modules
npm install
```

### ❌ Socket.io לא מתחבר

**פתרון:**
- בדוק ש-CLIENT_URL ב-server/.env תואם ל-http://localhost:3000
- בדוק שה-Backend רץ על port 5000
- נסה לרענן את הדף

---

## 📊 מילוי מידע לדוגמה

אחרי שהאפליקציה רצה, מומלץ למלא מידע לדמו:

1. **צור 3-5 משתמשים** (Register)
2. **צור 10+ מתכונים** עם תמונות וסרטונים
3. **צור 3-5 קבוצות** בקטגוריות שונות
4. **צור 5-10 אירועים** בתאריכים שונים
5. **שלח הודעות בצ'אט** בין המשתמשים

זה יאפשר לראות את:
- הגרפים של D3.js עם נתונים אמיתיים
- חיפושים מתקדמים
- פיצ'רים של הקבוצות

---

## 🎓 להגנה על הפרויקט

### דברים חשובים להראות:

1. **ארכיטקטורת MVC**
   - הראי את מבנה התיקיות
   - הסבר על Models, Controllers, Routes

2. **5 המודלים + CRUD**
   - User, Recipe, CookingEvent, Group, ChatMessage
   - הדגם Create, Read, Update, Delete על כל אחד

3. **2 חיפושים מתקדמים**
   - Recipe Search עם 5 פרמטרים
   - Event Search עם 5 פרמטרים
   - הראה בקוד איך זה עובד

4. **Socket.io**
   - פתח 2 חלונות דפדפן
   - הראה צ'אט בזמן אמת
   - הראה typing indicator

5. **D3.js**
   - Dashboard עם 2 גרפים
   - הסבר איך הנתונים מגיעים מה-DB

6. **HTML5 + CSS3**
   - Video player
   - Canvas timer
   - כל 5 פיצ'רי CSS3

7. **מערכת הרשאות**
   - משתמש רגיל vs מנהל קבוצה
   - הראה שלא ניתן למחוק תוכן של אחרים

---

## 📝 טיפים נוספים

### לפני ההגנה:

- ✅ בדוק שכל הפונקציות עובדות
- ✅ מלא מספיק dummy data
- ✅ תרגל את ההדגמה
- ✅ הכן תשובות לשאלות על הקוד
- ✅ ודא שה-Git repository מעודכן

### במהלך ההגנה:

- 💡 התחל מ-Architecture Overview
- 💡 הדגם פיצ'רים מרשימים (Socket.io, D3.js)
- 💡 הסבר החלטות טכניות
- 💡 הראה טיפול בשגיאות
- 💡 הדגש על Security (JWT, bcrypt)

---

## 🎉 בהצלחה!

אם יש בעיות:
1. בדוק את ה-README.md המלא
2. בדוק Logs ב-Terminal
3. השתמש ב-console.log לדיבוג
4. Google Search לבעיות ספציפיות

**זכור:** הפרויקט מלא ומקצועי - תראה אותו בביטחון! 💪
