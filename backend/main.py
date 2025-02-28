import os
from app import app, db

with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(debug=True)
    # app.run(host="0.0.0.0", port=os.environ.get("PORT", 8080))
