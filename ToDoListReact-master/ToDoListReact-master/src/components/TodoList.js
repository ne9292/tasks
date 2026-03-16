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
      const todos = await service.getTasks();
      setTodos(todos);
    } catch (error) {
      console.error("שגיאה בטעינת המשימות:", error);
    }
  }

  async function createTodo(e) {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      await service.addTask(newTodo);
      setNewTodo(""); // איפוס תיבת הטקסט
      await getTodos(); // רענון הרשימה מהשרת
    } catch (error) {
      console.error("שגיאה בהוספת משימה:", error);
    }
  }

  async function updateCompleted(todo, isComplete) {
    try {
      // שליחת ה-ID, השם והסטטוס החדש לשרת
      await service.setCompleted(todo.id, todo.name, isComplete);
      await getTodos(); // רענון כדי לוודא שהשינוי נשמר ב-DB
    } catch (error) {
      console.error("שגיאה בעדכון המשימה:", error);
    }
  }

  async function deleteTodo(id) {
    try {
      await service.deleteTask(id);
      await getTodos(); // רענון הרשימה
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
            {todos.map(todo => (
              <li key={todo.id} className={`todo-card ${todo.isComplete ? "completed" : ""}`}>
                <div className="todo-content">
                  <div className="checkbox-wrapper">
                    <input
                      className="todo-checkbox"
                      type="checkbox"
                      checked={todo.isComplete}
                      onChange={(e) => updateCompleted(todo, e.target.checked)}
                      id={`todo-${todo.id}`}
                    />
                  </div>
                  <span className="todo-text">{todo.name}</span>
                </div>
                
                <button 
                  className="delete-action-btn" 
                  onClick={() => deleteTodo(todo.id)}
                  title="מחק משימה"
                >
                  <span className="icon-trash">✕</span>
                </button>
              </li>
            ))}
          </ul>
        </main>

        {todos.length > 0 ? (
          <footer className="todo-footer">
            <span className="todo-count">
              נותרו <strong>{todos.filter(t => !t.isComplete).length}</strong> משימות לביצוע
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