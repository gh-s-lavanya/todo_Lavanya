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

        public TodoService(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        private string? GetUserId()
        {
            return _httpContextAccessor.HttpContext?.User?.Claims
                .FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
        }

        public async Task<List<TodoItem>> GetAllAsync()
        {
            var userId = GetUserId();
            return await _context.TodoItems
                .Where(t => t.UserId == userId)
                .OrderBy(t => t.Position)
                .ToListAsync();
        }

        public async Task<TodoItem?> GetByIdAsync(int id)
        {
            var userId = GetUserId();
            return await _context.TodoItems
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
        }

        public async Task<TodoItem> CreateAsync(TodoItem item)
        {
            var userId = GetUserId();
            item.UserId = userId;
            item.CreatedAt = DateTime.Now;
            item.Position = await _context.TodoItems.CountAsync(t => t.UserId == userId);

            _context.TodoItems.Add(item);
            await _context.SaveChangesAsync();
            return item;
        }

        public async Task<bool> UpdateAsync(int id, TodoItem item)
        {
            var userId = GetUserId();
            var existing = await _context.TodoItems.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
            if (existing == null) return false;

            existing.Title = item.Title;
            existing.Category = item.Category;
            existing.IsCompleted = item.IsCompleted;
            existing.DueDate = item.DueDate;
            existing.Priority = item.Priority;
            existing.Position = item.Position;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var userId = GetUserId();
            var todo = await _context.TodoItems.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
            if (todo == null) return false;

            _context.TodoItems.Remove(todo);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<int> GetCompletedCountAsync()
        {
            var userId = GetUserId();
            return await _context.TodoItems.CountAsync(t => t.IsCompleted && t.UserId == userId);
        }

        public async Task<int> GetUncompletedCountAsync()
        {
            var userId = GetUserId();
            return await _context.TodoItems.CountAsync(t => !t.IsCompleted && t.UserId == userId);
        }

        public async Task<bool> ToggleCompletionAsync(int id)
        {
            var userId = GetUserId();
            var todo = await _context.TodoItems.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
            if (todo == null) return false;

            todo.IsCompleted = !todo.IsCompleted;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<TodoItem>> GetCompletedAsync()
        {
            var userId = GetUserId();
            return await _context.TodoItems
                .Where(t => t.IsCompleted && t.UserId == userId)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<TodoItem>> GetUncompletedAsync()
        {
            var userId = GetUserId();
            return await _context.TodoItems
                .Where(t => !t.IsCompleted && t.UserId == userId)
                .OrderBy(t => t.Position)
                .ToListAsync();
        }

        public async Task<List<TodoItem>> GetByDueDateAsync(DateTime date)
        {
            var userId = GetUserId();
            return await _context.TodoItems
                .Where(t => t.UserId == userId && t.DueDate.HasValue && t.DueDate.Value.Date == date.Date)
                .ToListAsync();
        }

        public async Task<List<TodoItem>> GetByPriorityAsync()
        {
            var userId = GetUserId();
            return await _context.TodoItems
                .Where(t => t.UserId == userId && t.Priority.HasValue)
                .OrderBy(t => t.Priority)
                .ToListAsync();
        }

        public async Task<bool> ReorderManyAsync(List<ReorderDto> reordered)
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

        public async Task<bool> ReorderSingleAsync(int taskId, int newPosition)
        {
            var userId = GetUserId();
            var task = await _context.TodoItems.FirstOrDefaultAsync(t => t.Id == taskId && t.UserId == userId);
            if (task == null) return false;

            task.Position = newPosition;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
