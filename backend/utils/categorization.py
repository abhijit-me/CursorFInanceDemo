from models import Category, CategorizationRule

def auto_categorize_expense(description, db_session):
    """
    Automatically categorize an expense based on description using rule-based logic.
    Returns the category_id or None if no match found.
    """
    if not description:
        return None
    
    description_lower = description.lower()
    
    # Get all categorization rules ordered by priority
    rules = CategorizationRule.query.order_by(CategorizationRule.priority.desc()).all()
    
    # Try to match with existing rules
    for rule in rules:
        if rule.keyword.lower() in description_lower:
            return rule.category_id
    
    # Fallback to hardcoded rules if no custom rules match
    category_keywords = {
        'Groceries': ['grocery', 'supermarket', 'walmart', 'target', 'costco', 'whole foods', 'trader joe', 'safeway', 'kroger'],
        'Dining': ['restaurant', 'cafe', 'coffee', 'starbucks', 'mcdonald', 'pizza', 'burger', 'food', 'dining', 'lunch', 'dinner', 'breakfast'],
        'Transportation': ['uber', 'lyft', 'taxi', 'gas', 'fuel', 'parking', 'metro', 'bus', 'train', 'transit'],
        'Utilities': ['electric', 'water', 'gas bill', 'internet', 'phone', 'utility', 'telecom', 'at&t', 'verizon'],
        'Entertainment': ['movie', 'cinema', 'netflix', 'spotify', 'hulu', 'disney', 'game', 'concert', 'theater'],
        'Shopping': ['amazon', 'ebay', 'store', 'shop', 'retail', 'clothes', 'clothing'],
        'Healthcare': ['pharmacy', 'doctor', 'hospital', 'medical', 'health', 'cvs', 'walgreens', 'clinic'],
        'Housing': ['rent', 'mortgage', 'insurance', 'property'],
        'Personal': ['salon', 'barber', 'gym', 'fitness', 'spa'],
        'Other': []
    }
    
    # Match against fallback keywords
    for category_name, keywords in category_keywords.items():
        for keyword in keywords:
            if keyword in description_lower:
                category = Category.query.filter_by(name=category_name).first()
                if category:
                    return category.id
    
    # Return "Other" category as final fallback
    other_category = Category.query.filter_by(name='Other').first()
    return other_category.id if other_category else None

