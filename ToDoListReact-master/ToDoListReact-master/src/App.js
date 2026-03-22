import React, { useState } from 'react';
import service from './service';
import TodoList from './components/TodoList';
import Login from './components/Login';
import Register from './components/Register'; 

function App() {
  const [user, setUser] = useState(service.getUserInfo());
  const [showRegister, setShowRegister] = useState(false); 

  const handleLogin = () => {
    setUser(service.getUserInfo());
  };

  if (user) {
    return (
      <div className="App" style={{ direction: 'rtl', padding: '20px' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h2>שלום, {user.name} 👋</h2>
          <button onClick={() => { service.logout(); setUser(null); }}>התנתק</button>
        </header>
        <TodoList />
      </div>
    );
  }

  return (
    <div className="App" style={{ direction: 'rtl', padding: '20px' }}>
      {showRegister ? (
        <>
          <Register onRegister={() => setShowRegister(false)} />
          <button onClick={() => setShowRegister(false)}>כבר יש לי חשבון? להתחברות</button>
        </>
      ) : (
        <>
          <Login onLogin={handleLogin} />
          <button onClick={() => setShowRegister(true)}>אין לך חשבון? להרשמה</button>
        </>
      )}
    </div>
  );
}

export default App;