using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TodoApi.Models;
using TodoApi.Services.Interfaces;

namespace TodoApi.Services.Implementations
{
    public class TodoService : ITodoService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public TodoService(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor)// Constructor to inject dependencies
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        private string? GetUserId()// Helper method to get the current user's ID from claims
        {
            return _httpContextAccessor.HttpContext?.User?.Claims
                .FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
        }

        public async Task<List<TodoItem>> GetAllAsync()// Get all todo items for the current user
        {
            var userId = GetUserId();
            return await _context.TodoItems
                .Where(t => t.UserId == userId)
                .OrderBy(t => t.Position)
                .ToListAsync();
        }

        public async Task<TodoItem?> GetByIdAsync(int id)// Get a specific todo item by ID
        {
            var userId = GetUserId();
            var isAdmin = _httpContextAccessor.HttpContext?.User?.IsInRole("Admin") ?? false;

            return await _context.TodoItems.FirstOrDefaultAsync(t =>
            t.Id == id && (t.UserId == userId || isAdmin)
            );
        }


        public async Task<TodoItem> CreateAsync(TodoItem item)// Create a new todo item for the current user
        {
            var userId = GetUserId();
            item.UserId = userId;
            item.CreatedAt = DateTime.Now;
            item.Position = await _context.TodoItems.CountAsync(t => t.UserId == userId);

            _context.TodoItems.Add(item);
            await _context.SaveChangesAsync();
            return item;
        }
        public async Task<bool> UpdateAsync(int id, TodoItem item)// Update an existing todo item by ID
        {
            var userId = GetUserId();
            var isAdmin = _httpContextAccessor.HttpContext?.User?.IsInRole("Admin") ?? false;

            var existing = await _context.TodoItems.FirstOrDefaultAsync(t => t.Id == id);
            if (existing == null) return false;

            if (!isAdmin && existing.AssignedBy != null)
                return false;

            if (existing.UserId != userId && !isAdmin)// Check if the user is allowed to update this item
                return false;

            existing.Title = item.Title;
            existing.Category = item.Category;
            existing.IsCompleted = item.IsCompleted;
            existing.DueDate = item.DueDate;
            existing.Priority = item.Priority;
            existing.Position = item.Position;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)// Delete a specific todo item by ID
        {
            var userId = GetUserId();
            var isAdmin = _httpContextAccessor.HttpContext?.User?.IsInRole("Admin") ?? false;// Check if the user is an admin

            var todo = await _context.TodoItems.FirstOrDefaultAsync(t => t.Id == id);
            if (todo == null) return false;

            if (todo.AssignedBy != null && !isAdmin)
            return false;

            if (todo.UserId != userId && !isAdmin)// Check if the user is allowed to delete this item
            return false;

            _context.TodoItems.Remove(todo);
            await _context.SaveChangesAsync();
            return true;
        }


        public async Task<int> GetCompletedCountAsync()// Get the count of completed todo items for the current user
        {
            var userId = GetUserId();
            return await _context.TodoItems.CountAsync(t => t.IsCompleted && t.UserId == userId);
        }

        public async Task<int> GetUncompletedCountAsync()// Get the count of uncompleted todo items for the current user
        {
            var userId = GetUserId();
            return await _context.TodoItems.CountAsync(t => !t.IsCompleted && t.UserId == userId);
        }

        public async Task<bool> ToggleCompletionAsync(int id)// Toggle the completion status of a todo item by ID
        {
            var userId = GetUserId();
            var todo = await _context.TodoItems.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
            if (todo == null) return false;

            todo.IsCompleted = !todo.IsCompleted;
            await _context.SaveChangesAsync();
            return true;
        }


        public async Task<List<TodoItem>> GetCompletedAsync()// Get all completed todo items for the current user
        {
            var userId = GetUserId();
            return await _context.TodoItems
                .Where(t => t.IsCompleted && t.UserId == userId)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<TodoItem>> GetUncompletedAsync()// Get all uncompleted todo items for the current user
        {
            var userId = GetUserId();
            return await _context.TodoItems
                .Where(t => !t.IsCompleted && t.UserId == userId)
                .OrderBy(t => t.Position)
                .ToListAsync();
        }

        public async Task<List<TodoItem>> GetByDueDateAsync(DateTime date)// Get all todo items due on a specific date for the current user
        {
            var userId = GetUserId();
            return await _context.TodoItems
                .Where(t => t.UserId == userId && t.DueDate.HasValue && t.DueDate.Value.Date == date.Date)
                .ToListAsync();
        }

        public async Task<List<TodoItem>> GetByPriorityAsync()// Get all todo items sorted by priority for the current user
        {
            var userId = GetUserId();
            return await _context.TodoItems
                .Where(t => t.UserId == userId && t.Priority.HasValue)
                .OrderBy(t => t.Priority)
                .ToListAsync();
        }

        public async Task<bool> ReorderManyAsync(List<ReorderDto> reordered)// Reorder multiple todo items
        {
            var userId = GetUserId();

            foreach (var item in reordered)
            {
                var todo = await _context.TodoItems
                    .FirstOrDefaultAsync(t => t.Id == item.Id && t.UserId == userId);

                if (todo != null)
                    todo.Position = item.Position;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ReorderSingleAsync(int taskId, int newPosition)// Reorder a single todo item
        {
            var userId = GetUserId();
            var task = await _context.TodoItems.FirstOrDefaultAsync(t => t.Id == taskId && t.UserId == userId);
            if (task == null) return false;

            task.Position = newPosition;
            await _context.SaveChangesAsync();
            return true;
        }
        public async Task<List<TodoItem>> GetTasksByUserIdAsync(string userId)// Get all tasks assigned to a specific user (Admin only)
        {
            return await _context.TodoItems.Where(t => t.UserId == userId).OrderBy(t => t.Order).ToListAsync();
        }

        public async Task<TodoItem> AssignTaskToUserAsync(TodoItem item, string userId)// Assign a task to a specific user (Admin only)
        {
            item.UserId = userId;
            item.CreatedAt = DateTime.UtcNow;
            item.Position = await _context.TodoItems.CountAsync(t => t.UserId == userId);

            var adminId = GetUserId();
            item.AssignedBy = adminId;

            if (item.Category == null) item.Category = "General";
            if (item.Priority == 0) item.Priority = 1;
            item.IsCompleted = false;

            _context.TodoItems.Add(item);
            await _context.SaveChangesAsync();
            return item;
        }
        public async Task<List<TodoItem>> GetMyTasksAsync()// Get all tasks of the current user
        {
            var userId = GetUserId();
            return await _context.TodoItems
                .Where(t => t.UserId == userId)
                .OrderBy(t => t.Position)
                .ToListAsync();
        }
    }
}
