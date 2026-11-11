import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_BASE = process.env.REACT_APP_API_URL || "";

const STATUSES = ["Pending", "Ongoing", "Completed"];

const STATUS_DETAILS = {
  Pending: { label: "To do", className: "pending" },
  Ongoing: { label: "In progress", className: "ongoing" },
  Completed: { label: "Complete", className: "completed" },
};

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyTaskIds, setBusyTaskIds] = useState([]);
  const [message, setMessage] = useState(null);

  const fetchTasks = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/tasks`);
      setTasks(response.data);
      setMessage(null);
    } catch (error) {
      console.error("Could not fetch tasks:", error);
      setMessage({
        type: "danger",
        text: "Could not load tasks. Check that the backend and MongoDB are running.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    if (!message || message.type === "danger") {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setMessage(null), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [message]);

  async function createTask(event) {
    event.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setMessage({ type: "danger", text: "Task title cannot be empty." });
      return;
    }

    setSaving(true);
    try {
      const response = await axios.post(`${API_BASE}/tasks`, { title: trimmedTitle });
      setTasks((currentTasks) => [response.data, ...currentTasks]);
      setTitle("");
      setMessage({ type: "success", text: "Task created successfully." });
    } catch (error) {
      console.error("Could not create task:", error);
      setMessage({
        type: "danger",
        text: error.response?.data?.message || "Could not create task.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function updateTaskStatus(id, status) {
    setBusyTaskIds((currentIds) => [...currentIds, id]);
    try {
      const response = await axios.patch(`${API_BASE}/tasks/${id}`, { status });
      setTasks((currentTasks) =>
        currentTasks.map((task) => (task._id === id ? response.data : task))
      );
      setMessage({ type: "success", text: "Task status updated." });
    } catch (error) {
      console.error("Could not update task status:", error);
      setMessage({
        type: "danger",
        text: error.response?.data?.message || "Could not update task status.",
      });
    } finally {
      setBusyTaskIds((currentIds) => currentIds.filter((taskId) => taskId !== id));
    }
  }

  async function deleteTask(id) {
    setBusyTaskIds((currentIds) => [...currentIds, id]);
    try {
      await axios.delete(`${API_BASE}/tasks/${id}`);
      setTasks((currentTasks) => currentTasks.filter((task) => task._id !== id));
      setMessage({ type: "success", text: "Task deleted successfully." });
    } catch (error) {
      console.error("Could not delete task:", error);
      setMessage({
        type: "danger",
        text: error.response?.data?.message || "Could not delete task.",
      });
    } finally {
      setBusyTaskIds((currentIds) => currentIds.filter((taskId) => taskId !== id));
    }
  }

  return (
    <main className="app-shell">
      <div className="container py-5">
        <header className="page-header mb-4">
          <div>
            <p className="eyebrow mb-2">PROJECT WORKSPACE</p>
            <h1 className="mb-2">Task manager</h1>
            <p className="subtitle mb-0">
              Keep your work moving, one task at a time.
            </p>
          </div>
          <div className="task-count" aria-live="polite">
            <span className="task-count-number">{tasks.length}</span>
            <span className="task-count-label">
              {tasks.length === 1 ? "task" : "tasks"}
            </span>
          </div>
        </header>

        <form className="task-form mb-4" onSubmit={createTask}>
          <label className="visually-hidden" htmlFor="task-title">
            Task title
          </label>
          <input
            id="task-title"
            className="form-control"
            type="text"
            maxLength={200}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="What needs to get done?"
          />
          <button className="btn add-button" type="submit" disabled={saving}>
            {saving ? "Adding..." : "Add task"}
          </button>
        </form>

        {message && (
          <div
            className={`alert alert-${message.type} alert-dismissible`}
            role={message.type === "danger" ? "alert" : "status"}
          >
            {message.text}
            <button
              type="button"
              className="btn-close"
              aria-label="Dismiss message"
              onClick={() => setMessage(null)}
            />
          </div>
        )}

        {loading ? (
          <div className="loading-state" role="status">
            <span className="spinner-border spinner-border-sm me-2" />
            Loading your tasks...
          </div>
        ) : (
          <section className="row g-4" aria-label="Tasks by status">
            {STATUSES.map((status) => {
              const statusTasks = tasks.filter((task) => task.status === status);
              const details = STATUS_DETAILS[status];

              return (
                <div className="col-12 col-md-4" key={status}>
                  <section className={`status-column ${details.className}`}>
                    <div className="column-heading">
                      <div className="d-flex align-items-center gap-2">
                        <span className="status-dot" aria-hidden="true" />
                        <h2>{details.label}</h2>
                      </div>
                      <span className="column-count">{statusTasks.length}</span>
                    </div>
                    <div className="task-list">
                      {statusTasks.length === 0 ? (
                        <p className="empty-state mb-0">No tasks here yet.</p>
                      ) : (
                        statusTasks.map((task) => (
                          <TaskCard
                            key={task._id}
                            task={task}
                            busy={busyTaskIds.includes(task._id)}
                            onUpdateStatus={updateTaskStatus}
                            onDelete={deleteTask}
                          />
                        ))
                      )}
                    </div>
                  </section>
                </div>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}

function TaskCard({ task, busy, onUpdateStatus, onDelete }) {
  return (
    <article className="task-card">
      <h3>{task.title}</h3>
      <div className="task-card-footer">
        <span className="task-status">{STATUS_DETAILS[task.status]?.label}</span>
        <div className="task-actions">
          {task.status !== "Pending" && (
            <button
              className="btn btn-sm action-button"
              type="button"
              disabled={busy}
              onClick={() => onUpdateStatus(task._id, "Pending")}
            >
              Move to to do
            </button>
          )}
          {task.status !== "Ongoing" && (
            <button
              className="btn btn-sm action-button"
              type="button"
              disabled={busy}
              onClick={() => onUpdateStatus(task._id, "Ongoing")}
            >
              Start
            </button>
          )}
          {task.status !== "Completed" && (
            <button
              className="btn btn-sm action-button"
              type="button"
              disabled={busy}
              onClick={() => onUpdateStatus(task._id, "Completed")}
            >
              Complete
            </button>
          )}
          <button
            className="btn btn-sm delete-button"
            type="button"
            disabled={busy}
            onClick={() => onDelete(task._id)}
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

export default App;