import React, { useEffect, useState } from 'react';
import service from '../service';

function TodoList() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");

  // טעינת המשימות ברגע שהדף עולה
  useEffect(() => {
    getTodos();
  }, []);

  async function getTodos() {
    try {
      const data = await service.getTasks();
      // בדיקה שהנתונים הם אכן מערך, אם לא - הופך למערך ריק כדי למנוע קריסה
      setTodos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("שגיאה בטעינת המשימות:", error);
    }
  }

  async function createTodo(e) {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      await service.addTask(newTodo);
      setNewTodo(""); 
      await getTodos(); 
    } catch (error) {
      console.error("שגיאה בהוספת משימה:", error);
    }
  }

  async function updateCompleted(todo, isComplete) {
    try {
      // שימוש ב-|| כדי לתמוך גם ב-Name וגם ב-name
      const id = todo.id || todo.Id;
      const name = todo.name || todo.Name;
      await service.setCompleted(id, name, isComplete);
      await getTodos();
    } catch (error) {
      console.error("שגיאה בעדכון המשימה:", error);
    }
  }

  async function deleteTodo(id) {
    try {
      await service.deleteTask(id);
      await getTodos();
    } catch (error) {
      console.error("שגיאה במחיקת משימה:", error);
    }
  }

  return (
    <div className="auth-wrapper">
      <section className="todo-container">
        <header className="auth-header">
          <h1>המשימות שלי</h1>
          <form onSubmit={createTodo} className="todo-form">
            <input
              className="auth-input todo-main-input"
              placeholder="מה המשימה הבאה שלך?"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              autoFocus
            />
            <button type="submit" className="add-task-btn">הוספה</button>
          </form>
        </header>

        <main className="main">
          <ul className="todo-list-modern">
            {todos.map(todo => {
              // חילוץ נתונים בצורה בטוחה (תמיכה באותיות גדולות/קטנות מהשרת)
              const taskName = todo.name || todo.Name || "משימה ללא שם";
              const isDone = todo.isComplete !== undefined ? todo.isComplete : todo.IsComplete;
              const taskId = todo.id || todo.Id;

              return (
                <li key={taskId} className={`todo-card ${isDone ? "completed" : ""}`}>
                  <div className="todo-content">
                    <div className="checkbox-wrapper">
                      <input
                        className="todo-checkbox"
                        type="checkbox"
                        checked={isDone || false}
                        onChange={(e) => updateCompleted(todo, e.target.checked)}
                        id={`todo-${taskId}`}
                      />
                    </div>
                    <span className="todo-text">{taskName}</span>
                  </div>
                  
                  <button 
                    className="delete-action-btn" 
                    onClick={() => deleteTodo(taskId)}
                    title="מחק משימה"
                  >
                    <span className="icon-trash">✕</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </main>

        {todos.length > 0 ? (
          <footer className="todo-footer">
            <span className="todo-count">
              נותרו <strong>{todos.filter(t => !(t.isComplete || t.IsComplete)).length}</strong> משימות לביצוע
            </span>
          </footer>
        ) : (
          <div className="empty-state">
            <p>אין לך משימות כרגע. זמן לנוח!</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default TodoList;