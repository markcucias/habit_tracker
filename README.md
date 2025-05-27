# Habit Tracker

This is a simple full-stack habit tracker web app built with **Flask** (Python).  
It allows users to **create accounts with passwords**, **track daily habits**, and **see progress** with charts and check-in history.

You can acces it by this link: 
https://habit-tracker-2xpu.onrender.com

---

## Technologies Used

- **Flask** – backend framework
- **HTML + CSS + JavaScript** – frontend
- **Bootstrap** – responsive design and layout
- **SQLite** – local database for users, habits, and check-ins
- **Chart.js** – to show visual stats
- **Werkzeug Security** – for password hashing and user authentication

---

## Features

- Multi-user support (each user has their own account and habits)
- Password protection for each user
- Add, check off, and delete habits
- View daily and historical progress
- Track your check-in history by date
- Automatically calculates progress percentage
- Simple UI

---

## How to Use

1. On the main screen, **create a new user** (with a password).
2. After choosing a user, enter your password to continue.
3. On your dashboard:
   - Use the form to **add new habits**
   - Click "Done!" to check in a habit for today
   - View your **progress bar**, **daily history**, and **bar chart**
   - Delete habits or clear history when needed
4. You can **switch users** anytime using the user icon in the top right

---

## Deployment

This project is ready to be deployed using [Render.com](https://render.com/).

### To deploy:

1. Push the full project to a GitHub repository.
2. Add a `requirements.txt` file with all dependencies.
3. Set up `gunicorn` as the production server.
4. Connect the repo to Render and follow their Flask deployment setup.

> The app uses session cookies to keep users logged in safely without needing to retype passwords constantly.

---

## What I Learned

- How to build a full web app with Flask and JavaScript
- User authentication with hashed passwords
- Working with REST APIs (GET, POST, DELETE)
- Using cookies and sessions for secure login
- Structuring a backend + frontend project for deployment
- Visualizing data using Chart.js

---

## Notes

- This project is intended for learning and personal use.
- In the future, a PostgreSQL database and full user authentication system could make it more production-ready.

---
