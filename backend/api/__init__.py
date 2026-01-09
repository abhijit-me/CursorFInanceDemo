from flask import Blueprint

def register_blueprints(app):
    """Register all API blueprints"""
    from api.auth import auth_bp
    from api.expenses import expenses_bp
    from api.budgets import budgets_bp
    from api.recurring_bills import recurring_bills_bp
    from api.savings_goals import savings_goals_bp
    from api.categories import categories_bp
    from api.dashboard import dashboard_bp
    from api.monthly_report import monthly_report_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(expenses_bp, url_prefix='/api/expenses')
    app.register_blueprint(budgets_bp, url_prefix='/api/budgets')
    app.register_blueprint(recurring_bills_bp, url_prefix='/api/recurring-bills')
    app.register_blueprint(savings_goals_bp, url_prefix='/api/savings-goals')
    app.register_blueprint(categories_bp, url_prefix='/api/categories')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    app.register_blueprint(monthly_report_bp, url_prefix='/api/monthly-report')

