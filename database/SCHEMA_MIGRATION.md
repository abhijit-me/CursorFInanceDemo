# Schema Migration Guide

This guide explains the schema structure and how to migrate if you're upgrading from a previous version.

## Schema Overview

All database tables are now organized under the `cfinance` schema for better organization and separation.

### Schema Benefits

1. **Logical Organization**: All application tables are grouped under a dedicated schema
2. **Security**: Easier to manage permissions at schema level
3. **Multi-tenancy Ready**: Schema-based separation supports future multi-tenant features
4. **Namespace Isolation**: Prevents naming conflicts with other applications

## Tables in cfinance Schema

- `cfinance.users`
- `cfinance.categories`
- `cfinance.expenses`
- `cfinance.budgets`
- `cfinance.recurring_bills`
- `cfinance.savings_goals`
- `cfinance.categorization_rules`

## Fresh Installation

For new installations, simply run the initialization and seed scripts:

```bash
psql -U financeuser -d financedb -f init.sql
psql -U financeuser -d financedb -f seed.sql
```

The schema will be created automatically.

## Migrating from Non-Schema Version

If you have an existing database without the schema, follow these steps:

### Step 1: Backup Your Data

```bash
# Backup existing database
pg_dump -U financeuser -d financedb > backup_$(date +%Y%m%d).sql
```

### Step 2: Create Schema and Move Tables

```bash
psql -U financeuser -d financedb << EOF
-- Create schema
CREATE SCHEMA IF NOT EXISTS cfinance;

-- Grant permissions
GRANT ALL ON SCHEMA cfinance TO financeuser;
GRANT ALL ON ALL TABLES IN SCHEMA cfinance TO financeuser;
GRANT ALL ON ALL SEQUENCES IN SCHEMA cfinance TO financeuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA cfinance GRANT ALL ON TABLES TO financeuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA cfinance GRANT ALL ON SEQUENCES TO financeuser;

-- Move tables to cfinance schema
ALTER TABLE users SET SCHEMA cfinance;
ALTER TABLE categories SET SCHEMA cfinance;
ALTER TABLE expenses SET SCHEMA cfinance;
ALTER TABLE budgets SET SCHEMA cfinance;
ALTER TABLE recurring_bills SET SCHEMA cfinance;
ALTER TABLE savings_goals SET SCHEMA cfinance;
ALTER TABLE categorization_rules SET SCHEMA cfinance;

-- Move sequences
ALTER SEQUENCE users_id_seq SET SCHEMA cfinance;
ALTER SEQUENCE categories_id_seq SET SCHEMA cfinance;
ALTER SEQUENCE expenses_id_seq SET SCHEMA cfinance;
ALTER SEQUENCE budgets_id_seq SET SCHEMA cfinance;
ALTER SEQUENCE recurring_bills_id_seq SET SCHEMA cfinance;
ALTER SEQUENCE savings_goals_id_seq SET SCHEMA cfinance;
ALTER SEQUENCE categorization_rules_id_seq SET SCHEMA cfinance;
EOF
```

### Step 3: Update Backend Code

The backend code (models.py) is already updated to use the cfinance schema. No additional changes needed.

### Step 4: Restart Application

```bash
# Restart backend
cd backend
python app.py
```

### Step 5: Verify Migration

```bash
# Connect to database
psql -U financeuser -d financedb

# List tables in cfinance schema
\dt cfinance.*

# You should see:
#  cfinance | budgets
#  cfinance | categories
#  cfinance | categorization_rules
#  cfinance | expenses
#  cfinance | recurring_bills
#  cfinance | savings_goals
#  cfinance | users
```

## Rollback (if needed)

If you need to rollback the migration:

```bash
psql -U financeuser -d financedb << EOF
-- Move tables back to public schema
ALTER TABLE cfinance.users SET SCHEMA public;
ALTER TABLE cfinance.categories SET SCHEMA public;
ALTER TABLE cfinance.expenses SET SCHEMA public;
ALTER TABLE cfinance.budgets SET SCHEMA public;
ALTER TABLE cfinance.recurring_bills SET SCHEMA public;
ALTER TABLE cfinance.savings_goals SET SCHEMA public;
ALTER TABLE cfinance.categorization_rules SET SCHEMA public;

-- Move sequences back
ALTER SEQUENCE cfinance.users_id_seq SET SCHEMA public;
ALTER SEQUENCE cfinance.categories_id_seq SET SCHEMA public;
ALTER SEQUENCE cfinance.expenses_id_seq SET SCHEMA public;
ALTER SEQUENCE cfinance.budgets_id_seq SET SCHEMA public;
ALTER SEQUENCE cfinance.recurring_bills_id_seq SET SCHEMA public;
ALTER SEQUENCE cfinance.savings_goals_id_seq SET SCHEMA public;
ALTER SEQUENCE cfinance.categorization_rules_id_seq SET SCHEMA public;

-- Drop schema (if empty)
DROP SCHEMA IF EXISTS cfinance CASCADE;
EOF
```

Then revert the backend models.py changes.

## Troubleshooting

### Permission Denied Errors

If you get permission errors:

```bash
psql -U postgres -d financedb << EOF
GRANT ALL ON SCHEMA cfinance TO financeuser;
GRANT ALL ON ALL TABLES IN SCHEMA cfinance TO financeuser;
GRANT ALL ON ALL SEQUENCES IN SCHEMA cfinance TO financeuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA cfinance GRANT ALL ON TABLES TO financeuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA cfinance GRANT ALL ON SEQUENCES TO financeuser;
EOF
```

### Table Not Found Errors

If you get "table does not exist" errors, verify the schema:

```bash
psql -U financeuser -d financedb
\dt cfinance.*
```

### Foreign Key Constraint Issues

Foreign key constraints should automatically update when tables are moved to the schema. If you encounter issues:

```bash
# Drop and recreate foreign keys
# This is automatically handled by PostgreSQL when using ALTER TABLE SET SCHEMA
```

## Verification Queries

Test that everything is working:

```sql
-- Check schema exists
SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'cfinance';

-- Check tables in schema
SELECT table_name FROM information_schema.tables WHERE table_schema = 'cfinance';

-- Check permissions
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'cfinance' AND grantee = 'financeuser';

-- Test a simple query
SELECT COUNT(*) FROM cfinance.categories;
```

## Best Practices

1. **Always backup** before any schema changes
2. **Test in development** environment first
3. **Run during maintenance window** for production
4. **Verify application** functionality after migration
5. **Monitor logs** for any schema-related errors

## Support

If you encounter issues during migration, please:
1. Check the troubleshooting section above
2. Review PostgreSQL logs: `/var/log/postgresql/`
3. Verify permissions with the verification queries
4. Open an issue on GitHub with details

