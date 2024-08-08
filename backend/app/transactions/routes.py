from flask import jsonify;
from app.models import Transaction
from app.transactions import transactions_bp

@transactions_bp.route('/all', methods=['GET'])
def get_transactions():
    transactions = Transaction.query.all()
    transactions_data = [
        {
            'transaction_id': t.transaction_id,
            'payer_name': t.payer_name,
            'payer_phone_number': t.payer_phone_number,
            'amount_paid': t.amount_paid,
            'status': t.status,
            'date_of_transaction': t.date_of_transaction
        } for t in transactions
    ]
    return jsonify(transactions_data)
