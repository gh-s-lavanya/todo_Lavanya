
using System.ComponentModel.DataAnnotations;

namespace TodoApi.Models
{
    public class TodoItem
    {
        [Key]
        public int Id { get; set; }  // Change to int (auto-generated)

        [Required]
        public string? Title { get; set; }

        public bool IsCompleted { get; set; }

        public string? UserId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // New field for manual sorting
        public int Position { get; set; }
     
        public DateTime? DueDate { get; set; }

        public int? Priority { get; set; }  // 1 (Low) to 5 (High)

        public string? Category { get; set; }

    }
}

