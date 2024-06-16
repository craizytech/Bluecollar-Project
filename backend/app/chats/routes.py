from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import User, Chat, Permissions
from app.utils.permissions import permission_required
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

chats_bp = Blueprint('chats', __name__)

@chats_bp.route('/send', methods=['POST'])
@jwt_required()
@permission_required(Permissions.CHAT)
def send_message():
    data = request.get_json()
    sender_id = get_jwt_identity()
    receiver_id = data.get('receiver_id')
    message = data.get('message')

    if not receiver_id or not message:
        return jsonify({'error': 'Missing receiver_id or message'}), 400

    chat = Chat(
        sent_from=sender_id,
        sent_to=receiver_id,
        message=message,
        date_of_creation=datetime.utcnow(),
        status='sent'
    )
    
    db.session.add(chat)
    db.session.commit()

    return jsonify({'message': 'Message sent successfully'}), 201

@chats_bp.route('/history/<int:user_id>', methods=['GET'])
@jwt_required()
@permission_required(Permissions.CHAT)
def chat_history(user_id):
    current_user_id = get_jwt_identity()

    # Fetching chat history between the current user and another user
    chats = Chat.query.filter(
        ((Chat.sent_from == current_user_id) & (Chat.sent_to == user_id)) |
        ((Chat.sent_from == user_id) & (Chat.sent_to == current_user_id))
    ).all()

    chat_history = [{
        'chat_id': chat.chat_id,
        'sent_from': chat.sent_from,
        'sent_to': chat.sent_to,
        'message': chat.message,
        'date_of_creation': chat.date_of_creation,
        'status': chat.status
    } for chat in chats]

    return jsonify(chat_history), 200
