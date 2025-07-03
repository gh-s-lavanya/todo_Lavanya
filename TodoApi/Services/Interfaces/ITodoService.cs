using TodoApi.Models;

namespace TodoApi.Services.Interfaces
{
    public interface ITodoService
    {
        Task<List<TodoItem>> GetAllAsync(); // Get all tasks
        Task<TodoItem?> GetByIdAsync(int id); // Get a task by ID
        Task<TodoItem> CreateAsync(TodoItem item); // Create a new task
        Task<bool> UpdateAsync(int id, TodoItem item); // Update a task by ID
        Task<bool> DeleteAsync(int id); // Delete a task by ID
        Task<int> GetCompletedCountAsync(); // Get count of completed tasks
        Task<int> GetUncompletedCountAsync(); // Get count of completed tasks
        Task<bool> ToggleCompletionAsync(int id); // Toggle completion status of a task
        Task<List<TodoItem>> GetCompletedAsync(); // Get tasks that are completed
        Task<List<TodoItem>> GetUncompletedAsync();// Get tasks that are not completed
        Task<List<TodoItem>> GetByDueDateAsync(DateTime date); // Get tasks due on a specific date
        Task<List<TodoItem>> GetByPriorityAsync(); // Get tasks sorted by priority
        Task<bool> ReorderManyAsync(List<ReorderDto> reordered); // Reorder multiple tasks
        Task<bool> ReorderSingleAsync(int taskId, int newPosition); // Reorder a single task
        Task<List<TodoItem>> GetTasksByUserIdAsync(string userId);         // View tasks of a user (Admin)
        Task<TodoItem> AssignTaskToUserAsync(TodoItem item, string userId); // Assign a task to a user (Admin)
        Task<List<TodoItem>> GetMyTasksAsync(); // View tasks of the current user
    
    }
}
