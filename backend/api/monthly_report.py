from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Expense, Budget, Category
from datetime import datetime, date
from sqlalchemy import func, and_, extract
from collections import defaultdict

monthly_report_bp = Blueprint('monthly_report', __name__)

@monthly_report_bp.route('', methods=['GET'])
@jwt_required()
def get_monthly_report():
    """Get comprehensive monthly report including spending by category, top categories, and expense details"""
    current_user_id = int(get_jwt_identity())
    
    # Get year and month from query params (default to current month)
    year = request.args.get('year', type=int)
    month = request.args.get('month', type=int)
    
    today = date.today()
    if not year:
        year = today.year
    if not month:
        month = today.month
    
    # Validate month
    if month < 1 or month > 12:
        return jsonify({'error': 'Invalid month. Must be between 1 and 12'}), 400
    
    # Calculate date range for the month
    start_date = date(year, month, 1)
    if month == 12:
        end_date = date(year + 1, 1, 1)
    else:
        end_date = date(year, month + 1, 1)
    
    # Get spending by category
    spending_by_category = db.session.query(
        Category.id,
        Category.name,
        Category.color,
        Category.icon,
        func.sum(Expense.amount).label('total')
    ).join(Expense).filter(
        and_(
            Expense.user_id == current_user_id,
            Expense.date >= start_date,
            Expense.date < end_date
        )
    ).group_by(Category.id, Category.name, Category.color, Category.icon)\
     .order_by(func.sum(Expense.amount).desc()).all()
    
    category_breakdown = []
    total_spending = 0
    for cat_id, name, color, icon, total in spending_by_category:
        category_breakdown.append({
            'category_id': cat_id,
            'category_name': name,
            'color': color,
            'icon': icon,
            'amount': float(total)
        })
        total_spending += float(total)
    
    # Get top 3 categories with budget info
    top_categories = []
    for i, (cat_id, name, color, icon, spent) in enumerate(spending_by_category[:3]):
        # Get budget for this category
        budget = Budget.query.filter_by(
            user_id=current_user_id,
            category_id=cat_id,
            period='monthly'
        ).first()
        
        budget_amount = float(budget.amount) if budget else 0
        spent_amount = float(spent)
        
        top_categories.append({
            'category_id': cat_id,
            'category_name': name,
            'color': color,
            'icon': icon,
            'budget': budget_amount,
            'spending': spent_amount,
            'percentage': (spent_amount / budget_amount * 100) if budget_amount > 0 else 0
        })
    
    # Get all expenses for the month with details
    expenses = Expense.query.filter(
        and_(
            Expense.user_id == current_user_id,
            Expense.date >= start_date,
            Expense.date < end_date
        )
    ).order_by(Expense.date.desc()).all()
    
    expense_details = []
    for expense in expenses:
        expense_details.append({
            'id': expense.id,
            'date': expense.date.isoformat(),
            'description': expense.description,
            'category': {
                'id': expense.category.id,
                'name': expense.category.name,
                'color': expense.category.color,
                'icon': expense.category.icon
            } if expense.category else None,
            'amount': float(expense.amount)
        })
    
    # Get total budget for the month
    total_budget = db.session.query(func.sum(Budget.amount)).filter(
        and_(
            Budget.user_id == current_user_id,
            Budget.period == 'monthly'
        )
    ).scalar() or 0
    
    return jsonify({
        'year': year,
        'month': month,
        'month_name': date(year, month, 1).strftime('%B %Y'),
        'total_spending': float(total_spending),
        'total_budget': float(total_budget),
        'budget_remaining': float(total_budget) - float(total_spending),
        'spending_by_category': category_breakdown,
        'top_categories': top_categories,
        'expense_details': expense_details
    }), 200

@monthly_report_bp.route('/export', methods=['GET'])
@jwt_required()
def export_monthly_report():
    """Export monthly report data in a format suitable for Excel"""
    current_user_id = int(get_jwt_identity())
    
    # Get year and month from query params
    year = request.args.get('year', type=int)
    month = request.args.get('month', type=int)
    
    today = date.today()
    if not year:
        year = today.year
    if not month:
        month = today.month
    
    # Calculate date range for the month
    start_date = date(year, month, 1)
    if month == 12:
        end_date = date(year + 1, 1, 1)
    else:
        end_date = date(year, month + 1, 1)
    
    # Get all expenses for the month
    expenses = Expense.query.filter(
        and_(
            Expense.user_id == current_user_id,
            Expense.date >= start_date,
            Expense.date < end_date
        )
    ).order_by(Expense.date.desc()).all()
    
    # Format data for export
    export_data = []
    for expense in expenses:
        export_data.append({
            'Date': expense.date.strftime('%Y-%m-%d'),
            'Description': expense.description,
            'Category': expense.category.name if expense.category else 'Uncategorized',
            'Amount': float(expense.amount)
        })
    
    return jsonify({
        'month_name': date(year, month, 1).strftime('%B %Y'),
        'data': export_data
    }), 200
