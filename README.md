<h1 style="text-align:center; font-weight:bold;">🔐 SureKeep V2</h1>

SureKeep V2 is a sleek and secure password manager built with modern web technologies. Designed with a stunning **glassmorphism** UI, SureKeep makes it simple and intuitive to organize, manage, and protect your credentials.

---

## ✨ Features

- 🔑 **Secure Login/Signup** system with JWT authentication  
- 📚 **Collections** to group passwords by type (e.g., Social, Work, Banking)  
- ✏️ **Edit & Delete** existing credentials  
- 🔁 **Move credentials** across collections effortlessly  
- 🧊 Beautiful **glassmorphism-inspired UI**  
- 📦 Powered by **MongoDB** for efficient data handling  
- ⚛️ Built with **React**, **React Hook Form**, and **React Toastify**
---
## 🚀 Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, React Hook Form, React Toastify  
- **Backend**: Node.js, Express.js, MongoDB, JWT, cookie-parser  
- **Database**: MongoDB Atlas
---
## 🖼️ Screenshots

<p align="center">
  <img src="./public/login.png" alt="Login Page" width="45%" />
  &nbsp;
  <img src="./public/dashboard.png" alt="Dashboard" width="45%" />
</p>


## 🧠 How It Works

1. **User Authentication**: Sign up or log in securely. Tokens are stored in cookies for persistent login.  
2. **Credential Collections**: Group related credentials under a named collection (e.g., Social, Work).  
3. **Credential Management**:
   - Add a new credential with username, password, and optional notes.
   - Edit credentials and optionally move them to another collection.
   - Delete any credential permanently.
4. **UX/UI**: Clean interface with a frosted glass design using Tailwind CSS utilities.

---
### Folder Structure

``` bash
SureKeep-V2/
├── backend/ # Backend server (Express, MongoDB)
│ ├── server.cjs # Main server file
│ ├── package.json # Backend dependencies
│ └── .env # Environment variables
│
├── public/ # Public assets (frontend)
│
├── src/ # Frontend source code
│ ├── assets/ # Images, icons, etc.
│ ├── components/ # Reusable React components
│ │ ├── Footer.jsx
│ │ ├── Login.jsx
│ │ ├── Manager.jsx
│ │ ├── Navbar.jsx
│ │ └── Signup.jsx
│ ├── App.jsx # Main app component
│ ├── App.css # Global styles
│ ├── index.css # Tailwind or custom resets
│ ├── index.html # HTML entry point
│ └── main.jsx # React entry point
│
├── .gitignore
├── package.json # Frontend dependencies
├── vite.config.js # Vite configuration
└── README.md # Project documentation
```

## 🛠️ Setup Instructions

### 📦 Backend

```bash
Open SureKeep_V2 Folder 
Open terminal Here 
    npm install
move to backend by 
    cd backend
    npm install
Now
Create a .env file in the backend root:
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
Ready to run the App
node server.cjs
cd ..
npm run dev
```


## 🔒 Security Practices

- ✅ **JWT-based Authentication**: Secure token-based login system using JSON Web Tokens.
- ✅ **HTTP-only Cookies**: Tokens are stored in cookies that are inaccessible to JavaScript, reducing XSS attack risk.
- ✅ **Middleware Protection**: Backend routes are protected using authentication middleware.
- 🔒 **Environment Variables**: Sensitive data (like DB URI and JWT secret) is stored in `.env` and never committed.
- 🧪 **Validation**: All user inputs are validated on both client and server sides using React Hook Form and backend checks.

---

## 📌 TODO / Coming Soon

- 🔍 **Search & Filter**: Quickly find credentials within or across collections.
- 📝 **Notes Field**: Add additional secure notes per credential.
- 🧠 **Password Strength Meter**: Visual indicator of password strength when adding/editing credentials.
- 📤 **Export Feature**: Export all your stored data to CSV or JSON format securely.
- 📁 **Import Feature**: Allow importing credentials from other password managers (e.g., CSV).
- 🔔 **Notifications**: Reminders for weak/reused passwords.
- 🛡️ **End-to-End Encryption**: Encrypt data in browser before sending it to the server.


## 📃 License

This project is licensed under the **MIT License**.
You are free to use, modify, distribute, and reproduce this software in personal or commercial projects, provided that the original license and copyright notice are included.

---

## ❤️ Made With Love

Built with passion, persistence, and ☕ by [Aayush Maurya](mailto:aayush.avm@gmail.com).  
Design inspired by clean UI principles and the elegance of glassmorphism.

_Your feedback, ideas, and contributions are always welcome!_
