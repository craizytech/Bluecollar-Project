import os
from flask import Blueprint, jsonify, request, current_app, abort
from werkzeug.utils import secure_filename
from app.models import ServiceCategory, User, db
from datetime import datetime

categories_bp = Blueprint('categories', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@categories_bp.route('/all', methods=['GET'])
def get_categories():
    categories = ServiceCategory.query.all()
    categories_list = [{'id': category.category_id, 'name': category.category_name, 'creation_date': category.date_of_creation} for category in categories]
    return jsonify(categories_list)

@categories_bp.route('/create', methods=['POST'])
def create_category():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    category_name = request.form.get('name').lower()
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        extension = filename.rsplit('.', 1)[1].lower()
        new_filename = f"{category_name}.{extension}"
        file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], new_filename)
        file.save(file_path)
        
        new_category = ServiceCategory(category_name=category_name)
        db.session.add(new_category)
        db.session.commit()
        
        return jsonify({'message': 'Category created successfully', 'category': {'id': new_category.category_id, 'name': new_category.category_name, 'creation_date': new_category.date_of_creation}}), 201
    
    return jsonify({'error': 'File type not allowed'}), 400

@categories_bp.route('/update/<int:category_id>', methods=['PUT'])
def update_category(category_id):
    category = ServiceCategory.query.get(category_id)
    if not category:
        abort(404, description="Category not found")

    data = request.form
    name = data.get('name')
    file = request.files.get('file')

    if name:
        category.category_name = name.lower()

    if file:
        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not allowed'}), 400
        
        # Remove old image file if exists (assuming old filename logic if stored somewhere)
        old_file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], f"{category.category_name}.png")  # Adjust filename as needed
        if os.path.exists(old_file_path):
            os.remove(old_file_path)
        
        filename = secure_filename(file.filename)
        extension = filename.rsplit('.', 1)[1].lower()
        new_filename = f"{category.category_name}.{extension}"
        file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], new_filename)
        file.save(file_path)

    db.session.commit()

    return jsonify({'id': category.category_id, 'name': category.category_name}), 200

@categories_bp.route('/delete/<int:category_id>', methods=['DELETE'])
def delete_category(category_id):
    category = ServiceCategory.query.get(category_id)
    if not category:
        abort(404, description="Category not found")

    # Remove image file if exists (assuming filename logic if stored somewhere)
    file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], f"{category.category_name}.png")  # Adjust filename as needed
    if os.path.exists(file_path):
        os.remove(file_path)

    db.session.delete(category)
    db.session.commit()

    return jsonify({'message': 'Category deleted successfully'}), 200

@categories_bp.route('/user_count', methods=['GET'])
def get_category_user_counts():
    # Query to get the count of users for each category
    category_user_counts = db.session.query(
        ServiceCategory.category_id,
        ServiceCategory.category_name,
        db.func.count(User.user_id).label('user_count')
    ).outerjoin(User, User.role_id == ServiceCategory.category_id) \
    .group_by(ServiceCategory.category_id) \
    .all()

    # Convert the result to a list of dictionaries
    result = [
        {
            'id': category_id,
            'name': category_name,
            'user_count': user_count
        }
        for category_id, category_name, user_count in category_user_counts
    ]

    return jsonify(result)