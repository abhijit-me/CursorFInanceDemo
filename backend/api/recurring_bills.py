from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, RecurringBill
from datetime import datetime, date, timedelta

recurring_bills_bp = Blueprint('recurring_bills', __name__)

@recurring_bills_bp.route('', methods=['GET'])
@jwt_required()
def get_recurring_bills():
    """Get all recurring bills for current user"""
    current_user_id = int(get_jwt_identity())
    
    # Filter by active status if specified
    is_active = request.args.get('is_active')
    query = RecurringBill.query.filter_by(user_id=current_user_id)
    
    if is_active is not None:
        query = query.filter_by(is_active=is_active.lower() == 'true')
    
    bills = query.order_by(RecurringBill.next_due_date).all()
    
    # Add days until due
    result = []
    today = date.today()
    for bill in bills:
        bill_dict = bill.to_dict()
        days_until_due = (bill.next_due_date - today).days
        bill_dict['days_until_due'] = days_until_due
        bill_dict['is_overdue'] = days_until_due < 0
        bill_dict['needs_reminder'] = 0 <= days_until_due <= bill.reminder_days
        result.append(bill_dict)
    
    return jsonify(result), 200

@recurring_bills_bp.route('/<int:bill_id>', methods=['GET'])
@jwt_required()
def get_recurring_bill(bill_id):
    """Get a specific recurring bill"""
    current_user_id = int(get_jwt_identity())
    bill = RecurringBill.query.filter_by(id=bill_id, user_id=current_user_id).first()
    
    if not bill:
        return jsonify({'error': 'Recurring bill not found'}), 404
    
    return jsonify(bill.to_dict()), 200

@recurring_bills_bp.route('', methods=['POST'])
@jwt_required()
def create_recurring_bill():
    """Create a new recurring bill"""
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    
    # Validate required fields
    if not data.get('name') or not data.get('amount') or not data.get('category_id'):
        return jsonify({'error': 'Name, amount, and category are required'}), 400
    
    # Parse next due date
    next_due_date = date.today()
    if data.get('next_due_date'):
        try:
            next_due_date = datetime.strptime(data['next_due_date'], '%Y-%m-%d').date()
        except ValueError:
            pass
    
    # Create bill
    bill = RecurringBill(
        user_id=current_user_id,
        category_id=data['category_id'],
        name=data['name'],
        amount=float(data['amount']),
        frequency=data.get('frequency', 'monthly'),
        next_due_date=next_due_date,
        reminder_days=data.get('reminder_days', 3),
        is_active=data.get('is_active', True),
        notes=data.get('notes', '')
    )
    
    db.session.add(bill)
    db.session.commit()
    
    return jsonify({
        'message': 'Recurring bill created successfully',
        'bill': bill.to_dict()
    }), 201

@recurring_bills_bp.route('/<int:bill_id>', methods=['PUT'])
@jwt_required()
def update_recurring_bill(bill_id):
    """Update a recurring bill"""
    current_user_id = int(get_jwt_identity())
    bill = RecurringBill.query.filter_by(id=bill_id, user_id=current_user_id).first()
    
    if not bill:
        return jsonify({'error': 'Recurring bill not found'}), 404
    
    data = request.get_json()
    
    # Update fields
    if 'name' in data:
        bill.name = data['name']
    if 'amount' in data:
        bill.amount = float(data['amount'])
    if 'category_id' in data:
        bill.category_id = data['category_id']
    if 'frequency' in data:
        bill.frequency = data['frequency']
    if 'next_due_date' in data:
        try:
            bill.next_due_date = datetime.strptime(data['next_due_date'], '%Y-%m-%d').date()
        except ValueError:
            pass
    if 'reminder_days' in data:
        bill.reminder_days = data['reminder_days']
    if 'is_active' in data:
        bill.is_active = data['is_active']
    if 'notes' in data:
        bill.notes = data['notes']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Recurring bill updated successfully',
        'bill': bill.to_dict()
    }), 200

@recurring_bills_bp.route('/<int:bill_id>', methods=['DELETE'])
@jwt_required()
def delete_recurring_bill(bill_id):
    """Delete a recurring bill"""
    current_user_id = int(get_jwt_identity())
    bill = RecurringBill.query.filter_by(id=bill_id, user_id=current_user_id).first()
    
    if not bill:
        return jsonify({'error': 'Recurring bill not found'}), 404
    
    db.session.delete(bill)
    db.session.commit()
    
    return jsonify({'message': 'Recurring bill deleted successfully'}), 200

@recurring_bills_bp.route('/<int:bill_id>/pay', methods=['POST'])
@jwt_required()
def mark_bill_paid(bill_id):
    """Mark a bill as paid and calculate next due date"""
    current_user_id = int(get_jwt_identity())
    bill = RecurringBill.query.filter_by(id=bill_id, user_id=current_user_id).first()
    
    if not bill:
        return jsonify({'error': 'Recurring bill not found'}), 404
    
    # Calculate next due date based on frequency
    if bill.frequency == 'weekly':
        bill.next_due_date = bill.next_due_date + timedelta(weeks=1)
    elif bill.frequency == 'monthly':
        # Add one month
        if bill.next_due_date.month == 12:
            bill.next_due_date = date(bill.next_due_date.year + 1, 1, bill.next_due_date.day)
        else:
            bill.next_due_date = date(bill.next_due_date.year, bill.next_due_date.month + 1, bill.next_due_date.day)
    elif bill.frequency == 'yearly':
        bill.next_due_date = date(bill.next_due_date.year + 1, bill.next_due_date.month, bill.next_due_date.day)
    
    db.session.commit()
    
    return jsonify({
        'message': 'Bill marked as paid',
        'bill': bill.to_dict()
    }), 200

