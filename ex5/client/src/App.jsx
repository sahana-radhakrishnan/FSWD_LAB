import './App.css';
import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function App() {
  const [feedback, setFeedback] = useState({
    q1: '',
    q2: '',
    q3: '',
    q4: '',
    q5: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFeedback((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post('http://localhost:8080/api/feedback', feedback);
      alert('Feedback submitted successfully!');
      setFeedback({ q1: '', q2: '', q3: '', q4: '', q5: '' });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('There was a problem submitting your feedback.');
    }
  };

  return (
    <div className="page-shell">
      <div className="container">
        <div className="header-row">
          <h1>Feedback Form</h1>
          <Link to="/getAllData" className="nav-link">
            View Responses
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="feedback-form">
          <label>
            Name:
            <input type="text" name="q1" value={feedback.q1} onChange={handleChange} />
          </label>

          <label>
            Department:
            <input type="text" name="q2" value={feedback.q2} onChange={handleChange} />
          </label>

          <label>
            Session title:
            <input type="text" name="q3" value={feedback.q3} onChange={handleChange} />
          </label>

          <label>
            Feedback:
            <input type="text" name="q4" value={feedback.q4} onChange={handleChange} />
          </label>

          <label>
            Suggestions:
            <input type="text" name="q5" value={feedback.q5} onChange={handleChange} />
          </label>

          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
}

export default App;
