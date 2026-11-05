import { useState } from 'react';
import Swal from 'sweetalert2';
import { checkEmail } from '../utils/emailValidation.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // check the email before bothering the server
    const problem = checkEmail(email);
    if (problem) {
      Swal.fire('Check your email', problem, 'warning');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      Swal.fire('Subscribed!', data.message, 'success');
      setEmail('');
    } catch (err) {
      // "Failed to fetch" means the request never reached the backend
      const message =
        err.message === 'Failed to fetch'
          ? 'Could not reach the server. Is the backend running?'
          : err.message;
      Swal.fire('Subscription failed', message, 'error');
    }
    setLoading(false);
  };

  return (
    <form className="subscribe-bar" onSubmit={handleSubmit} noValidate>
      <strong>SIGN UP FOR OUR DAILY INSIDER</strong>
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="submit" className="btn" disabled={loading}>
        {loading ? 'Sending...' : 'Subscribe'}
      </button>
    </form>
  );
}

export default SubscribeForm;
