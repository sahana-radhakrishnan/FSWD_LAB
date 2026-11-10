import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function GetAllData() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get('http://localhost:8080/api/getfeedback')
      .then((response) => {
        setFeedbacks(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="status-box">Loading...</div>;
  }

  if (error) {
    return <div className="status-box">Error: {error}</div>;
  }

  return (
    <div className="page-shell">
      <div className="container response-container">
        <div className="header-row">
          <h2>Feedback List</h2>
          <Link to="/" className="nav-link">
            Back to Form
          </Link>
        </div>

        {feedbacks.length === 0 ? (
          <p>No feedback submitted yet.</p>
        ) : (
          <ul className="response-list">
            {feedbacks.map((feedback) => (
              <li key={feedback._id} className="response-item">
                <p>
                  <strong>Name:</strong> {feedback.q1}
                </p>
                <p>
                  <strong>Department:</strong> {feedback.q2}
                </p>
                <p>
                  <strong>Session title:</strong> {feedback.q3}
                </p>
                <p>
                  <strong>Feedback:</strong> {feedback.q4}
                </p>
                <p>
                  <strong>Suggestions:</strong> {feedback.q5}
                </p>
                <p>
                  <strong>Submitted At:</strong> {new Date(feedback.submittedAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default GetAllData;
