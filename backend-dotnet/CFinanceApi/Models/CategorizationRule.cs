using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CFinanceApi.Models;

[Table("categorization_rules", Schema = "cfinance")]
public class CategorizationRule
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [Column("category_id")]
    public int CategoryId { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("keyword")]
    public string Keyword { get; set; } = string.Empty;

    [Column("priority")]
    public int Priority { get; set; } = 0;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("CategoryId")]
    public virtual Category? Category { get; set; }
}
