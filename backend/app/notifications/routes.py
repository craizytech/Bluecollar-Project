# app/routes.py or add this to an existing routes file
from flask import request, jsonify
from flask_socketio import emit
from flask_jwt_extended import jwt_required, get_jwt_identity
from . import notifications_bp
from app import socketio, db
from app.models import Notification

@socketio.on('connect')
def handle_connect():
    print('Client connected:', request.sid)

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected:', request.sid)

@notifications_bp.route('/notifications', methods=['POST'])
def create_notification():
    data = request.json
    notification = Notification(
        user_id=data['userId'],
        type=data['type'],
        message=data['message'],
    )
    notification.save()

    # Emit notification to the user through Socket.IO
    socketio.emit('notification', {
        'userId': data['userId'],
        'type': data['type'],
        'message': data['message'],
    }, room=data['userId'])  # Emit to specific user

    return {'message': 'Notification created'}, 201

@notifications_bp.route('/<int:user_id>', methods=['GET'])
@jwt_required()
def get_notifications(user_id):
    try:
        notifications = Notification.query.filter_by(user_id=user_id).all()
        notifications = [
            {
                'id':n.notification_id,
                'type': n.type,
                'message': n.message,
                'read': n.read,
                'created_at': n.created_at,
            } 
            for n in notifications
        ]
        return jsonify(notifications), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@notifications_bp.route('/<int:user_id>/read/<int:notification_id>', methods=['PATCH'])
@jwt_required()
def mark_notification_read(user_id, notification_id):
    try:
        notification = Notification.query.filter_by(notification_id=notification_id, user_id=user_id).first()
        if not notification:
            return jsonify({"error": "Notification not found"}), 404
        
        notification.read = True  # Mark as read
        db.session.commit()
        
        return jsonify({"message": "Notification marked as read"}), 200
    except Exception as e:
        print(f"Error marking notification as read: {str(e)}")
        return jsonify({"error": str(e)}), 500

