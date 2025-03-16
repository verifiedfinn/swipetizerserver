import React from 'react';
import { useNavigate } from 'react-router-dom';

const RegistrationForm = () => {
    const navigate = useNavigate();

    return (
        <div>
            <div className="register">
                <button onClick={() => navigate('/register')}>Register</button>
            </div>
            <div className="login">
                <button onClick={() => navigate('login')}>Login</button>
            </div>
            <div className="guest">
                <button onClick={() => navigate('/home')}>Continue as guest</button>
            </div>
        </div>
    );
};

export default RegistrationForm;