from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Invoice, User, Permissions
from app.extensions import db
from app.utils.decorators import permission_required
from app.invoices import invoices_bp
from datetime import datetime

# Route to retrieve all invoices
@invoices_bp.route('/invoices', methods=['GET'])
@jwt_required()
def get_invoices():
    invoices = Invoice.query.all()
    invoice_list = [
        {
            "invoice_id": invoice.invoice_id,
            "user_id": invoice.user_id,
            "amount": invoice.amount,
            "status": invoice.status,
            "date_of_creation": invoice.date_of_creation
        }
        for invoice in invoices
    ]
    return jsonify({"invoices": invoice_list}), 200

# Route to create a new invoice
@invoices_bp.route('/invoices', methods=['POST'])
@jwt_required()
@permission_required(Permissions.GENERATE_INVOICE)
def create_invoice():
    data = request.get_json()
    required_fields = ['user_id', 'amount']

    # Validate required fields
    for field in required_fields:
        if not data.get(field):
            return jsonify({"error": f"Missing required field: {field}"}), 400

    invoice = Invoice(
        user_id=data['user_id'],
        amount=data['amount'],
        status=data.get('status', 'pending'),  # Default status to 'pending'
        date_of_creation=datetime.utcnow()
    )

    try:
        db.session.add(invoice)
        db.session.commit()
        return jsonify({"message": "Invoice created successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Route to update an existing invoice
@invoices_bp.route('/invoices/<int:invoice_id>', methods=['PUT'])
@jwt_required()
@permission_required(Permissions.GENERATE_INVOICE)
def update_invoice(invoice_id):
    invoice = Invoice.query.get_or_404(invoice_id)
    data = request.get_json()

    invoice.amount = data.get('amount', invoice.amount)
    invoice.status = data.get('status', invoice.status)

    try:
        db.session.commit()
        return jsonify({"message": "Invoice updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Route to delete an invoice
@invoices_bp.route('/invoices/<int:invoice_id>', methods=['DELETE'])
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

# Route to retrieve a specific invoice by ID
@invoices_bp.route('/invoices/<int:invoice_id>', methods=['GET'])
@jwt_required()
def get_invoice(invoice_id):
    invoice = Invoice.query.get_or_404(invoice_id)
    invoice_data = {
        "invoice_id": invoice.invoice_id,
        "user_id": invoice.user_id,
        "amount": invoice.amount,
        "status": invoice.status,
        "date_of_creation": invoice.date_of_creation
    }
    return jsonify(invoice_data), 200
