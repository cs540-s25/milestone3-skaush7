import React, { useState } from 'react';
import Login from './components/Login';
import Signup from './components/Signup';
import MoviePage from './components/MoviePage';
import UserReviews from './components/UserReviews';

function App() {
  const [page, setPage] = useState('login');
  const [, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');

  // const handleLogout = () => {
  //   fetch("/logout", { method: "GET" })
  //     .then(() => {
  //       setIsAuthenticated(false);
  //       setPage("login");
  //     });
  // };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setIsAuthenticated(false);
    setPage('login');
  };

  let renderedPage;
  if (page === 'login') {
    renderedPage = (
      <Login
        onLoginSuccess={(token, user) => {
          // store the JWT token, mark the user as authenticated
          localStorage.setItem('access_token', token);
          setIsAuthenticated(true);
          setUsername(user);
          setPage('home');
        }}
        onSwitchToSignup={() => setPage('signup')}
      />
    );
  } else if (page === 'signup') {
    renderedPage = (
      <Signup
        onSignupSuccess={() => setPage('login')}
        onSwitchToLogin={() => setPage('login')}
      />
    );
  } else if (page === 'home') {
    renderedPage = (
      <MoviePage
        onLogout={handleLogout}
        onNavigateUserReviews={() => setPage('userReviews')}
        username={username}
      />
    );
  } else if (page === 'userReviews') {
    renderedPage = <UserReviews onBack={() => setPage('home')} />;
  }

  return <div>{renderedPage}</div>;
}

export default App;
