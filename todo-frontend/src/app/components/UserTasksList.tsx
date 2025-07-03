"use client";

import React from "react";

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  isCompleted: boolean;
  assignedByAdmin?: boolean;
}

interface UserTasksListProps {
  tasks: Task[];
  username?: string;
}

/**
 * Renders a list of tasks assigned to a user, displaying task details such as title, description, due date,
 * completion status, and whether the task was assigned by an admin.
 *
 * @component
 * @param {UserTasksListProps} props - The props for the component.
 * @param {Array<Task>} props.tasks - The array of task objects to display.
 * @param {string} props.username - The username for whom the tasks are displayed.
 * @returns {JSX.Element} The rendered list of user tasks or a message if no tasks are found.
 */
const UserTasksList: React.FC<UserTasksListProps> = ({ tasks, username }) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center text-gray-600 p-4 bg-white rounded-xl shadow-md">
        No tasks found for {username || "user"}.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">
        Tasks for {username || "User"}
      </h2>

      <ul className="grid gap-4">
        {tasks.map((task) => (
          <li
            key={task.id}
            className={`p-4 rounded-xl shadow-md border ${
              task.isCompleted ? "bg-green-100" : "bg-yellow-100"
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
                {task.description && (
                  <p className="text-gray-600 text-sm mt-1">{task.description}</p>
                )}
                {task.dueDate && (
                  <p className="text-sm text-gray-500 mt-1">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </p>
                )}
                {task.assignedByAdmin && (
                  <span className="inline-block mt-2 text-xs text-white bg-blue-500 px-2 py-1 rounded-full">
                    Assigned by Admin
                  </span>
                )}
              </div>
              <div>
                <span
                  className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                    task.isCompleted
                      ? "bg-green-600 text-white"
                      : "bg-yellow-500 text-white"
                  }`}
                >
                  {task.isCompleted ? "Completed" : "Pending"}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserTasksList;
