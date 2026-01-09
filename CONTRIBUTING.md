# Contributing to Personal Finance Manager

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## 🤝 How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported
2. Create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, browser, versions)

### Suggesting Features

1. Check existing feature requests
2. Create a new issue describing:
   - The problem it solves
   - Proposed solution
   - Alternative solutions considered
   - Additional context

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit with clear messages
6. Push to your fork
7. Create a Pull Request

## 💻 Development Setup

Follow the [SETUP_GUIDE.md](./SETUP_GUIDE.md) to set up your development environment.

## 📝 Code Style

### Python (Backend)

- Follow PEP 8 style guide
- Use meaningful variable names
- Add docstrings to functions
- Keep functions focused and small

```python
def calculate_budget_remaining(budget, expenses):
    """
    Calculate remaining budget amount.
    
    Args:
        budget (Budget): Budget object
        expenses (list): List of Expense objects
    
    Returns:
        float: Remaining budget amount
    """
    total_spent = sum(expense.amount for expense in expenses)
    return budget.amount - total_spent
```

### TypeScript/Angular (Frontend)

- Follow Angular style guide
- Use TypeScript strict mode
- Add type annotations
- Use meaningful component/service names

```typescript
export interface Budget {
  id?: number;
  amount: number;
  category_id: number;
  // ... more fields
}
```

## 🧪 Testing

### Backend Tests

```bash
cd backend
pytest
```

### Frontend Tests

```bash
cd frontend
ng test
```

## 📋 Commit Message Guidelines

Use clear, descriptive commit messages:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Maintenance tasks

Examples:
```
feat: add expense filtering by date range
fix: correct budget calculation for yearly periods
docs: update API documentation for auth endpoints
```

## 🔍 Code Review Process

1. All code changes require review
2. Address reviewer feedback
3. Keep changes focused and atomic
4. Ensure tests pass
5. Update documentation if needed

## 📚 Documentation

- Update README if adding features
- Document API changes
- Add inline comments for complex logic
- Update setup guides if needed

## 🎯 Priority Areas

We're especially interested in contributions for:

- [ ] Additional expense categories
- [ ] Export functionality (CSV, PDF)
- [ ] Budget templates
- [ ] Email notifications
- [ ] Mobile app
- [ ] Multi-currency support
- [ ] Recurring expense templates
- [ ] Bill payment integration
- [ ] Bank account sync

## ❓ Questions

Feel free to open an issue for questions or join our discussions.

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You

Every contribution, no matter how small, is valuable and appreciated!
