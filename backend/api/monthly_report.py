from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Expense, Category
from datetime import date
from sqlalchemy import func, and_, extract
from calendar import monthrange

monthly_report_bp = Blueprint('monthly_report', __name__)

@monthly_report_bp.route('', methods=['GET'])
@jwt_required()
def get_monthly_report():
    """Get monthly report with spending breakdown and details"""
    current_user_id = int(get_jwt_identity())
    
    # Get year and month from query parameters
    year = request.args.get('year', type=int)
    month = request.args.get('month', type=int)
    
    # Validate parameters
    if not year or not month:
        today = date.today()
        year = today.year
        month = today.month
    
    if month < 1 or month > 12:
        return jsonify({'error': 'Invalid month. Must be between 1 and 12'}), 400
    
    # Calculate date range for the selected month
    start_date = date(year, month, 1)
    last_day = monthrange(year, month)[1]
    end_date = date(year, month, last_day)
    
    # Get all expenses for the month
    expenses = Expense.query.filter(
        and_(
            Expense.user_id == current_user_id,
            Expense.date >= start_date,
            Expense.date <= end_date
        )
    ).order_by(Expense.date.asc()).all()
    
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
            Expense.date <= end_date
        )
    ).group_by(Category.id, Category.name, Category.color, Category.icon).all()
    
    # Calculate total amount
    total_amount = sum(expense.amount for expense in expenses)
    
    # Format spending by category
    category_breakdown = []
    for cat_id, name, color, icon, total in spending_by_category:
        category_breakdown.append({
            'category_id': cat_id,
            'category_name': name,
            'color': color,
            'icon': icon,
            'amount': float(total)
        })
    
    # Format response
    return jsonify({
        'month': month,
        'year': year,
        'expenses': [expense.to_dict() for expense in expenses],
        'spending_by_category': category_breakdown,
        'total_amount': float(total_amount)
    }), 200

