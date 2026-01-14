using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CFinanceApi.Models;

[Table("categories", Schema = "cfinance")]
public class Category
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [MaxLength(50)]
    [Column("icon")]
    public string? Icon { get; set; }

    [MaxLength(7)]
    [Column("color")]
    public string? Color { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual ICollection<Expense> Expenses { get; set; } = new List<Expense>();
    public virtual ICollection<Budget> Budgets { get; set; } = new List<Budget>();
    public virtual ICollection<CategorizationRule> CategorizationRules { get; set; } = new List<CategorizationRule>();
    public virtual ICollection<RecurringBill> RecurringBills { get; set; } = new List<RecurringBill>();
}
