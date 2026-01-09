from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Expense, Budget, RecurringBill, SavingsGoal, Category
from datetime import datetime, date, timedelta
from sqlalchemy import func, and_, extract
from collections import defaultdict

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    """Get dashboard statistics"""
    current_user_id = int(get_jwt_identity())
    
    # Get date range (default to current month)
    today = date.today()
    start_date = date(today.year, today.month, 1)
    if today.month == 12:
        end_date = date(today.year + 1, 1, 1)
    else:
        end_date = date(today.year, today.month + 1, 1)
    
    # Total expenses this month
    total_expenses = db.session.query(func.sum(Expense.amount)).filter(
        and_(
            Expense.user_id == current_user_id,
            Expense.date >= start_date,
            Expense.date < end_date
        )
    ).scalar() or 0
    
    # Total budget for this month
    total_budget = db.session.query(func.sum(Budget.amount)).filter(
        and_(
            Budget.user_id == current_user_id,
            Budget.period == 'monthly'
        )
    ).scalar() or 0
    
    # Upcoming bills (next 30 days)
    upcoming_date = today + timedelta(days=30)
    upcoming_bills = RecurringBill.query.filter(
        and_(
            RecurringBill.user_id == current_user_id,
            RecurringBill.is_active == True,
            RecurringBill.next_due_date >= today,
            RecurringBill.next_due_date <= upcoming_date
        )
    ).count()
    
    # Active savings goals
    active_savings_goals = SavingsGoal.query.filter(
        and_(
            SavingsGoal.user_id == current_user_id,
            SavingsGoal.is_completed == False
        )
    ).count()
    
    # Total saved in savings goals
    total_saved = db.session.query(func.sum(SavingsGoal.current_amount)).filter(
        SavingsGoal.user_id == current_user_id
    ).scalar() or 0
    
    return jsonify({
        'total_expenses': float(total_expenses),
        'total_budget': float(total_budget),
        'budget_remaining': float(total_budget) - float(total_expenses),
        'budget_percentage': (float(total_expenses) / float(total_budget) * 100) if total_budget > 0 else 0,
        'upcoming_bills': upcoming_bills,
        'active_savings_goals': active_savings_goals,
        'total_saved': float(total_saved)
    }), 200

@dashboard_bp.route('/spending-by-category', methods=['GET'])
@jwt_required()
def get_spending_by_category():
    """Get spending breakdown by category"""
    current_user_id = int(get_jwt_identity())
    
    # Get date range from query params
    period = request.args.get('period', 'month')  # month, year, all
    today = date.today()
    
    if period == 'month':
        start_date = date(today.year, today.month, 1)
    elif period == 'year':
        start_date = date(today.year, 1, 1)
    else:
        start_date = date(2000, 1, 1)  # All time
    
    # Query spending by category
    spending = db.session.query(
        Category.id,
        Category.name,
        Category.color,
        Category.icon,
        func.sum(Expense.amount).label('total')
    ).join(Expense).filter(
        and_(
            Expense.user_id == current_user_id,
            Expense.date >= start_date
        )
    ).group_by(Category.id, Category.name, Category.color, Category.icon).all()
    
    result = []
    for cat_id, name, color, icon, total in spending:
        result.append({
            'category_id': cat_id,
            'category_name': name,
            'color': color,
            'icon': icon,
            'amount': float(total)
        })
    
    return jsonify(result), 200

@dashboard_bp.route('/spending-trend', methods=['GET'])
@jwt_required()
def get_spending_trend():
    """Get spending trend over time"""
    current_user_id = int(get_jwt_identity())
    
    # Get period from query params
    period = request.args.get('period', '6months')  # 6months, year
    today = date.today()
    
    if period == 'year':
        months = 12
    else:
        months = 6
    
    result = []
    
    for i in range(months - 1, -1, -1):
        # Calculate month
        month = today.month - i
        year = today.year
        
        while month <= 0:
            month += 12
            year -= 1
        
        # Get start and end date for this month
        start_date = date(year, month, 1)
        if month == 12:
            end_date = date(year + 1, 1, 1)
        else:
            end_date = date(year, month + 1, 1)
        
        # Query total for this month
        total = db.session.query(func.sum(Expense.amount)).filter(
            and_(
                Expense.user_id == current_user_id,
                Expense.date >= start_date,
                Expense.date < end_date
            )
        ).scalar() or 0
        
        result.append({
            'month': f"{year}-{month:02d}",
            'amount': float(total)
        })
    
    return jsonify(result), 200

@dashboard_bp.route('/recent-expenses', methods=['GET'])
@jwt_required()
def get_recent_expenses():
    """Get recent expenses"""
    current_user_id = int(get_jwt_identity())
    
    limit = request.args.get('limit', 10, type=int)
    
    expenses = Expense.query.filter_by(user_id=current_user_id)\
        .order_by(Expense.date.desc(), Expense.created_at.desc())\
        .limit(limit).all()
    
    return jsonify([expense.to_dict() for expense in expenses]), 200

@dashboard_bp.route('/budget-overview', methods=['GET'])
@jwt_required()
def get_budget_overview():
    """Get budget overview with spending"""
    current_user_id = int(get_jwt_identity())
    
    today = date.today()
    start_date = date(today.year, today.month, 1)
    if today.month == 12:
        end_date = date(today.year + 1, 1, 1)
    else:
        end_date = date(today.year, today.month + 1, 1)
    
    # Get all budgets
    budgets = Budget.query.filter_by(user_id=current_user_id, period='monthly').all()
    
    result = []
    for budget in budgets:
        # Get spending for this category
        spent = db.session.query(func.sum(Expense.amount)).filter(
            and_(
                Expense.user_id == current_user_id,
                Expense.category_id == budget.category_id,
                Expense.date >= start_date,
                Expense.date < end_date
            )
        ).scalar() or 0
        
        budget_dict = budget.to_dict()
        budget_dict['spent'] = float(spent)
        budget_dict['remaining'] = float(budget.amount) - float(spent)
        budget_dict['percentage'] = (float(spent) / float(budget.amount) * 100) if budget.amount > 0 else 0
        
        # Status indicator
        if budget_dict['percentage'] >= 100:
            budget_dict['status'] = 'exceeded'
        elif budget_dict['percentage'] >= 80:
            budget_dict['status'] = 'warning'
        else:
            budget_dict['status'] = 'good'
        
        result.append(budget_dict)
    
    return jsonify(result), 200

