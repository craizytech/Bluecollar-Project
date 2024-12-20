from app import create_app, socketio
from app.auth import auth_bp

app = create_app()
app.config['UPLOAD_FOLDER'] = '../frontend/public'
if __name__ == "__main__":
    socketio.run(app, port=5000, debug=True)