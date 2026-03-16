import React, { useState } from 'react';
import service from '../service';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await service.login(username, password);
            window.location.href = '/'; 
        } catch (error) {
            alert("התחברות נכשלה");
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <header className="auth-header">
                    <h1>כניסה</h1>
                    <p>ברוכים הבאים למערכת המשימות</p>
                </header>
                <form onSubmit={handleLogin} className="auth-form">
                    <div className="input-group">
                        <label>שם משתמש</label>
                        <input 
                            className="auth-input" 
                            type="text" 
                            placeholder="הכנס שם משתמש" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                        />
                    </div>
                    <div className="input-group">
                        <label>סיסמה</label>
                        <input 
                            className="auth-input" 
                            type="password" 
                            placeholder="הכנס סיסמה" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                        />
                    </div>
                    <button type="submit" className="auth-button">התחבר למערכת</button>
                </form>
                <footer className="auth-footer">
                    <span>עוד לא נרשמת? <a href="/register">צור חשבון חדש</a></span>
                </footer>
            </div>
        </div>
    );
}