from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Invoice, User, Permissions
from app.extensions import db
from app.utils.decorators import permission_required
from app.invoices import invoices_bp
from datetime import datetime

# Route to retrieve all invoices
@invoices_bp.route('/all', methods=['GET'])
@jwt_required()
def get_invoices():
    invoices = Invoice.query.all()
    invoice_list = [
        {
            "invoice_id": invoice.invoice_id,
            "user_id": invoice.user_id,
            "service_cost": invoice.service_cost,
            "status": invoice.status,
            "date_of_creation": invoice.date_of_creation
        }
        for invoice in invoices
    ]
    return jsonify({"invoices": invoice_list}), 200

# Route to create a new invoice
@invoices_bp.route('/create', methods=['POST'])
@jwt_required()
@permission_required(Permissions.GENERATE_INVOICE)
def create_invoice():
    data = request.get_json()
    required_fields = ['user_id', 'service_cost', 'booking_id']

    # Validate required fields
    for field in required_fields:
        if not data.get(field):
            return jsonify({"error": f"Missing required field: {field}"}), 400

    invoice = Invoice(
        user_id=data['user_id'],
        service_cost=data['service_cost'],
        booking_id=data['booking_id'],
        status=data.get('status', 'pending'),  # Default status to 'pending'
        date_of_creation=datetime.utcnow()
    )

    try:
        db.session.add(invoice)
        db.session.commit()
        return jsonify({"message": "Invoice created successfully", "invoice_id": invoice.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Route to update an existing invoice
@invoices_bp.route('/<int:invoice_id>', methods=['PUT'])
@jwt_required()
@permission_required(Permissions.GENERATE_INVOICE)
def update_invoice(invoice_id):
    invoice = Invoice.query.get_or_404(invoice_id)
    data = request.get_json()

    invoice.service_cost = data.get('service_cost', invoice.service_cost)
    invoice.status = data.get('status', invoice.status)

    try:
        db.session.commit()
        return jsonify({"message": "Invoice updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Route to delete an invoice
@invoices_bp.route('/<int:invoice_id>', methods=['DELETE'])
@jwt_required()
@permission_required(Permissions.GENERATE_INVOICE)
def delete_invoice(invoice_id):
    invoice = Invoice.query.get_or_404(invoice_id)

    try:
        db.session.delete(invoice)
        db.session.commit()
        return jsonify({"message": "Invoice deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Route to retrieve a specific invoice by user ID
@invoices_bp.route('/user/<int:user_id>', methods=['GET'])
@jwt_required()
def get_invoice_by_user_id(user_id):
    invoices = Invoice.query.filter_by(user_id=user_id).all()
    if not invoices:
        return jsonify({"error": "No invoices found for the given user ID"}), 404

    invoice_list = [
        {
            "invoice_id": invoice.invoice_id,
            "user_id": invoice.user_id,
            "service_cost": invoice.service_cost,
            "status": invoice.status,
            "date_of_creation": invoice.date_of_creation,
        }
        for invoice in invoices
    ]
    return jsonify(invoice_list), 200

# Route to retrieve a specific invoice by invoice ID
@invoices_bp.route('/<int:invoice_id>', methods=['GET'])
@jwt_required()
def get_invoice(invoice_id):
    invoices = Invoice.query.filter_by(invoice_id=invoice_id).all()
    if not invoices:
        return jsonify({"error": "No invoices found for the given user ID"}), 404

    invoice_list = [
        {
            "invoice_id": invoice.invoice_id,
            "user_id": invoice.user_id,
            "service_cost": invoice.service_cost,
            "status": invoice.status,
            "date_of_creation": invoice.date_of_creation,
        }
        for invoice in invoices
    ]
    return jsonify(invoice_list), 200

# Route to accept an invoice
@invoices_bp.route('/accept/<int:invoice_id>', methods=['PATCH'])
@jwt_required()
def accept_invoice(invoice_id):
    invoice = Invoice.query.get_or_404(invoice_id)
    invoice.status = 'accepted'

    try:
        db.session.commit()
        return jsonify({"message": "Invoice accepted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Route to decline an invoice
@invoices_bp.route('/decline/<int:invoice_id>', methods=['PATCH'])
@jwt_required()
def decline_invoice(invoice_id):
    invoice = Invoice.query.get_or_404(invoice_id)
    invoice.status = 'declined'

    try:
        db.session.commit()
        return jsonify({"message": "Invoice declined successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

