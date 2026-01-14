using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CFinanceApi.Models;

[Table("savings_goals", Schema = "cfinance")]
public class SavingsGoal
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [Column("user_id")]
    public int UserId { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Required]
    [Column("target_amount", TypeName = "decimal(10,2)")]
    public decimal TargetAmount { get; set; }

    [Column("current_amount", TypeName = "decimal(10,2)")]
    public decimal CurrentAmount { get; set; } = 0;

    [Column("target_date")]
    public DateOnly? TargetDate { get; set; }

    [MaxLength(50)]
    [Column("icon")]
    public string? Icon { get; set; }

    [MaxLength(7)]
    [Column("color")]
    public string? Color { get; set; }

    [Column("is_completed")]
    public bool IsCompleted { get; set; } = false;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("UserId")]
    public virtual User? User { get; set; }

    // Computed property for progress
    [NotMapped]
    public decimal Progress => TargetAmount > 0 ? Math.Round(CurrentAmount / TargetAmount * 100, 2) : 0;
}
