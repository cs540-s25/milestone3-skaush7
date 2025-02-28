import os
import requests
import random
from flask import request, jsonify

# from flask_login import login_user, logout_user, login_required, current_user
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from .models import db, User, Review
from . import app
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())
TMDB_API_KEY = os.getenv("TMDB_API_KEY")
MOVIE_IDS = [1359, 680, 1124, 244786, 496243, 670, 20453, 129]


def get_movie_details():
    movie_id = random.choice(MOVIE_IDS)
    url = f"https://api.themoviedb.org/3/movie/{movie_id}?api_key={TMDB_API_KEY}&language=en-US"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        return {
            "id": movie_id,
            "title": data["title"],
            "tagline": data["tagline"],
            "genres": [genre["name"] for genre in data["genres"]],
            "poster_path": f"https://image.tmdb.org/t/p/w500{data['poster_path']}",
            "wiki_page": get_wikipedia_url(data.get("title")),
        }
    return None


def get_wikipedia_url(movie_title):
    wiki_url = "https://en.wikipedia.org/w/api.php"
    params = {
        "action": "query",
        "format": "json",
        "titles": movie_title,
        "prop": "info",
        "inprop": "url",
    }
    response = requests.get(wiki_url, params=params)
    data = response.json()
    pages = data["query"]["pages"]
    for page in pages.values():
        if "fullurl" in page:
            return page["fullurl"]
    return "https://en.wikipedia.org"


@app.route("/")
def home():
    return "Welcome to my Flask App!"


# Endpoint to return movie details and associated reviews as JSON
@app.route("/movie", methods=["GET"])
@jwt_required()
def movie():
    movie = get_movie_details()
    if movie is None:
        return jsonify({"error": "Unable to retrieve movie details"}), 500

    # Get the current user's id from the JWT token
    current_user_id = get_jwt_identity()

    reviews = Review.query.filter_by(movie_id=movie["id"]).all()
    review_data = []
    for review in reviews:
        review_data.append(
            {
                "id": review.id,
                "user_id": review.user_id,
                "movie_id": review.movie_id,
                "rating": review.rating,
                "comment": review.comment,
                "username": review.user.username if review.user else "",
            }
        )
    return jsonify({"movie": movie, "reviews": review_data})


# Signup endpoint (handles JSON)
@app.route("/signup", methods=["GET", "POST"])
def signup():
    if request.method == "POST":
        data = request.get_json() if request.is_json else request.form
        username = data.get("username")
        password = data.get("password")

        if User.query.filter_by(username=username).first():
            return jsonify({"error": "Username already exists!"}), 400

        new_user = User(username=username)
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "Account created!"})
    return jsonify({"message": "Signup endpoint"})


# Login endpoint (handles JSON)
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        data = request.get_json() if request.is_json else request.form
        username = data.get("username")
        password = data.get("password")
        user = User.query.filter_by(username=username).first()
        if user and user.check_password(password):
            access_token = create_access_token(identity=str(user.id))
            return jsonify(
                {
                    "message": "Login successful!",
                    "access_token": access_token,
                    "username": user.username,
                }
            )
        else:
            return jsonify({"error": "Invalid username or password!"}), 401
    return jsonify({"message": "Login endpoint"})


# @app.route("/logout") # JWT is stateless, remove stored token from client's side
# @login_required
# def logout():
#     logout_user()
#     return jsonify({"message": "Logged out!"})


# Submit a new review
@app.route("/submit_review", methods=["POST"])
@jwt_required()
def submit_review():
    current_user_id = get_jwt_identity()
    data = request.get_json() if request.is_json else request.form
    movie_id = data.get("movie_id")
    rating = data.get("rating")
    comment = data.get("comment")
    new_review = Review(
        user_id=current_user_id,
        movie_id=movie_id,
        rating=rating,
        comment=comment if comment != "" else None,
    )
    db.session.add(new_review)
    db.session.commit()
    return jsonify({"message": "Review submitted!"})


# Endpoint to get the current user's reviews
@app.route("/user_reviews", methods=["GET"])
@jwt_required()
def user_reviews():
    current_user_id = get_jwt_identity()
    reviews = Review.query.filter_by(user_id=current_user_id).all()
    review_data = []
    for review in reviews:
        review_data.append(
            {
                "id": review.id,
                "movie_id": review.movie_id,
                "rating": review.rating,
                "comment": review.comment,
            }
        )
    return jsonify(review_data)


# Endpoint to update a review
@app.route("/update_review/<int:review_id>", methods=["POST"])
@jwt_required()
def update_review(review_id):
    current_user_id = int(get_jwt_identity())
    review = Review.query.get(review_id)
    if not review or review.user_id != current_user_id:
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    review.rating = data.get("rating")
    review.comment = data.get("comment")
    db.session.commit()
    return jsonify({"message": "Review updated successfully"})


# Endpoint to delete a review
@app.route("/delete_review/<int:review_id>", methods=["POST"])
@jwt_required()
def delete_review(review_id):
    current_user_id = int(get_jwt_identity())
    review = Review.query.get(review_id)
    if not review or review.user_id != current_user_id:
        return jsonify({"error": "Unauthorized"}), 403

    db.session.delete(review)
    db.session.commit()
    return jsonify({"message": "Review deleted successfully"})


# Endpoint to check authentication status (useful for the React frontend)
@app.route("/check_auth", methods=["GET"])
@jwt_required()
def check_auth():
    return jsonify({"logged_in": True})


@app.after_request
def add_no_cache_headers(response):
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    return response
