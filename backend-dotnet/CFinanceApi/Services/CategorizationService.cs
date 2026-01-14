using CFinanceApi.Data;
using CFinanceApi.Models;
using Microsoft.EntityFrameworkCore;

namespace CFinanceApi.Services;

public interface ICategorizationService
{
    Task<int?> AutoCategorizeExpenseAsync(string? description);
}

public class CategorizationService : ICategorizationService
{
    private readonly ApplicationDbContext _context;

    // Fallback category keywords
    private static readonly Dictionary<string, string[]> CategoryKeywords = new()
    {
        ["Groceries"] = new[] { "grocery", "supermarket", "walmart", "target", "costco", "whole foods", "trader joe", "safeway", "kroger" },
        ["Dining"] = new[] { "restaurant", "cafe", "coffee", "starbucks", "mcdonald", "pizza", "burger", "food", "dining", "lunch", "dinner", "breakfast" },
        ["Transportation"] = new[] { "uber", "lyft", "taxi", "gas", "fuel", "parking", "metro", "bus", "train", "transit" },
        ["Utilities"] = new[] { "electric", "water", "gas bill", "internet", "phone", "utility", "telecom", "at&t", "verizon" },
        ["Entertainment"] = new[] { "movie", "cinema", "netflix", "spotify", "hulu", "disney", "game", "concert", "theater" },
        ["Shopping"] = new[] { "amazon", "ebay", "store", "shop", "retail", "clothes", "clothing" },
        ["Healthcare"] = new[] { "pharmacy", "doctor", "hospital", "medical", "health", "cvs", "walgreens", "clinic" },
        ["Housing"] = new[] { "rent", "mortgage", "insurance", "property" },
        ["Personal"] = new[] { "salon", "barber", "gym", "fitness", "spa" },
        ["Other"] = Array.Empty<string>()
    };

    public CategorizationService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<int?> AutoCategorizeExpenseAsync(string? description)
    {
        if (string.IsNullOrWhiteSpace(description))
            return null;

        var descriptionLower = description.ToLower();

        // Try to match with existing categorization rules
        var rules = await _context.CategorizationRules
            .OrderByDescending(r => r.Priority)
            .ToListAsync();

        foreach (var rule in rules)
        {
            if (descriptionLower.Contains(rule.Keyword.ToLower()))
            {
                return rule.CategoryId;
            }
        }

        // Fallback to hardcoded rules
        foreach (var (categoryName, keywords) in CategoryKeywords)
        {
            foreach (var keyword in keywords)
            {
                if (descriptionLower.Contains(keyword))
                {
                    var category = await _context.Categories
                        .FirstOrDefaultAsync(c => c.Name == categoryName);
                    if (category != null)
                    {
                        return category.Id;
                    }
                }
            }
        }

        // Return "Other" category as final fallback
        var otherCategory = await _context.Categories
            .FirstOrDefaultAsync(c => c.Name == "Other");
        return otherCategory?.Id;
    }
}
