-- Sample Data for Personal Finance Manager
-- This file populates the demo user account with realistic financial data
-- Run this after init.sql and seed.sql

-- Get the demo user ID
DO $$
DECLARE
    demo_user_id INTEGER;
    groceries_id INTEGER;
    dining_id INTEGER;
    transport_id INTEGER;
    utilities_id INTEGER;
    entertainment_id INTEGER;
    shopping_id INTEGER;
    healthcare_id INTEGER;
    housing_id INTEGER;
    personal_id INTEGER;
    education_id INTEGER;
    insurance_id INTEGER;
    savings_id INTEGER;
    other_id INTEGER;
BEGIN
    -- Get user and category IDs
    SELECT id INTO demo_user_id FROM cfinance.users WHERE email = 'demo@financeapp.com';
    SELECT id INTO groceries_id FROM cfinance.categories WHERE name = 'Groceries';
    SELECT id INTO dining_id FROM cfinance.categories WHERE name = 'Dining';
    SELECT id INTO transport_id FROM cfinance.categories WHERE name = 'Transportation';
    SELECT id INTO utilities_id FROM cfinance.categories WHERE name = 'Utilities';
    SELECT id INTO entertainment_id FROM cfinance.categories WHERE name = 'Entertainment';
    SELECT id INTO shopping_id FROM cfinance.categories WHERE name = 'Shopping';
    SELECT id INTO healthcare_id FROM cfinance.categories WHERE name = 'Healthcare';
    SELECT id INTO housing_id FROM cfinance.categories WHERE name = 'Housing';
    SELECT id INTO personal_id FROM cfinance.categories WHERE name = 'Personal';
    SELECT id INTO education_id FROM cfinance.categories WHERE name = 'Education';
    SELECT id INTO insurance_id FROM cfinance.categories WHERE name = 'Insurance';
    SELECT id INTO savings_id FROM cfinance.categories WHERE name = 'Savings';
    SELECT id INTO other_id FROM cfinance.categories WHERE name = 'Other';

    -- Insert Budgets (13 budgets)
    INSERT INTO cfinance.budgets (user_id, category_id, amount, period, start_date) VALUES
        (demo_user_id, groceries_id, 600.00, 'monthly', '2025-08-01'),
        (demo_user_id, dining_id, 300.00, 'monthly', '2025-08-01'),
        (demo_user_id, transport_id, 250.00, 'monthly', '2025-08-01'),
        (demo_user_id, utilities_id, 200.00, 'monthly', '2025-08-01'),
        (demo_user_id, entertainment_id, 150.00, 'monthly', '2025-08-01'),
        (demo_user_id, shopping_id, 200.00, 'monthly', '2025-08-01'),
        (demo_user_id, healthcare_id, 150.00, 'monthly', '2025-08-01'),
        (demo_user_id, housing_id, 1800.00, 'monthly', '2025-08-01'),
        (demo_user_id, personal_id, 100.00, 'monthly', '2025-08-01'),
        (demo_user_id, education_id, 100.00, 'monthly', '2025-08-01'),
        (demo_user_id, insurance_id, 300.00, 'monthly', '2025-08-01'),
        (demo_user_id, savings_id, 500.00, 'monthly', '2025-08-01'),
        (demo_user_id, other_id, 100.00, 'monthly', '2025-08-01');

    -- Insert Recurring Bills (8 bills)
    INSERT INTO cfinance.recurring_bills (user_id, category_id, name, amount, frequency, next_due_date, reminder_days, is_active, notes) VALUES
        (demo_user_id, housing_id, 'Monthly Rent', 1800.00, 'monthly', '2025-11-01', 5, true, 'Due on the 1st of each month'),
        (demo_user_id, utilities_id, 'Electric Bill', 85.00, 'monthly', '2025-11-15', 3, true, 'PG&E'),
        (demo_user_id, utilities_id, 'Internet Service', 79.99, 'monthly', '2025-11-10', 3, true, 'Comcast Xfinity'),
        (demo_user_id, utilities_id, 'Water Bill', 45.00, 'monthly', '2025-11-20', 3, true, 'City Water Department'),
        (demo_user_id, entertainment_id, 'Netflix Subscription', 15.99, 'monthly', '2025-11-05', 2, true, 'Premium plan'),
        (demo_user_id, entertainment_id, 'Spotify Premium', 10.99, 'monthly', '2025-11-08', 2, true, 'Individual plan'),
        (demo_user_id, insurance_id, 'Car Insurance', 145.00, 'monthly', '2025-11-12', 5, true, 'State Farm'),
        (demo_user_id, insurance_id, 'Health Insurance', 285.00, 'monthly', '2025-11-01', 5, true, 'Blue Cross');

    -- Insert Savings Goals (5 goals)
    INSERT INTO cfinance.savings_goals (user_id, name, target_amount, current_amount, target_date, icon, color, is_completed) VALUES
        (demo_user_id, 'Emergency Fund', 10000.00, 6500.00, '2025-06-30', 'shield', '#4CAF50', false),
        (demo_user_id, 'Vacation to Japan', 5000.00, 2800.00, '2025-09-01', 'flight', '#2196F3', false),
        (demo_user_id, 'New Laptop', 2000.00, 2100.00, '2025-11-30', 'laptop', '#FF9800', true),
        (demo_user_id, 'Car Down Payment', 8000.00, 3200.00, '2025-12-31', 'directions_car', '#9C27B0', false),
        (demo_user_id, 'Home Renovation', 15000.00, 4500.00, '2026-06-30', 'home', '#795548', false);

    -- Insert Expenses (100+ expenses spanning 3 months: Oct, Nov, Dec 2024)
    
    -- October 2024 Expenses (35 expenses)
    INSERT INTO cfinance.expenses (user_id, category_id, amount, description, notes, date, is_recurring) VALUES
        -- Week 1
        (demo_user_id, housing_id, 1800.00, 'Monthly Rent', 'October rent payment', '2025-09-01', false),
        (demo_user_id, groceries_id, 127.45, 'Whole Foods Market', 'Weekly groceries', '2025-09-02', false),
        (demo_user_id, dining_id, 45.80, 'Chipotle Mexican Grill', 'Lunch with colleagues', '2025-09-02', false),
        (demo_user_id, transport_id, 52.00, 'Shell Gas Station', 'Gas fill-up', '2025-09-03', false),
        (demo_user_id, dining_id, 28.50, 'Starbucks Coffee', 'Morning coffees', '2025-09-04', false),
        (demo_user_id, entertainment_id, 15.99, 'Netflix', 'Monthly subscription', '2025-09-05', true),
        (demo_user_id, shopping_id, 89.99, 'Amazon Prime', 'Home office supplies', '2025-09-05', false),
        (demo_user_id, personal_id, 35.00, 'Great Clips', 'Haircut', '2025-09-06', false),
        
        -- Week 2
        (demo_user_id, groceries_id, 143.20, 'Trader Joes', 'Weekly groceries', '2025-09-09', false),
        (demo_user_id, dining_id, 67.30, 'Olive Garden', 'Dinner date night', '2025-09-10', false),
        (demo_user_id, entertainment_id, 10.99, 'Spotify', 'Monthly subscription', '2025-09-10', true),
        (demo_user_id, utilities_id, 79.99, 'Comcast', 'Internet service', '2025-09-10', true),
        (demo_user_id, transport_id, 18.50, 'Uber', 'Ride to downtown', '2025-09-11', false),
        (demo_user_id, insurance_id, 145.00, 'State Farm', 'Car insurance', '2025-09-12', true),
        (demo_user_id, dining_id, 34.20, 'Panera Bread', 'Lunch meeting', '2025-09-12', false),
        (demo_user_id, utilities_id, 88.45, 'PG&E', 'Electricity bill', '2025-09-15', true),
        
        -- Week 3
        (demo_user_id, groceries_id, 156.80, 'Safeway', 'Weekly groceries', '2025-09-16', false),
        (demo_user_id, shopping_id, 124.99, 'Target', 'Household items', '2025-09-17', false),
        (demo_user_id, transport_id, 55.00, 'Chevron', 'Gas fill-up', '2025-09-17', false),
        (demo_user_id, healthcare_id, 25.00, 'CVS Pharmacy', 'Prescription refill', '2025-09-18', false),
        (demo_user_id, dining_id, 42.50, 'Pizza Hut', 'Friday pizza night', '2025-09-18', false),
        (demo_user_id, entertainment_id, 38.00, 'AMC Theaters', 'Movie tickets', '2025-09-19', false),
        (demo_user_id, utilities_id, 45.00, 'City Water', 'Water bill', '2025-09-20', true),
        (demo_user_id, dining_id, 31.75, 'Five Guys', 'Lunch', '2025-09-21', false),
        
        -- Week 4
        (demo_user_id, groceries_id, 138.60, 'Costco', 'Bulk shopping', '2025-09-23', false),
        (demo_user_id, shopping_id, 67.99, 'Best Buy', 'USB cables and accessories', '2025-09-24', false),
        (demo_user_id, transport_id, 23.00, 'Lyft', 'Airport ride', '2025-09-25', false),
        (demo_user_id, dining_id, 85.40, 'The Cheesecake Factory', 'Birthday dinner', '2025-09-25', false),
        (demo_user_id, personal_id, 45.00, 'LA Fitness', 'Gym membership', '2025-09-26', true),
        (demo_user_id, education_id, 49.99, 'Udemy', 'Online course', '2025-09-27', false),
        (demo_user_id, healthcare_id, 150.00, 'Dr. Smith Dental', 'Dental cleaning', '2025-09-28', false),
        (demo_user_id, dining_id, 26.80, 'Subway', 'Quick lunch', '2025-09-29', false),
        (demo_user_id, entertainment_id, 45.00, 'Steam', 'Video game purchase', '2025-09-30', false),
        (demo_user_id, groceries_id, 92.30, 'Whole Foods', 'Last minute items', '2025-09-30', false),
        (demo_user_id, other_id, 15.00, 'Halloween Candy', 'Trick or treat supplies', '2025-09-30', false);

    -- November 2024 Expenses (35 expenses)
    INSERT INTO cfinance.expenses (user_id, category_id, amount, description, notes, date, is_recurring) VALUES
        -- Week 1
        (demo_user_id, housing_id, 1800.00, 'Monthly Rent', 'November rent payment', '2025-10-01', false),
        (demo_user_id, insurance_id, 285.00, 'Blue Cross', 'Health insurance', '2025-10-01', true),
        (demo_user_id, groceries_id, 145.75, 'Trader Joes', 'Weekly groceries', '2025-10-02', false),
        (demo_user_id, transport_id, 58.00, 'Shell', 'Gas fill-up', '2025-10-03', false),
        (demo_user_id, dining_id, 38.90, 'Chipotle', 'Lunch', '2025-10-04', false),
        (demo_user_id, entertainment_id, 15.99, 'Netflix', 'Monthly subscription', '2025-10-05', true),
        (demo_user_id, dining_id, 52.30, 'Local Diner', 'Brunch with friends', '2025-10-05', false),
        (demo_user_id, shopping_id, 156.99, 'Amazon', 'Winter clothes', '2025-10-06', false),
        
        -- Week 2
        (demo_user_id, groceries_id, 167.40, 'Safeway', 'Weekly groceries', '2025-10-09', false),
        (demo_user_id, entertainment_id, 10.99, 'Spotify', 'Monthly subscription', '2025-10-10', true),
        (demo_user_id, utilities_id, 79.99, 'Comcast', 'Internet service', '2025-10-10', true),
        (demo_user_id, transport_id, 22.50, 'Uber', 'Ride home', '2025-10-11', false),
        (demo_user_id, insurance_id, 145.00, 'State Farm', 'Car insurance', '2025-10-12', true),
        (demo_user_id, dining_id, 73.20, 'Red Lobster', 'Dinner celebration', '2025-10-12', false),
        (demo_user_id, personal_id, 65.00, 'Ulta Beauty', 'Personal care items', '2025-10-13', false),
        (demo_user_id, utilities_id, 92.30, 'PG&E', 'Electricity bill', '2025-10-15', true),
        
        -- Week 3
        (demo_user_id, groceries_id, 178.90, 'Whole Foods', 'Weekly groceries', '2025-10-16', false),
        (demo_user_id, transport_id, 60.00, 'Chevron', 'Gas fill-up', '2025-10-17', false),
        (demo_user_id, shopping_id, 89.99, 'Target', 'Home decor', '2025-10-18', false),
        (demo_user_id, healthcare_id, 35.00, 'Walgreens', 'Vitamins and supplements', '2025-10-19', false),
        (demo_user_id, dining_id, 94.50, 'Texas Roadhouse', 'Family dinner', '2025-10-19', false),
        (demo_user_id, utilities_id, 45.00, 'City Water', 'Water bill', '2025-10-20', true),
        (demo_user_id, entertainment_id, 67.00, 'Concert Tickets', 'Live music event', '2025-10-21', false),
        (demo_user_id, dining_id, 29.80, 'Taco Bell', 'Quick dinner', '2025-10-22', false),
        
        -- Week 4 (Thanksgiving)
        (demo_user_id, groceries_id, 234.50, 'Whole Foods', 'Thanksgiving dinner shopping', '2025-10-23', false),
        (demo_user_id, shopping_id, 178.99, 'Black Friday - Best Buy', 'Electronics sale', '2025-10-24', false),
        (demo_user_id, transport_id, 28.00, 'Lyft', 'Shopping trip', '2025-10-24', false),
        (demo_user_id, personal_id, 45.00, 'LA Fitness', 'Gym membership', '2025-10-26', true),
        (demo_user_id, dining_id, 48.30, 'Starbucks', 'Coffee meetings', '2025-10-27', false),
        (demo_user_id, groceries_id, 98.70, 'Trader Joes', 'Post-Thanksgiving restock', '2025-10-28', false),
        (demo_user_id, entertainment_id, 29.99, 'PlayStation Plus', 'Gaming subscription', '2025-10-28', false),
        (demo_user_id, shopping_id, 267.99, 'Cyber Monday - Amazon', 'Holiday shopping', '2025-10-29', false),
        (demo_user_id, healthcare_id, 45.00, 'Urgent Care Visit', 'Cold symptoms checkup', '2025-10-29', false),
        (demo_user_id, dining_id, 56.80, 'Applebees', 'Weekend dinner', '2025-10-30', false),
        (demo_user_id, other_id, 25.00, 'Charity Donation', 'Giving Tuesday', '2025-10-30', false);

    -- December 2024 Expenses (current month - 36 expenses)
    INSERT INTO cfinance.expenses (user_id, category_id, amount, description, notes, date, is_recurring) VALUES
        -- Week 1
        (demo_user_id, housing_id, 1800.00, 'Monthly Rent', 'December rent payment', '2025-11-01', false),
        (demo_user_id, insurance_id, 285.00, 'Blue Cross', 'Health insurance', '2025-11-01', true),
        (demo_user_id, groceries_id, 156.20, 'Safeway', 'Weekly groceries', '2025-11-02', false),
        (demo_user_id, transport_id, 62.00, 'Shell', 'Gas fill-up', '2025-11-03', false),
        (demo_user_id, dining_id, 42.60, 'Panera Bread', 'Lunch', '2025-11-04', false),
        (demo_user_id, entertainment_id, 15.99, 'Netflix', 'Monthly subscription', '2025-11-05', true),
        (demo_user_id, shopping_id, 189.99, 'Holiday Gifts - Target', 'Christmas shopping', '2025-11-06', false),
        (demo_user_id, dining_id, 78.50, 'Outback Steakhouse', 'Dinner with family', '2025-11-07', false),
        
        -- Week 2
        (demo_user_id, groceries_id, 198.75, 'Whole Foods', 'Holiday groceries', '2025-11-09', false),
        (demo_user_id, entertainment_id, 10.99, 'Spotify', 'Monthly subscription', '2025-11-10', true),
        (demo_user_id, utilities_id, 79.99, 'Comcast', 'Internet service', '2025-11-10', true),
        (demo_user_id, shopping_id, 345.00, 'Holiday Gifts - Amazon', 'More Christmas presents', '2025-11-11', false),
        (demo_user_id, insurance_id, 145.00, 'State Farm', 'Car insurance', '2025-11-12', true),
        (demo_user_id, transport_id, 25.00, 'Uber', 'Holiday party ride', '2025-11-13', false),
        (demo_user_id, dining_id, 112.40, 'The Capital Grille', 'Company holiday dinner', '2025-11-13', false),
        (demo_user_id, utilities_id, 105.60, 'PG&E', 'Higher winter electricity', '2025-11-15', true),
        
        -- Week 3
        (demo_user_id, groceries_id, 145.30, 'Trader Joes', 'Weekly groceries', '2025-11-16', false),
        (demo_user_id, transport_id, 65.00, 'Chevron', 'Gas for holiday travel', '2025-11-17', false),
        (demo_user_id, shopping_id, 89.99, 'Wrapping Paper & Decorations', 'Holiday supplies', '2025-11-18', false),
        (demo_user_id, entertainment_id, 55.00, 'Ice Skating Rink', 'Holiday activity', '2025-11-18', false),
        (demo_user_id, dining_id, 68.90, 'Olive Garden', 'Lunch outing', '2025-11-19', false),
        (demo_user_id, utilities_id, 45.00, 'City Water', 'Water bill', '2025-11-20', true),
        (demo_user_id, healthcare_id, 80.00, 'Annual Physical', 'Doctor checkup', '2025-11-20', false),
        (demo_user_id, personal_id, 125.00, 'Spa Day', 'Holiday self-care', '2025-11-21', false),
        
        -- Week 4 (Holiday week)
        (demo_user_id, groceries_id, 267.80, 'Costco', 'Christmas dinner shopping', '2025-11-22', false),
        (demo_user_id, shopping_id, 234.99, 'Last Minute Gifts - Mall', 'Final Christmas presents', '2025-11-23', false),
        (demo_user_id, dining_id, 45.20, 'Starbucks', 'Holiday drinks', '2025-11-23', false),
        (demo_user_id, transport_id, 35.00, 'Lyft', 'Christmas Eve ride', '2025-11-24', false),
        (demo_user_id, dining_id, 156.40, 'Christmas Eve Dinner', 'Family celebration at restaurant', '2025-11-24', false),
        (demo_user_id, entertainment_id, 89.99, 'Holiday Movie Bundle', 'Streaming service rental', '2025-11-25', false),
        (demo_user_id, personal_id, 45.00, 'LA Fitness', 'Gym membership', '2025-11-26', true),
        (demo_user_id, groceries_id, 112.50, 'Post-Holiday Sales', 'Discounted items', '2025-11-26', false),
        (demo_user_id, shopping_id, 178.99, 'After Christmas Sales', 'Clearance shopping', '2025-11-27', false),
        (demo_user_id, dining_id, 92.30, 'PF Changs', 'Dinner with friends', '2025-11-28', false),
        (demo_user_id, other_id, 50.00, 'Year End Donation', 'Charitable giving', '2025-11-29', false),
        (demo_user_id, savings_id, 500.00, 'Monthly Savings Transfer', 'Emergency fund contribution', '2025-11-30', false);

    RAISE NOTICE 'Sample data inserted successfully!';
    RAISE NOTICE 'Total budgets: 13';
    RAISE NOTICE 'Total recurring bills: 8';
    RAISE NOTICE 'Total savings goals: 5';
    RAISE NOTICE 'Total expenses: 106 (spanning Sep-Nov 2025)';
    RAISE NOTICE 'Grand total records: 132';
END $$;

