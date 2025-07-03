using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoApi.Models;
using Microsoft.AspNetCore.Authorization;
using TodoApi.Services.Interfaces;
using System.Security.Claims;

namespace TodoApi.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class TodoController : ControllerBase
    {
        private readonly ITodoService _todoService;

        public TodoController(ITodoService todoService)
        {
            _todoService = todoService;
        }

        [HttpGet]// Get all todo items
        public async Task<ActionResult<IEnumerable<TodoItem>>> GetTodos() =>
            await _todoService.GetAllAsync();

        [HttpGet("{id}")]// Get a specific todo item by ID
        public async Task<ActionResult<TodoItem>> GetTodo(int id)
        {
            var todo = await _todoService.GetByIdAsync(id);
            if (todo == null) return NotFound();
            return todo;
        }

        [HttpPost]// Create a new todo item
        public async Task<ActionResult<TodoItem>> PostTodo(TodoItem item)
        {
            var created = await _todoService.CreateAsync(item);
            return CreatedAtAction(nameof(GetTodo), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]// Update an existing todo item by ID
        public async Task<IActionResult> PutTodo(int id, TodoItem item)
        {
            if (id != item.Id) return BadRequest();

            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

            var existing = await _todoService.GetByIdAsync(id);
            if (existing == null) return NotFound();

            // Block if user is not admin and editing admin-assigned task
            if (existing.AssignedBy != null && userRole != "Admin")
                return StatusCode(403, "You cannot edit tasks assigned by admin.");

            // Allow update if admin or user owns the task
            if (userRole == "Admin" || existing.UserId == userId)
            {
                var result = await _todoService.UpdateAsync(id, item);
                return result ? NoContent() : NotFound();
            }
            return Forbid();
        }

        [HttpDelete("{id}")]// Delete a specific todo item by ID
        public async Task<IActionResult> DeleteTodo(int id)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            var task = await _todoService.GetByIdAsync(id);
            if (task == null) return NotFound();
            if (task.AssignedBy != null && userRole != "Admin")
                return StatusCode(403, "You cannot delete tasks assigned by admin.");
            if (userRole == "Admin" || task.UserId == userId)
            {
                var result = await _todoService.DeleteAsync(id);
                return result ? NoContent() : NotFound();
        }
            return Forbid();
        }


        [HttpDelete("completed")]// Delete all completed tasks
        public async Task<IActionResult> DeleteCompletedTasks()
        {
            var all = await _todoService.GetCompletedAsync();
            foreach (var task in all)
            {
                await _todoService.DeleteAsync(task.Id);
            }
            return NoContent();
        }

        [HttpPatch("{id}/toggle")]// Toggle the completion status of a todo item
        public async Task<IActionResult> ToggleCompletion(int id)
        {
            var result = await _todoService.ToggleCompletionAsync(id);
            return result ? NoContent() : NotFound();
        }


        [HttpGet("completed/count")]// Get the count of completed tasks
        public async Task<int> GetCompletedCount() =>
            await _todoService.GetCompletedCountAsync();

        [HttpGet("uncompleted/count")]// Get the count of uncompleted tasks
        public async Task<int> GetUncompletedCount() =>
            await _todoService.GetUncompletedCountAsync();

        [HttpPut("reorder")]// Reorder multiple todo items
        public async Task<IActionResult> ReorderTodos([FromBody] List<ReorderDto> reordered)
        {
            var result = await _todoService.ReorderManyAsync(reordered);
            return result ? NoContent() : StatusCode(500, "Reordering failed.");
        }

        [HttpPatch("reorder")]  // Reorder a single todo item
        public async Task<IActionResult> ReorderTask([FromBody] ReorderRequest request)
        {
            var result = await _todoService.ReorderSingleAsync(request.TaskId, request.NewPosition);
            return result ? NoContent() : NotFound();
        }

        [HttpGet("uncompleted")]// Get all uncompleted todo items
        public async Task<ActionResult<IEnumerable<TodoItem>>> GetUncompleted() =>
            await _todoService.GetUncompletedAsync();

        [HttpGet("completed")]// Get all completed todo items
        public async Task<ActionResult<IEnumerable<TodoItem>>> GetCompleted() =>
            await _todoService.GetCompletedAsync();

        [HttpGet("byduedate")]// Get todo items by due date
        public async Task<ActionResult<IEnumerable<TodoItem>>> GetTodosByDueDate([FromQuery] DateTime date) =>
            await _todoService.GetByDueDateAsync(date);

        [HttpGet("bypriority")]// Get todo items sorted by priority
        public async Task<ActionResult<IEnumerable<TodoItem>>> GetTodosByPriority() =>
            await _todoService.GetByPriorityAsync();

        public class ReorderRequest// DTO for reordering a single task
        {
            public int TaskId { get; set; }
            public int NewPosition { get; set; }
        }
        //View all tasks of a specific user (Admin only)
        [HttpGet("user/{userId}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<TodoItem>>> GetTasksByUserId(string userId)
        {
            var tasks = await _todoService.GetTasksByUserIdAsync(userId);
            return Ok(tasks);
            }

        // Assign a task to a specific user (Admin only)
        [HttpPost("assign/{userId}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<TodoItem>> AssignTaskToUser(string userId, [FromBody] TodoItem item)
        {
            var created = await _todoService.AssignTaskToUserAsync(item, userId);
            return CreatedAtAction(nameof(GetTodo), new { id = created.Id }, created);
        }

        [HttpGet("mytasks")]// View tasks of the current user
        [Authorize]
        public async Task<ActionResult<IEnumerable<TodoItem>>> GetMyTasks()
        {
            var tasks = await _todoService.GetMyTasksAsync();
            return Ok(tasks);
        }

    }

}
