import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import '../style.css';

function MoviePage({ onLogout, onNavigateUserReviews, username }) {
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    fetch('http://127.0.0.1:5000/movie', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setMovie(data.movie);
        setReviews(data.reviews);
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Error fetching movie data:', err);
        setError('Error fetching movie data');
      });
  }, []);

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    const payload = {
      movie_id: movie.id,
      rating,
      comment,
    };
    fetch('http://127.0.0.1:5000/submit_review', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error: ${res.status}`);
        }
        return res.json();
      })
      .then(() => {
        // update the reviews list to include the new review
        const newReview = {
          id: Date.now(), // dummy review object with a temporary id
          movie_id: movie.id,
          rating,
          comment,
          username,
        };
        setReviews([...reviews, newReview]);
        setRating('');
        setComment('');
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Error submitting review:', err);
        setError('Error submitting review');
      });
  };

  if (!movie) return <div>Loading movie details...</div>;

  return (
    <div className="container">
      <div className="left-column">
        <h1>{movie.title}</h1>
        <h3>{movie.tagline}</h3>
        <p>
          Genres:
          {movie.genres.join(', ')}
        </p>
        <img src={movie.poster_path} alt={`${movie.title} poster`} />
        <p>
          <a
            href={movie.wiki_page}
            target="_blank"
            rel="noreferrer"
            className="wiki-link"
          >
            Learn More on Wikipedia
          </a>
        </p>
        {/* Logout Button */}
        <button type="button" className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>

      <div className="right-column">
        <nav>
          <p className="welc-msg">
            Welcome,
            {username}
            !
          </p>
        </nav>

        {/* Review Submission Form */}
        <form onSubmit={handleReviewSubmit} className="review-form">
          <input type="hidden" name="movie_id" value={movie.id} />
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label>Rating (out of 10):</label>
          <input
            type="number"
            name="rating"
            min="1"
            max="10"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            required
          />
          <textarea
            name="comment"
            placeholder="Leave a comment (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button type="submit" className="submit-btn">
            Submit
          </button>
          <button type="button" onClick={onNavigateUserReviews}>My Reviews</button>
          {' '}
        </form>

        <h2>See what other people said!</h2>
        {reviews.length === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          reviews.map((review) => (
            <div className="review" key={review.id}>
              <p>
                <strong>
                  User:
                  {review.username}
                </strong>
              </p>
              <p>
                Rating:
                {review.rating}
                /10
              </p>
              <p>{review.comment}</p>
              <hr />
            </div>
          ))
        )}
        {error && <p>{error}</p>}
      </div>
    </div>
  );
}

MoviePage.propTypes = {
  onLogout: PropTypes.func.isRequired,
  onNavigateUserReviews: PropTypes.func.isRequired,
  username: PropTypes.string.isRequired,
};

export default MoviePage;
