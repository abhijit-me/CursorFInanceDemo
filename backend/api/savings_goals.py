from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, SavingsGoal
from datetime import datetime, date

savings_goals_bp = Blueprint('savings_goals', __name__)

@savings_goals_bp.route('', methods=['GET'])
@jwt_required()
def get_savings_goals():
    """Get all savings goals for current user"""
    current_user_id = int(get_jwt_identity())
    
    # Filter by completion status if specified
    is_completed = request.args.get('is_completed')
    query = SavingsGoal.query.filter_by(user_id=current_user_id)
    
    if is_completed is not None:
        query = query.filter_by(is_completed=is_completed.lower() == 'true')
    
    goals = query.order_by(SavingsGoal.created_at.desc()).all()
    
    return jsonify([goal.to_dict() for goal in goals]), 200

@savings_goals_bp.route('/<int:goal_id>', methods=['GET'])
@jwt_required()
def get_savings_goal(goal_id):
    """Get a specific savings goal"""
    current_user_id = int(get_jwt_identity())
    goal = SavingsGoal.query.filter_by(id=goal_id, user_id=current_user_id).first()
    
    if not goal:
        return jsonify({'error': 'Savings goal not found'}), 404
    
    return jsonify(goal.to_dict()), 200

@savings_goals_bp.route('', methods=['POST'])
@jwt_required()
def create_savings_goal():
    """Create a new savings goal"""
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    
    # Validate required fields
    if not data.get('name') or not data.get('target_amount'):
        return jsonify({'error': 'Name and target amount are required'}), 400
    
    # Parse target date
    target_date = None
    if data.get('target_date'):
        try:
            target_date = datetime.strptime(data['target_date'], '%Y-%m-%d').date()
        except ValueError:
            pass
    
    # Create goal
    goal = SavingsGoal(
        user_id=current_user_id,
        name=data['name'],
        target_amount=float(data['target_amount']),
        current_amount=float(data.get('current_amount', 0)),
        target_date=target_date,
        icon=data.get('icon', 'savings'),
        color=data.get('color', '#4CAF50')
    )
    
    # Check if already completed
    if goal.current_amount >= goal.target_amount:
        goal.is_completed = True
    
    db.session.add(goal)
    db.session.commit()
    
    return jsonify({
        'message': 'Savings goal created successfully',
        'goal': goal.to_dict()
    }), 201

@savings_goals_bp.route('/<int:goal_id>', methods=['PUT'])
@jwt_required()
def update_savings_goal(goal_id):
    """Update a savings goal"""
    current_user_id = int(get_jwt_identity())
    goal = SavingsGoal.query.filter_by(id=goal_id, user_id=current_user_id).first()
    
    if not goal:
        return jsonify({'error': 'Savings goal not found'}), 404
    
    data = request.get_json()
    
    # Update fields
    if 'name' in data:
        goal.name = data['name']
    if 'target_amount' in data:
        goal.target_amount = float(data['target_amount'])
    if 'current_amount' in data:
        goal.current_amount = float(data['current_amount'])
    if 'target_date' in data:
        try:
            goal.target_date = datetime.strptime(data['target_date'], '%Y-%m-%d').date()
        except ValueError:
            pass
    if 'icon' in data:
        goal.icon = data['icon']
    if 'color' in data:
        goal.color = data['color']
    if 'is_completed' in data:
        goal.is_completed = data['is_completed']
    
    # Auto-mark as completed if target reached
    if goal.current_amount >= goal.target_amount:
        goal.is_completed = True
    
    db.session.commit()
    
    return jsonify({
        'message': 'Savings goal updated successfully',
        'goal': goal.to_dict()
    }), 200

@savings_goals_bp.route('/<int:goal_id>', methods=['DELETE'])
@jwt_required()
def delete_savings_goal(goal_id):
    """Delete a savings goal"""
    current_user_id = int(get_jwt_identity())
    goal = SavingsGoal.query.filter_by(id=goal_id, user_id=current_user_id).first()
    
    if not goal:
        return jsonify({'error': 'Savings goal not found'}), 404
    
    db.session.delete(goal)
    db.session.commit()
    
    return jsonify({'message': 'Savings goal deleted successfully'}), 200

@savings_goals_bp.route('/<int:goal_id>/contribute', methods=['POST'])
@jwt_required()
def contribute_to_goal(goal_id):
    """Add money to a savings goal"""
    current_user_id = int(get_jwt_identity())
    goal = SavingsGoal.query.filter_by(id=goal_id, user_id=current_user_id).first()
    
    if not goal:
        return jsonify({'error': 'Savings goal not found'}), 404
    
    data = request.get_json()
    
    if not data.get('amount'):
        return jsonify({'error': 'Amount is required'}), 400
    
    amount = float(data['amount'])
    goal.current_amount += amount
    
    # Auto-mark as completed if target reached
    if goal.current_amount >= goal.target_amount:
        goal.is_completed = True
    
    db.session.commit()
    
    return jsonify({
        'message': 'Contribution added successfully',
        'goal': goal.to_dict()
    }), 200

