import React, { useState } from 'react';
import PropTypes from 'prop-types';

function Signup({ onSignupSuccess, onSwitchToLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:5000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (response.ok) {
        // eslint-disable-next-line no-alert
        alert('Account created! Please log in.');
        onSignupSuccess();
      } else {
        // eslint-disable-next-line no-alert
        alert(data.erro || 'Signup failed. Please try a different username.');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Signup error:', error);
      // eslint-disable-next-line no-alert
      alert('Signup failed. Please try again!');
    }
  };

  return (
    <div>
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br />
        <button type="submit">Sign Up</button>
      </form>
      <p>
        Already have an account?
        {' '}
        <button type="button" onClick={onSwitchToLogin}>Log In</button>
      </p>
    </div>
  );
}

Signup.propTypes = {
  onSignupSuccess: PropTypes.func.isRequired,
  onSwitchToLogin: PropTypes.func.isRequired,
};

export default Signup;
