import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

function UserReviews({ onBack }) {
  const [reviews, setReviews] = useState([]);
  const [editing, setEditing] = useState(null);
  const [updatedRating, setUpdatedRating] = useState('');
  const [updatedComment, setUpdatedComment] = useState('');

  // retrieve the JWT from localStorage
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    fetch('http://127.0.0.1:5000/user_reviews', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => setReviews(data))
      // eslint-disable-next-line no-console
      .catch((err) => console.error('Error fetching user reviews:', err));
  }, [token]);

  const handleEdit = (review) => {
    setEditing(review.id);
    setUpdatedRating(review.rating);
    setUpdatedComment(review.comment);
  };

  const handleUpdate = (reviewId) => {
    fetch(`http://127.0.0.1:5000/update_review/${reviewId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        rating: updatedRating,
        comment: updatedComment,
      }),
    })
      .then((response) => response.json())
      .then(() => {
        setReviews((prevReviews) => prevReviews.map((review) => (review.id === reviewId
          ? {
            ...review,
            rating: updatedRating,
            comment: updatedComment,
          }
          : review)));
        setEditing(null);
      })
      // eslint-disable-next-line no-console
      .catch((err) => console.error('Error updating review:', err));
  };

  const handleDelete = (reviewId) => {
    // eslint-disable-next-line no-alert
    if (window.confirm('Are you sure you want to delete this review?')) {
      fetch(`http://127.0.0.1:5000/delete_review/${reviewId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then(() => setReviews(reviews.filter((review) => review.id !== reviewId)))
        // eslint-disable-next-line no-console
        .catch((err) => console.error('Error deleting review:', err));
    }
  };

  return (
    <div className="reviews-page">
      <h2 className="reviews-title">My Reviews</h2>
      {reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        <div className="reviews-container">
          {reviews.map((review) => (
            <div className="review-card" key={review.id}>
              {editing === review.id ? (
                <div className="review-edit">
                  {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                  <label>Rating:</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={updatedRating}
                    onChange={(e) => setUpdatedRating(e.target.value)}
                  />
                  {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                  <label>Comment:</label>
                  <textarea
                    value={updatedComment}
                    onChange={(e) => setUpdatedComment(e.target.value)}
                  />
                  <button type="button" className="btn-save" onClick={() => handleUpdate(review.id)}>
                    Save
                  </button>
                </div>
              ) : (
                <>
                  <h3>
                    Movie ID:
                    {review.movie_id}
                  </h3>
                  <p>
                    Rating:
                    {review.rating}
                    /10
                  </p>
                  <p>{review.comment}</p>
                  <div className="review-actions">
                    <button type="button" className="btn-edit" onClick={() => handleEdit(review)}>
                      Edit
                    </button>
                    <button type="button" className="btn-delete" onClick={() => handleDelete(review.id)}>
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
      <br />
      <button type="button" className="btn-back" onClick={onBack}>Back</button>
    </div>
  );
}

UserReviews.propTypes = {
  onBack: PropTypes.func.isRequired,
};

export default UserReviews;
