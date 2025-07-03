
using System.ComponentModel.DataAnnotations;

namespace TodoApi.Models
{
    public class TodoItem
    {
        [Key]
        public int Id { get; set; }  // Change to int (auto-generated)

        [Required]
        public string? Title { get; set; } // Title of the task

        public bool IsCompleted { get; set; }// Indicates if the task is completed

        public string? UserId { get; set; }// ID of the user assigned to the task

        public DateTime CreatedAt { get; set; } = DateTime.Now;// Timestamp when the task was created

        // New field for manual sorting
        public int Position { get; set; }
     
        public DateTime? DueDate { get; set; }// Optional due date for the task

        public int? Priority { get; set; }  // 1 (Low) to 5 (High)
        public string? AssignedBy { get; set; }// ID of the user who assigned the task

        public string? Category { get; set; }// Category of the task (e.g., Work, Personal)
        public int Order { get; set; }// Order of the task in the list

    }
}

