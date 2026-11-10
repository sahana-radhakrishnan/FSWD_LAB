# Project Task Management

A React task board backed by an Express API and MongoDB. Tasks can be created,
moved between Pending, Ongoing, and Completed, and deleted.

## Requirements

- Node.js and npm
- MongoDB running locally, or a MongoDB connection string

The backend defaults to `mongodb://127.0.0.1:27017/taskmanager`. Set
`MONGODB_URI` to use another MongoDB instance.

## Install

From this folder, install the backend dependencies:

```sh
npm install
```

Then install the frontend dependencies:

```sh
cd task-manager-frontend
npm install
```

## Run

Start the backend from the project root:

```sh
npm start
```

In a second terminal, start the React app:

```sh
cd task-manager-frontend
npm start
```

The frontend opens at `http://localhost:3000` and proxies API requests to
`http://localhost:5000`.

## API routes

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/tasks` | List tasks |
| `POST` | `/tasks` | Create a task with `{ "title": "..." }` |
| `PATCH` | `/tasks/:id` | Change status with `{ "status": "Ongoing" }` |
| `DELETE` | `/tasks/:id` | Delete a task |
