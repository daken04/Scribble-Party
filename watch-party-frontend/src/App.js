import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import CreateParty from './components/CreateParty';
import JoinParty from './components/JoinParty';
import PartyPage from './components/PartyPage';

function App() {
    const [user, setUser] = useState(null);

    return (
        <Router>
            <div className="min-h-screen flex flex-col bg-gray-100">
                <nav className="bg-blue-600 p-4 flex justify-between items-center">
                    <div className="text-white font-bold text-xl">
                        <Link to="/">Watch Party</Link>
                    </div>
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
                        <Route path="/create-party" element={<CreateParty user={user} />} />
                        <Route path="/join-party" element={<JoinParty user={user} />} />
                        <Route path="/party/:partyCode" element={<PartyPage user={user} />} />
                        <Route path="/" element={
                            <div className="text-center">
                                <h2 className="text-3xl">
                                    {user ? `Hello ${user.username}` : 'Welcome Guest'}
                                </h2>
                                {user && (
                                    <div className="mt-4">
                                        <Link to="/create-party" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded m-2">
                                            Create Party
                                        </Link>
                                        <Link to="/join-party" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded m-2">
                                            Join Party
                                        </Link>
                                    </div>
                                )}
                            </div>
                        } />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;
