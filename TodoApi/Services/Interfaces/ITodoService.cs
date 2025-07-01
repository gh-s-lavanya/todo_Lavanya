using TodoApi.Models;

namespace TodoApi.Services.Interfaces
{
    public interface ITodoService
    {
        Task<List<TodoItem>> GetAllAsync();
        Task<TodoItem?> GetByIdAsync(int id);
        Task<TodoItem> CreateAsync(TodoItem item);
        Task<bool> UpdateAsync(int id, TodoItem item);
        Task<bool> DeleteAsync(int id);
        Task<int> GetCompletedCountAsync();
        Task<int> GetUncompletedCountAsync();
        Task<bool> ToggleCompletionAsync(int id);
        Task<List<TodoItem>> GetCompletedAsync();
        Task<List<TodoItem>> GetUncompletedAsync();
        Task<List<TodoItem>> GetByDueDateAsync(DateTime date);
        Task<List<TodoItem>> GetByPriorityAsync();
        Task<bool> ReorderManyAsync(List<ReorderDto> reordered);
        Task<bool> ReorderSingleAsync(int taskId, int newPosition);
    }
}
