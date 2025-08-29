from flask import Flask
from flask_login import LoginManager
from flask_cors import CORS
from seating import seating_bp
from auth import auth_bp
from user import DummyUser  

app = Flask(__name__)
app.secret_key = "supersecretkey"


CORS(
    app,
    resources={r"/api/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}},
    supports_credentials=True,
)

login_manager = LoginManager()
login_manager.login_view = "auth.login"
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return DummyUser.get(user_id)


app.register_blueprint(seating_bp)
app.register_blueprint(auth_bp, url_prefix="/api")

if __name__ == "__main__":
    app.run(debug=True)
