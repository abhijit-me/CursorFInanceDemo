-- Seed data for Personal Finance Manager

-- Insert default categories
INSERT INTO cfinance.categories (name, icon, color) VALUES
    ('Groceries', 'shopping_cart', '#4CAF50'),
    ('Dining', 'restaurant', '#FF9800'),
    ('Transportation', 'directions_car', '#2196F3'),
    ('Utilities', 'flash_on', '#9C27B0'),
    ('Entertainment', 'movie', '#E91E63'),
    ('Shopping', 'shopping_bag', '#00BCD4'),
    ('Healthcare', 'local_hospital', '#F44336'),
    ('Housing', 'home', '#795548'),
    ('Personal', 'person', '#607D8B'),
    ('Education', 'school', '#3F51B5'),
    ('Insurance', 'security', '#009688'),
    ('Savings', 'account_balance', '#8BC34A'),
    ('Other', 'more_horiz', '#9E9E9E')
ON CONFLICT (name) DO NOTHING;

-- Insert categorization rules for auto-categorization
INSERT INTO cfinance.categorization_rules (category_id, keyword, priority) VALUES
    -- Groceries
    ((SELECT id FROM cfinance.categories WHERE name = 'Groceries'), 'walmart', 10),
    ((SELECT id FROM cfinance.categories WHERE name = 'Groceries'), 'costco', 10),
    ((SELECT id FROM cfinance.categories WHERE name = 'Groceries'), 'safeway', 10),
    ((SELECT id FROM cfinance.categories WHERE name = 'Groceries'), 'kroger', 10),
    ((SELECT id FROM cfinance.categories WHERE name = 'Groceries'), 'whole foods', 10),
    ((SELECT id FROM cfinance.categories WHERE name = 'Groceries'), 'trader joe', 10),
    ((SELECT id FROM cfinance.categories WHERE name = 'Groceries'), 'grocery', 10),
    ((SELECT id FROM cfinance.categories WHERE name = 'Groceries'), 'supermarket', 10),
    
    -- Dining
    ((SELECT id FROM cfinance.categories WHERE name = 'Dining'), 'restaurant', 10),
    ((SELECT id FROM cfinance.categories WHERE name = 'Dining'), 'starbucks', 10),
    ((SELECT id FROM cfinance.categories WHERE name = 'Dining'), 'mcdonald', 10),
    ((SELECT id FROM cfinance.categories WHERE name = 'Dining'), 'pizza', 10),
    ((SELECT id FROM cfinance.categories WHERE name = 'Dining'), 'cafe', 10),
    ((SELECT id FROM cfinance.categories WHERE name = 'Dining'), 'coffee', 10),
    
    -- Transportation
    ((SELECT id FROM cfinance.categories WHERE name = 'Transportation'), 'uber', 10),
    ((SELECT id FROM cfinance.categories WHERE name = 'Transportation'), 'lyft', 10),
    ((SELECT id FROM cfinance.categories WHERE name = 'Transportation'), 'gas', 10),
    ((SELECT id FROM cfinance.categories WHERE name = 'Transportation'), 'fuel', 10),
    ((SELECT id FROM cfinance.categories WHERE name = 'Transportation'), 'parking', 10),
    
    -- Utilities
    ((SELECT id FROM cfinance.categories WHERE name = 'Utilities'), 'electric', 10),
    ((SELECT id FROM cfinance.categories WHERE name = 'Utilities'), 'water', 10),
    ((SELECT id FROM cfinance.categories WHERE name = 'Utilities'), 'internet', 10),
    ((SELECT id FROM cfinance.categories WHERE name = 'Utilities'), 'phone', 10),
    
    -- Entertainment
    ((SELECT id FROM cfinance.categories WHERE name = 'Entertainment'), 'netflix', 10),
    ((SELECT id FROM cfinance.categories WHERE name = 'Entertainment'), 'spotify', 10),
    ((SELECT id FROM cfinance.categories WHERE name = 'Entertainment'), 'movie', 10),
    ((SELECT id FROM cfinance.categories WHERE name = 'Entertainment'), 'cinema', 10),
    
    -- Shopping
    ((SELECT id FROM cfinance.categories WHERE name = 'Shopping'), 'amazon', 10),
    ((SELECT id FROM cfinance.categories WHERE name = 'Shopping'), 'target', 9),
    ((SELECT id FROM cfinance.categories WHERE name = 'Shopping'), 'ebay', 10),
    
    -- Healthcare
    ((SELECT id FROM cfinance.categories WHERE name = 'Healthcare'), 'pharmacy', 10),
    ((SELECT id FROM cfinance.categories WHERE name = 'Healthcare'), 'doctor', 10),
    ((SELECT id FROM cfinance.categories WHERE name = 'Healthcare'), 'hospital', 10),
    ((SELECT id FROM cfinance.categories WHERE name = 'Healthcare'), 'cvs', 10),
    ((SELECT id FROM cfinance.categories WHERE name = 'Healthcare'), 'walgreens', 10),
    
    -- Housing
    ((SELECT id FROM cfinance.categories WHERE name = 'Housing'), 'rent', 10),
    ((SELECT id FROM cfinance.categories WHERE name = 'Housing'), 'mortgage', 10);

-- Demo user (password: demo123)
-- Password hash generated using werkzeug.security.generate_password_hash('demo123')
INSERT INTO cfinance.users (email, username, password_hash, first_name, last_name) VALUES
    ('demo@financeapp.com', 'demo', 'scrypt:32768:8:1$2ck7mg1iQ7cvTpBZ$889effd9a756d48b7d8192657f64fbaa7782b1d30499e0c2ab118a0ee083e8aa9a2019e048be8eec47365d39d0d3e783086c5b3f0b44d93ceb2749b44d7495b3', 'Demo', 'User')
ON CONFLICT (email) DO NOTHING;

-- Note: To create a real password hash, run this in Python:
-- from werkzeug.security import generate_password_hash
-- print(generate_password_hash('your_password'))

