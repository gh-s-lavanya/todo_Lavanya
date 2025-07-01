"use client";

import { useEffect, useState, useRef } from "react";
import axios from "./utils/axiosInstance";
import { useRouter } from "next/navigation";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import ProtectedRoute from "./components/ProtectedRoute";
import { getToken} from "./utils/auth";
import { getUserIdFromToken } from "./utils/getUserIdFromToken";

/**
 * Home component for the Todo application.
 * 
 * This component displays the main dashboard for the user's tasks, including:
 * - Authentication check and redirect to login if not authenticated.
 * - Fetching and displaying todos from the backend API.
 * - Filtering todos by completion status, due date, priority, and category.
 * - Drag-and-drop reordering of todos with position updates sent to the backend.
 * - Marking todos as complete/incomplete.
 * - Deleting individual todos or all completed todos.
 * - Progress statistics for today's tasks.
 * - Responsive side menu for navigation and filtering.
 * - Handles logout and cross-tab logout synchronization.
 * 
 * @component
 * @returns {JSX.Element} The rendered Home page with todo list and controls.
 */

interface TodoItem {
  id: number;
  title: string;
  category?: string;
  isCompleted: boolean;
  userId: string;
  dueDate?: string;
  priority?: number;
}

type FilterOption = "All" | "Completed" | "Uncompleted" | "DueDate" | "Priority";

export default function Home() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [filter, setFilter] = useState<FilterOption>("All");
  const [filterDate, setFilterDate] = useState("");
  const [message, setMessage] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [category, setCategory] = useState("All");
  const filterRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    const userId = token ? getUserIdFromToken(token) : null;

    if (!token || !userId) {
      router.push("/login");
    } else {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
  const syncLogout = () => {
    if (!localStorage.getItem("accessToken")) {
      window.location.href = "/login";
    }
  };

  window.addEventListener("storage", syncLogout);
  return () => window.removeEventListener("storage", syncLogout);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilter(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchTodos = async () => {
    try {
      const res = await axios.get("/todo");
      setTodos(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const updateTodoPositions = async (updatedTodos: TodoItem[]) => {
    try {
      const payload = updatedTodos.map((todo, index) => ({ id: todo.id, position: index }));
      await axios.put("/todo/reorder", payload);
    } catch (err) {
      console.error("Failed to update positions", err);
    }
  };

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 2000);
  };

  const deleteTodo = async (id: number) => {
  try {
    await axios.delete(`/todo/${id}`);
    setTodos(todos.filter((t) => t.id !== id));
    setMessage("Task deleted");
    setTimeout(() => setMessage(""), 3000); // auto-clear after 3 seconds
  } catch (err) {
    console.error("Delete failed", err);
    setMessage("Failed to delete task");
    setTimeout(() => setMessage(""), 3000);
  }
};

  const deleteCompleted = async () => {
    try {
      await axios.delete("/todo/completed");
      fetchTodos();
      showMessage("Deleted completed tasks");
    } catch (err) {
      console.error(err);
    }
  };

  const toggleComplete = async (todo: TodoItem) => {
    try {
      await axios.put(`/todo/${todo.id}`, {
        ...todo,
        isCompleted: !todo.isCompleted
      });
      fetchTodos();
    } catch (err) {
  
    console.error(err);
    }
  };

  const startEdit = (todo: TodoItem) => {
  router.push(`/edit/${todo.id}`);
};

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const newTodos = Array.from(todos);
    const [moved] = newTodos.splice(result.source.index, 1);
    newTodos.splice(result.destination.index, 0, moved);

    setTodos(newTodos);
    await updateTodoPositions(newTodos);
  };

  const handleLogout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("refreshToken");
  localStorage.removeItem("savedEmail");
  localStorage.removeItem("savedPassword");

  // Notify other tabs and pages that user has logged out
  localStorage.setItem("logout", Date.now().toString());

  //Now redirect cleanly
  window.location.href = "/login";
  };


  const filteredTodos = todos.filter((todo) => {
    const categoryMatch = category === "All" || todo.category === category;
    if (filter === "Completed") return todo.isCompleted && categoryMatch;
    if (filter === "Uncompleted") return !todo.isCompleted && categoryMatch;
    if (filter === "DueDate") return filterDate && todo.dueDate?.substring(0, 10) === filterDate && categoryMatch;
    if (filter === "Priority") return todo.priority !== undefined && todo.priority > 0 && categoryMatch;
    return categoryMatch;
  });

  if (filter === "Priority") {
    filteredTodos.sort((a, b) => (a.priority || 0) - (b.priority || 0));
  }

  const completedToday = todos.filter(t => t.isCompleted && t.dueDate?.startsWith(new Date().toISOString().split("T")[0])).length;
  const totalToday = todos.filter(t => t.dueDate?.startsWith(new Date().toISOString().split("T")[0])).length;
  const progressPercent = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;


  if (authLoading) {
  return <p>Loading...</p>;
  }
  
  return (
  <ProtectedRoute>
  <div className="min-h-screen bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 text-black p-4">
    {/* Hamburger Menu */}
    <button
      onClick={() => setMenuOpen(!menuOpen)}
      className="text-black text-3xl z-50 mb-4"
    >
      ☰
    </button>

    {/* Side Menu */}
    {menuOpen && (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 flex">
        <div className="bg-white/90 backdrop-blur-md text-black w-64 p-6 shadow-xl rounded-r-2xl">
          <h2 className="text-xl font-bold mb-4">Menu</h2>

          <label className="block mb-2 font-semibold">Filter</label>
          <select
            className="w-full border p-2 mb-4"
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterOption)}
          >
            <option>All</option>
            <option>Completed</option>
            <option>Uncompleted</option>
            <option>DueDate</option>
            <option>Priority</option>
          </select>

          {filter === "DueDate" && (
           <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)}
            className="w-full border p-2 mb-4" /> )}

          <label className="block mb-2 font-semibold">Category</label>
          <select
            className="w-full border p-2 mb-4"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>All</option>
            <option>Work Tasks</option>
            <option>Personal Work</option>
            <option>Health and Wellness</option>
            <option>Family and Relationships</option>
            <option>Learning</option>
            <option>Household Chores</option>
            <option>Hobbies</option>
            <option>Financial Tasks</option>
          </select>

          <button
            onClick={deleteCompleted}
            className="w-full bg-red-500 text-white py-2 mb-4 rounded"
          >
             Delete Completed
          </button>

          <button
            onClick={() => (window.location.href = "/add-tasks")}
            className="w-full bg-blue-600 text-white py-2 mb-4 rounded"
          >
            Add Task
          </button>

          <button
            onClick={() => (window.location.href = "/profile")}
            className="w-full bg-purple-600 text-white py-2 mb-4 rounded"
          >
            My Profile
          </button>

          <button
            onClick={handleLogout}
            className="w-full bg-gray-800 text-white py-2 rounded"
          >
            Logout
          </button>
        </div>
        <div className="flex-1" onClick={() => setMenuOpen(false)} />
      </div>
    )}

    {/* Header */}
<div className="max-w-4xl mx-auto p-1 rounded-2xl shadow-2xl bg-gradient-to-br from-purple-300 to-pink-200">
        <div className="bg-gradient-to-br from-purple-250 to-pink-200 p-6 rounded-2xl text-black">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-4xl font-bold flex items-center">
              <span className="mr-3"></span> My Tasks
            </h1>
          </div>

          {/* Progress Stats */}
          <div className="p-4 bg-pink-200 rounded-xl shadow-inner mb-6">
            {(() => {
              const today = new Date().toISOString().split("T")[0];
              const todaysTasks = todos.filter((t) =>
                t.dueDate?.startsWith(today)
              );
              const completedCount = todaysTasks.filter((t) => t.isCompleted).length;
              const progressPercent =
                todaysTasks.length > 0
                  ? Math.round((completedCount / todaysTasks.length) * 100)
                  : 0;

              return (
                <>
                  <strong>Completed</strong>: {completedCount} <br />
                  <strong>Uncompleted</strong>: {todaysTasks.length - completedCount}
                  <div className="w-full bg-white mt-2 rounded-full h-4">
                    <div
                      className="bg-green-500 h-4 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">
                    Today's Progress: {progressPercent}%
                  </p>
                </>
              );
            })()}
          </div>
        </div>
      </div>

    {/* Task List Section */}
    <div className="max-w-4xl mx-auto">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="todoList">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {filteredTodos.map((todo, index) => (
                <Draggable
                  key={todo.id}
                  draggableId={todo.id.toString()}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="bg-white p-4 rounded-xl shadow-md hover:shadow-xl mb-4"
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={todo.isCompleted}
                            onChange={() => toggleComplete(todo)}
                            className="w-4 h-4"
                          />
                          <div>
                            <h3 className="font-semibold text-lg">{todo.title}</h3>
                            {todo.category && (
                              <p className="text-sm text-gray-600">{todo.category}</p>
                            )}
                            {todo.dueDate && (
                              <p className="text-sm text-gray-500">
                                Due: {todo.dueDate}
                              </p>
                            )}
                            {todo.priority && (
                              <p className="text-sm text-gray-500">
                                Priority: {todo.priority}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => startEdit(todo)}
                            className="text-yellow-600 hover:text-yellow-800"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteTodo(todo.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  </div>
</ProtectedRoute>

);
}