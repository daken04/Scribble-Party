import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';

function App(){
    const [user, setUser] = useState(null);

    return (
        <Router>
            <div className="min-h-screen flex flex-col bg-gray-100">
                <nav className="bg-blue-600 p-4 flex justify-between items-center">
                    <div className="text-white font-bold text-xl"><Link to="/">Watch Party</Link></div>
                    <ul className="flex space-x-4">
                        <li>
                            <Link to="/register" className="text-white font-bold">Register</Link>
                        </li>
                        <li>
                            <Link to="/login" className="text-white font-bold">Login</Link>
                        </li>
                    </ul>
                </nav>
                <div className="flex-grow flex items-center justify-center">
                    <Routes>
                        <Route path="/register" element={<Register />} />
                        <Route path="/login" element={<Login setUser={setUser} />} />
                        <Route path="/" element={<h2 className="text-3xl">Welcome {user ? user.username : 'Guest'}</h2>} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;
