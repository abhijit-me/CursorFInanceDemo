from flask import Blueprint, request, jsonify, send_from_directory, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Expense, Category
from utils.categorization import auto_categorize_expense
from utils.file_upload import save_receipt, delete_receipt
from datetime import datetime, date

expenses_bp = Blueprint('expenses', __name__)

@expenses_bp.route('', methods=['GET'])
@jwt_required()
def get_expenses():
    """Get all expenses for current user with optional filters"""
    current_user_id = int(get_jwt_identity())
    
    # Build query
    query = Expense.query.filter_by(user_id=current_user_id)
    
    # Apply filters
    category_id = request.args.get('category_id', type=int)
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    if category_id:
        query = query.filter_by(category_id=category_id)
    
    if start_date:
        try:
            start = datetime.strptime(start_date, '%Y-%m-%d').date()
            query = query.filter(Expense.date >= start)
        except ValueError:
            pass
    
    if end_date:
        try:
            end = datetime.strptime(end_date, '%Y-%m-%d').date()
            query = query.filter(Expense.date <= end)
        except ValueError:
            pass
    
    # Order by date descending
    expenses = query.order_by(Expense.date.desc()).all()
    
    return jsonify([expense.to_dict() for expense in expenses]), 200

@expenses_bp.route('/<int:expense_id>', methods=['GET'])
@jwt_required()
def get_expense(expense_id):
    """Get a specific expense"""
    current_user_id = int(get_jwt_identity())
    expense = Expense.query.filter_by(id=expense_id, user_id=current_user_id).first()
    
    if not expense:
        return jsonify({'error': 'Expense not found'}), 404
    
    return jsonify(expense.to_dict()), 200

@expenses_bp.route('', methods=['POST'])
@jwt_required()
def create_expense():
    """Create a new expense"""
    current_user_id = int(get_jwt_identity())
    
    # Handle multipart form data (for file upload)
    if request.content_type and 'multipart/form-data' in request.content_type:
        data = request.form.to_dict()
        file = request.files.get('receipt')
    else:
        data = request.get_json()
        file = None
    
    # Validate required fields
    if not data.get('amount') or not data.get('description'):
        return jsonify({'error': 'Amount and description are required'}), 400
    
    # Auto-categorize if category not provided
    category_id = data.get('category_id')
    if not category_id:
        category_id = auto_categorize_expense(data.get('description'), db.session)
    
    if not category_id:
        return jsonify({'error': 'Category is required and could not be auto-detected'}), 400
    
    # Handle receipt upload
    receipt_path = None
    if file:
        receipt_path = save_receipt(file)
    
    # Parse date
    expense_date = date.today()
    if data.get('date'):
        try:
            expense_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        except ValueError:
            pass
    
    # Create expense
    expense = Expense(
        user_id=current_user_id,
        category_id=int(category_id),
        amount=float(data['amount']),
        description=data['description'],
        notes=data.get('notes', ''),
        date=expense_date,
        receipt_path=receipt_path,
        is_recurring=data.get('is_recurring', False)
    )
    
    db.session.add(expense)
    db.session.commit()
    
    return jsonify({
        'message': 'Expense created successfully',
        'expense': expense.to_dict()
    }), 201

@expenses_bp.route('/<int:expense_id>', methods=['PUT'])
@jwt_required()
def update_expense(expense_id):
    """Update an expense"""
    current_user_id = int(get_jwt_identity())
    expense = Expense.query.filter_by(id=expense_id, user_id=current_user_id).first()
    
    if not expense:
        return jsonify({'error': 'Expense not found'}), 404
    
    # Handle multipart form data (for file upload)
    if request.content_type and 'multipart/form-data' in request.content_type:
        data = request.form.to_dict()
        file = request.files.get('receipt')
    else:
        data = request.get_json()
        file = None
    
    # Update fields
    if 'amount' in data:
        expense.amount = float(data['amount'])
    if 'description' in data:
        expense.description = data['description']
    if 'notes' in data:
        expense.notes = data['notes']
    if 'category_id' in data:
        expense.category_id = int(data['category_id'])
    if 'date' in data:
        try:
            expense.date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        except ValueError:
            pass
    if 'is_recurring' in data:
        expense.is_recurring = data['is_recurring']
    
    # Handle receipt upload
    if file:
        # Delete old receipt if exists
        if expense.receipt_path:
            delete_receipt(expense.receipt_path)
        expense.receipt_path = save_receipt(file)
    
    db.session.commit()
    
    return jsonify({
        'message': 'Expense updated successfully',
        'expense': expense.to_dict()
    }), 200

@expenses_bp.route('/<int:expense_id>', methods=['DELETE'])
@jwt_required()
def delete_expense(expense_id):
    """Delete an expense"""
    current_user_id = int(get_jwt_identity())
    expense = Expense.query.filter_by(id=expense_id, user_id=current_user_id).first()
    
    if not expense:
        return jsonify({'error': 'Expense not found'}), 404
    
    # Delete receipt file if exists
    if expense.receipt_path:
        delete_receipt(expense.receipt_path)
    
    db.session.delete(expense)
    db.session.commit()
    
    return jsonify({'message': 'Expense deleted successfully'}), 200

@expenses_bp.route('/receipts/<filename>', methods=['GET'])
@jwt_required()
def get_receipt(filename):
    """Get a receipt file"""
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)

