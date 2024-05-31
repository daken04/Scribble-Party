import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

function PartyPage({user}){
    const { partyCode } = useParams();
    const [members, setMembers] = useState([]);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const videoRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMembers = async () => {
          const res = await axios.get(`http://localhost:5000/party-members/${partyCode}`);
          setMembers(res.data);
        };
        fetchMembers();
    
        socket.emit('join', { partyCode, userId: user.id });
    
        socket.on('chat', (data) => {
          setMessages((prevMessages) => [...prevMessages, data]);
        });

        return () => {
            socket.emit('leave', { partyCode, userId: user.id });
            socket.off('chat');
        };
    }, [partyCode, user.id]);

    const handleLeaveParty = async () => {
        await axios.post('http://localhost:5000/leave-party', { partyCode, userId: user.id });
        navigate('/');
    };
    
    const handleDeleteParty = async () => {
        await axios.post('http://localhost:5000/leave-party', { partyCode, userId: user.id });
        navigate('/');
    };

    async function handleShareScreen(){
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            videoRef.current.srcObject = stream;
        } catch (error) {
            console.error('Error sharing screen:', error);
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        const newMessage = { userId: user.username, message, partyCode };
        socket.emit('chat', newMessage);
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        setMessage('');
    };

    return(
        <div className="flex h-screen">
            <div className="w-1/4 bg-gray-200 p-4 flex flex-col fixed left-0 top-0 h-full">
                <h3 className="text-xl font-bold mb-4">Party Members</h3>
                <ul>
                {members.map((member) => (
                <li key={member.id} className={member.id === user.id ? 'font-bold' : ''}>
                    {member.username}{member.id === members[0]?.admin_id && ' (Admin)'}
                </li>
                ))}
                </ul>
                {members[0]?.admin_id === user.id && (
                <button onClick={handleDeleteParty} className="mt-4 bg-red-500 text-white py-2 px-4 rounded">
                    Delete Party
                </button>
                )}
                <button onClick={handleLeaveParty} className="mt-4 bg-blue-500 text-white py-2 px-4 rounded">
                    Leave Party
                </button>
            </div>
            <div className="w-1/2 flex flex-col items-center p-4">
                <video ref={videoRef} autoPlay className="border-2 border-gray-300"></video>
                <button onClick={handleShareScreen} className="mt-4 bg-green-500 text-white py-2 px-4 rounded">
                    Share Screen
                </button>
            </div>
            <div className="w-1/4 bg-gray-200 p-4 flex flex-col fixed right-0 top-0 h-full">
                <h3 className="text-xl font-bold mb-4">Chat</h3>
                <div className="overflow-y-auto h-64 border p-2 mb-4">
                    {messages.map((msg, index) => (
                        <div key={index} className="mb-2">
                            <strong>{msg.userId}</strong>: {msg.message}
                        </div>
                    ))}
                </div>
                <form onSubmit={handleSendMessage}>
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full p-2 border mb-2"
                        placeholder="Type a message"
                        required
                    />
                    <button type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded">
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
}

export default PartyPage;