# Leave Management System

A simple student leave management application built with HTML, CSS, JavaScript, Node.js, Express, MongoDB and Mongoose.

## Features

- Create a user with a username, email and roll number.
- Set initial casual and medical leave balances.
- Log in using the registered email address.
- View and refresh leave balances.
- Apply for casual or medical leave; the selected balance is deducted only when enough days are available.

> **Authentication note:** This preserves the original project's email-only demo login. It is not secure authentication and must not be used for real student or employee records without adding passwords, secure sessions, authorization and other production security controls.

## Project structure

```text
ex3/
├── api/
│   └── index.js
├── config/
│   └── db.js
├── models/
│   └── User.js
├── public/
│   ├── app.js
│   ├── index.html
│   └── style.css
├── routes/
│   └── leaveRoutes.js
├── .env.example
├── .gitignore
├── app.js
├── package.json
├── README.md
└── vercel.json
```

## Run locally

1. Install Node.js 18 or newer and make sure MongoDB is running locally, or use a MongoDB Atlas database.
2. Open a terminal in this project folder.
3. Install dependencies:

   ```bash
   npm install
   ```

4. If using MongoDB Atlas, create a `.env` file from `.env.example` and set `MONGODB_URI` to your real connection string. Do not commit `.env` or share the connection string. For local MongoDB, the app defaults to `mongodb://127.0.0.1:27017/leave-management`.
5. Start the app:

   ```bash
   npm start
   ```

6. Open <http://localhost:5050> in your browser. Keep the terminal running while you use the site.

**Important:** Do not open `public/index.html` with VS Code Live Server (`127.0.0.1:5500`). Live Server only serves static files and does not run this Express API, so registration and login will fail. Always use `npm start` and visit `http://localhost:5050`.

## Deploy to Vercel

1. Push the complete `ex3` folder to a GitHub repository.
2. Import that repository into Vercel. Set the project root to the folder containing this `package.json` and `vercel.json` (the `ex3` folder if it is inside a larger repository).
3. In Vercel, open **Project Settings → Environment Variables** and add:
   - Name: `MONGODB_URI`
   - Value: your MongoDB Atlas connection string
   - Environments: Production (and Preview if needed)
4. In MongoDB Atlas, allow network access for the deployment environment. For a quick demo, Atlas can be configured to allow access from anywhere, but restrict this appropriately for a real application.
5. Deploy or redeploy after adding the environment variable.

Vercel does not use your local MongoDB service. A reachable hosted MongoDB database and a valid `MONGODB_URI` are required for registration, login and leave APIs to work after deployment.

## API endpoints

- `POST /api/register`
- `POST /api/login`
- `GET /api/leave-balance/:id`
- `POST /api/apply-leave/:id`
