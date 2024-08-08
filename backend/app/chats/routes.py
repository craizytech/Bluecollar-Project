from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import User, Chat, Permissions
from app.utils.permissions import permission_required
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from app.chats import chats_bp

# Send a chat message
@chats_bp.route('/send', methods=['POST'])
@jwt_required()
@permission_required(Permissions.CHAT)
def send_message():
    data = request.get_json()
    sender_id = get_jwt_identity()
    receiver_id = data.get('receiver_id')
    message = data.get('message')
    message_type = data.get('type', 'text')  # Get the type or default to 'text'


    if not receiver_id or not message:
        return jsonify({'error': 'Missing receiver_id or message'}), 400

    if sender_id == receiver_id:
        return jsonify({'error': 'You cannot send a message to yourself.'}), 400

    chat = Chat(
        sent_from=sender_id,
        sent_to=receiver_id,
        message=message,
        type=message_type,
        date_of_creation=datetime.utcnow(),
        status='sent'
    )
    
    try:
        db.session.add(chat)
        db.session.commit()
        return jsonify({'message': 'Message sent successfully'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Retrieve the user's chat history with a specific receiver
@chats_bp.route('/history/<int:receiver_id>', methods=['GET'])
@jwt_required()
@permission_required(Permissions.CHAT)
def chat_history(receiver_id):
    current_user_id = get_jwt_identity()

    if not receiver_id:
        return jsonify({'error': 'Missing receiver_id'}), 400

    chats = Chat.query.filter(
        ((Chat.sent_from == current_user_id) & (Chat.sent_to == receiver_id)) |
        ((Chat.sent_from == receiver_id) & (Chat.sent_to == current_user_id))
    ).order_by(Chat.date_of_creation).all()

    chat_history = [{
        'chat_id': chat.chat_id,
        'sent_from': chat.sent_from,
        'sent_to': chat.sent_to,
        'message': chat.message,
        'type': chat.type, 
        'date_of_creation': chat.date_of_creation,
        'status': chat.status,
    } for chat in chats]

    return jsonify(chat_history), 200

# Retrieve the list of chat partners
@chats_bp.route('/partners', methods=['GET'])
@jwt_required()
@permission_required(Permissions.CHAT)
def get_chat_partners():
    current_user_id = get_jwt_identity()

    chat_partners = Chat.query.filter(
        (Chat.sent_from == current_user_id) | (Chat.sent_to == current_user_id)
    ).distinct(Chat.sent_from, Chat.sent_to).all()

    partners = set()
    for chat in chat_partners:
        if chat.sent_from != current_user_id:
            partners.add(chat.sent_from)
        if chat.sent_to != current_user_id:
            partners.add(chat.sent_to)

    users = User.query.filter(User.user_id.in_(partners)).all()

    partner_data = [{
        'user_id': user.user_id,
        'user_name': user.user_name,
        'user_profile_picture': user.user_profile_picture
    } for user in users]

    return jsonify(partner_data), 200
