import React, { useState } from 'react';
import service from '../service';

export default function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await service.register(username, password);
            window.location.href = '/';
        } catch (error) {
            alert("הרשמה נכשלה - ייתכן שהמשתמש כבר קיים");
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <header className="auth-header">
                    <h1>הרשמה</h1>
                    <p>יצירת חשבון חדש במערכת</p>
                </header>
                <form onSubmit={handleRegister} className="auth-form">
                    <div className="input-group">
                        <label>בחר שם משתמש</label>
                        <input 
                            className="auth-input" 
                            type="text" 
                            placeholder="לדוגמה: כהן123" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                        />
                    </div>
                    <div className="input-group">
                        <label>בחר סיסמה</label>
                        <input 
                            className="auth-input" 
                            type="password" 
                            placeholder="לפחות 6 תווים" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                        />
                    </div>
                    <button type="submit" className="auth-button register-btn">צור חשבון</button>
                </form>
                <footer className="auth-footer">
                    <span>כבר יש לך חשבון? <a href="/login">התחבר כאן</a></span>
                </footer>
            </div>
        </div>
    );
}