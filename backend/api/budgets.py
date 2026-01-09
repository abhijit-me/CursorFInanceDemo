from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Budget, Expense
from datetime import datetime, date
from sqlalchemy import func, and_, extract

budgets_bp = Blueprint('budgets', __name__)

@budgets_bp.route('', methods=['GET'])
@jwt_required()
def get_budgets():
    """Get all budgets for current user"""
    current_user_id = int(get_jwt_identity())
    
    # Get period filter
    period = request.args.get('period', 'monthly')
    
    budgets = Budget.query.filter_by(user_id=current_user_id, period=period).all()
    
    # Calculate spending for each budget
    result = []
    current_date = date.today()
    
    for budget in budgets:
        # Calculate date range based on period
        if period == 'monthly':
            start_date = date(current_date.year, current_date.month, 1)
            if current_date.month == 12:
                end_date = date(current_date.year + 1, 1, 1)
            else:
                end_date = date(current_date.year, current_date.month + 1, 1)
        else:  # yearly
            start_date = date(current_date.year, 1, 1)
            end_date = date(current_date.year + 1, 1, 1)
        
        # Get total spending for this category in current period
        total_spent = db.session.query(func.sum(Expense.amount)).filter(
            and_(
                Expense.user_id == current_user_id,
                Expense.category_id == budget.category_id,
                Expense.date >= start_date,
                Expense.date < end_date
            )
        ).scalar() or 0
        
        budget_dict = budget.to_dict()
        budget_dict['spent'] = float(total_spent)
        budget_dict['remaining'] = float(budget.amount) - float(total_spent)
        budget_dict['percentage'] = (float(total_spent) / float(budget.amount) * 100) if budget.amount > 0 else 0
        
        result.append(budget_dict)
    
    return jsonify(result), 200

@budgets_bp.route('/<int:budget_id>', methods=['GET'])
@jwt_required()
def get_budget(budget_id):
    """Get a specific budget"""
    current_user_id = int(get_jwt_identity())
    budget = Budget.query.filter_by(id=budget_id, user_id=current_user_id).first()
    
    if not budget:
        return jsonify({'error': 'Budget not found'}), 404
    
    return jsonify(budget.to_dict()), 200

@budgets_bp.route('', methods=['POST'])
@jwt_required()
def create_budget():
    """Create a new budget"""
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    
    # Validate required fields
    if not data.get('category_id') or not data.get('amount'):
        return jsonify({'error': 'Category and amount are required'}), 400
    
    period = data.get('period', 'monthly')
    
    # Check if budget already exists for this category and period
    existing = Budget.query.filter_by(
        user_id=current_user_id,
        category_id=data['category_id'],
        period=period
    ).first()
    
    if existing:
        return jsonify({'error': f'Budget already exists for this category and period'}), 400
    
    # Parse dates
    start_date = date.today()
    if data.get('start_date'):
        try:
            start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        except ValueError:
            pass
    
    end_date = None
    if data.get('end_date'):
        try:
            end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
        except ValueError:
            pass
    
    # Create budget
    budget = Budget(
        user_id=current_user_id,
        category_id=data['category_id'],
        amount=float(data['amount']),
        period=period,
        start_date=start_date,
        end_date=end_date
    )
    
    db.session.add(budget)
    db.session.commit()
    
    return jsonify({
        'message': 'Budget created successfully',
        'budget': budget.to_dict()
    }), 201

@budgets_bp.route('/<int:budget_id>', methods=['PUT'])
@jwt_required()
def update_budget(budget_id):
    """Update a budget"""
    current_user_id = int(get_jwt_identity())
    budget = Budget.query.filter_by(id=budget_id, user_id=current_user_id).first()
    
    if not budget:
        return jsonify({'error': 'Budget not found'}), 404
    
    data = request.get_json()
    
    # Update fields
    if 'amount' in data:
        budget.amount = float(data['amount'])
    if 'period' in data:
        budget.period = data['period']
    if 'start_date' in data:
        try:
            budget.start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        except ValueError:
            pass
    if 'end_date' in data:
        try:
            budget.end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
        except ValueError:
            pass
    
    db.session.commit()
    
    return jsonify({
        'message': 'Budget updated successfully',
        'budget': budget.to_dict()
    }), 200

@budgets_bp.route('/<int:budget_id>', methods=['DELETE'])
@jwt_required()
def delete_budget(budget_id):
    """Delete a budget"""
    current_user_id = int(get_jwt_identity())
    budget = Budget.query.filter_by(id=budget_id, user_id=current_user_id).first()
    
    if not budget:
        return jsonify({'error': 'Budget not found'}), 404
    
    db.session.delete(budget)
    db.session.commit()
    
    return jsonify({'message': 'Budget deleted successfully'}), 200

