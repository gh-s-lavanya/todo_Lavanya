using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoApi.Models;
using Microsoft.AspNetCore.Authorization;
using TodoApi.Services.Interfaces;

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

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TodoItem>>> GetTodos() =>
            await _todoService.GetAllAsync();

        [HttpGet("{id}")]
        public async Task<ActionResult<TodoItem>> GetTodo(int id)
        {
            var todo = await _todoService.GetByIdAsync(id);
            if (todo == null) return NotFound();
            return todo;
        }

        [HttpPost]
        public async Task<ActionResult<TodoItem>> PostTodo(TodoItem item)
        {
            var created = await _todoService.CreateAsync(item);
            return CreatedAtAction(nameof(GetTodo), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutTodo(int id, TodoItem item)
        {
            if (id != item.Id) return BadRequest();
            var result = await _todoService.UpdateAsync(id, item);
            return result ? NoContent() : NotFound();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTodo(int id)
        {
            var result = await _todoService.DeleteAsync(id);
            return result ? NoContent() : NotFound();
        }

        [HttpDelete("completed")]
        public async Task<IActionResult> DeleteCompletedTasks()
        {
            var all = await _todoService.GetCompletedAsync();
            foreach (var task in all)
            {
                await _todoService.DeleteAsync(task.Id);
            }
            return NoContent();
        }

        [HttpPatch("{id}/toggle")]
        public async Task<IActionResult> ToggleCompletion(int id)
        {
            var result = await _todoService.ToggleCompletionAsync(id);
            return result ? NoContent() : NotFound();
        }

        [HttpGet("completed/count")]
        public async Task<int> GetCompletedCount() =>
            await _todoService.GetCompletedCountAsync();

        [HttpGet("uncompleted/count")]
        public async Task<int> GetUncompletedCount() =>
            await _todoService.GetUncompletedCountAsync();

        [HttpPut("reorder")]
        public async Task<IActionResult> ReorderTodos([FromBody] List<ReorderDto> reordered)
        {
            var result = await _todoService.ReorderManyAsync(reordered);
            return result ? NoContent() : StatusCode(500, "Reordering failed.");
        }

        [HttpPatch("reorder")]
        public async Task<IActionResult> ReorderTask([FromBody] ReorderRequest request)
        {
            var result = await _todoService.ReorderSingleAsync(request.TaskId, request.NewPosition);
            return result ? NoContent() : NotFound();
        }

        [HttpGet("uncompleted")]
        public async Task<ActionResult<IEnumerable<TodoItem>>> GetUncompleted() =>
            await _todoService.GetUncompletedAsync();

        [HttpGet("completed")]
        public async Task<ActionResult<IEnumerable<TodoItem>>> GetCompleted() =>
            await _todoService.GetCompletedAsync();

        [HttpGet("byduedate")]
        public async Task<ActionResult<IEnumerable<TodoItem>>> GetTodosByDueDate([FromQuery] DateTime date) =>
            await _todoService.GetByDueDateAsync(date);

        [HttpGet("bypriority")]
        public async Task<ActionResult<IEnumerable<TodoItem>>> GetTodosByPriority() =>
            await _todoService.GetByPriorityAsync();

        public class ReorderRequest
        {
            public int TaskId { get; set; }
            public int NewPosition { get; set; }
        }
    }

}
