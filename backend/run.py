from app import create_app
from app.auth import auth_bp

app = create_app()
app.config['UPLOAD_FOLDER'] = '../frontend/public'
if __name__ == "__main__":
    app.run(port=5000, debug=True)