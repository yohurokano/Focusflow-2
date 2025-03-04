import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";

// Updated index.js with final changes

export default function Home() {
  // -----------------------------
  // HABIT STATE
  // -----------------------------
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState("");

  // -----------------------------
  // TASK STATE
  // -----------------------------
  const [tasks, setTasks] = useState([]);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskDate, setNewTaskDate] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("low");

  // -----------------------------
  // LOAD FROM LOCAL STORAGE ON MOUNT
  // -----------------------------
  useEffect(() => {
    const savedHabits = JSON.parse(localStorage.getItem("myHabits")) || [];
    const savedTasks = JSON.parse(localStorage.getItem("myTasks")) || [];

    setHabits(savedHabits);
    setTasks(savedTasks);
  }, []);

  // -----------------------------
  // SAVE TO LOCAL STORAGE WHENEVER HABITS/TASKS CHANGE
  // -----------------------------
  useEffect(() => {
    localStorage.setItem("myHabits", JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem("myTasks", JSON.stringify(tasks));
  }, [tasks]);

  // -----------------------------
  // ADD A NEW HABIT
  // -----------------------------
  function addHabit() {
    if (!newHabit.trim()) return;

    const newItem = {
      id: Date.now(),
      name: newHabit,
      completed: false,
      // Streak data:
      streak: 0,
      lastCompletedDate: null,
    };

    setHabits([...habits, newItem]);
    setNewHabit("");
  }

  // -----------------------------
  // TOGGLE A HABIT (WITH STREAK LOGIC)
  // -----------------------------
  function toggleHabit(id) {
    setHabits((prev) => {
      return prev.map((habit) => {
        if (habit.id !== id) return habit;

        // If unchecking, just set completed = false (no streak effect):
        if (habit.completed) {
          return { ...habit, completed: false };
        }

        // If checking it off:
        const todayStr = new Date().toDateString();
        if (habit.lastCompletedDate === todayStr) {
          // already completed today? just set completed = true
          return { ...habit, completed: true };
        } else {
          // handle streak increments or reset
          let newStreak = 1; // if first time or missed multiple days
          if (habit.lastCompletedDate) {
            const last = new Date(habit.lastCompletedDate);
            const today = new Date(todayStr);
            const diff = (today - last) / (1000 * 60 * 60 * 24);

            if (diff === 1) {
              // consecutive day
              newStreak = habit.streak + 1;
            } // else we reset to 1
          }

          return {
            ...habit,
            completed: true,
            streak: newStreak,
            lastCompletedDate: todayStr,
          };
        }
      });
    });
  }

  // -----------------------------
  // DELETE A HABIT
  // -----------------------------
  function deleteHabit(id) {
    const filtered = habits.filter((h) => h.id !== id);
    setHabits(filtered);
  }

  // -----------------------------
  // ADD A NEW TASK
  // -----------------------------
  function addTask() {
    if (!newTaskName.trim()) return;
    const newItem = {
      id: Date.now(),
      name: newTaskName,
      deadline: newTaskDate || null,
      priority: newTaskPriority,
      completed: false,
    };
    setTasks([...tasks, newItem]);
    setNewTaskName("");
    setNewTaskDate("");
    setNewTaskPriority("low");
  }

  // -----------------------------
  // TOGGLE TASK COMPLETION
  // -----------------------------
  function toggleTask(id) {
    setTasks((prev) => {
      return prev.map((task) => {
        if (task.id === id) {
          return { ...task, completed: !task.completed };
        }
        return task;
      });
    });
  }

  // -----------------------------
  // DELETE A TASK
  // -----------------------------
  function deleteTask(id) {
    setTasks(tasks.filter((t) => t.id !== id));
  }

  // -----------------------------
  // ANALYTICS DATA (BASIC COMPLETION CHART)
  // -----------------------------

  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const completionMap = {};

    // for each habit, if lastCompletedDate is set, increment that date's count
    habits.forEach((habit) => {
      if (habit.lastCompletedDate) {
        completionMap[habit.lastCompletedDate] =
          (completionMap[habit.lastCompletedDate] || 0) + 1;
      }
    });

    // convert map to arrays for chart
    const labels = Object.keys(completionMap);
    const data = Object.values(completionMap);

    if (labels.length === 0) {
      setChartData(null);
    } else {
      setChartData({
        labels,
        datasets: [
          {
            label: "Habits Completed",
            data,
            backgroundColor: "rgba(230, 0, 0, 0.7)",
          },
        ],
      });
    }
  }, [habits]);

  return (
    <div className="container">
      <h1>FocusFlow – prototype</h1>

      {/* --- Habits Section --- */}
      <div className="section-card">
        <h2 className="section-title">Daily Habits</h2>
        <p className="section-description">
          Track your daily habits, build streaks, and stay consistent!
        </p>

        <div className="input-section">
          <input
            type="text"
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            placeholder="Add a new habit..."
          />
          <button onClick={addHabit}>Add Habit</button>
        </div>

        <ul className="habit-list">
          {habits.map((habit) => (
            <li key={habit.id}>
              <label>
                <input
                  type="checkbox"
                  checked={habit.completed}
                  onChange={() => toggleHabit(habit.id)}
                />
                <span
                  style={{
                    textDecoration: habit.completed ? "line-through" : "none",
                    color: habit.completed ? "#aaa" : "#fff",
                  }}
                >
                  {habit.name} (Streak: {habit.streak || 0})
                </span>
              </label>
              <button className="delete-btn" onClick={() => deleteHabit(habit.id)}>
                X
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* --- Tasks Section --- */}
      <div className="section-card">
        <h2 className="section-title">Daily Tasks</h2>
        <p className="section-description">
          Keep track of important tasks with deadlines & priorities.
        </p>

        <div className="input-section">
          <input
            type="text"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            placeholder="Task name..."
          />
          <input
            type="date"
            value={newTaskDate}
            onChange={(e) => setNewTaskDate(e.target.value)}
          />
          <select
            value={newTaskPriority}
            onChange={(e) => setNewTaskPriority(e.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button onClick={addTask}>Add Task</button>
        </div>

        <ul className="task-list">
          {tasks.map((task) => (
            <li key={task.id}>
              <label>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                />
                <span
                  style={{
                    textDecoration: task.completed ? "line-through" : "none",
                    color: task.completed ? "#aaa" : "#fff",
                  }}
                >
                  {task.name} (Due: {task.deadline || "N/A"}) [Priority: {task.priority}]
                </span>
              </label>
              <button className="delete-btn" onClick={() => deleteTask(task.id)}>
                X
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* --- Analytics Section --- */}
      <div className="section-card">
        <h2 className="section-title">Habit Completion Analytics</h2>
        <div className="chart-container">
          {!chartData ? (
            <p>No habit completion data yet.</p>
          ) : (
            <Bar data={chartData} />
          )}
        </div>
      </div>
    </div>
  );
}
