import React, { useState } from 'react';
import axios from 'axios';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  async function handleRegister(e) {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/register', { username, password });
      setMessage(`User ${res.data.username} registered successfully!`);
    } catch (error) {
      if (error.response) {
        if (error.response.status === 409) {
          setMessage('User already registered');
        } else if (error.response.status === 400) {
          setMessage('Invalid request, please check your input');
        } else {
          setMessage('Error registering user');
        }
      } else if (error.request) {
        setMessage('No response from server, please try again later');
      } else {
        setMessage('Error registering user');
      }
      console.error(error);
    }
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="w-full max-w-xs">
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
        <form onSubmit={handleRegister} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Register
            </button>
          </div>
          {message && <p className="mt-4 text-center text-red-500">{message}</p>}
        </form>
      </div>
    </div>
  );
}

export default Register;
