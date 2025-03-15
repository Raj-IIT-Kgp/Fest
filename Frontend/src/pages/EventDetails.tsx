import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Spinner from "../components/Spinner.tsx";
import {jwtDecode} from "jwt-decode";

interface User {
    id: number;
    name: string;
}

interface Participant {
    user: User;
}

interface Event {
    id: number;
    title: string;
    description: string;
    participants: Participant[];
}

interface DecodedToken {
    id: number;
    role: string;
}

const EventDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [event, setEvent] = useState<Event | null>(null);
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvent = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                const decoded: DecodedToken = jwtDecode(token);
                setRole(decoded.role);
            }
            const response = await axios.get(`http://localhost:8787/api/v1/event/${id}`, {
                headers: {
                    'Authorization': `${token}`
                }
            });
            setEvent(response.data.event);
        };

        fetchEvent();
    }, [id]);

    const handleDeenroll = async (userId: number) => {
        const token = localStorage.getItem("token");
        try {
            await axios.delete(`http://localhost:8787/api/v1/event/deenroll/${id}/${userId}`, {
                headers: {
                    'Authorization': `${token}`
                }
            });
            setEvent((prevEvent) => {
                if (!prevEvent) return prevEvent;
                return {
                    ...prevEvent,
                    participants: prevEvent.participants.filter(participant => participant.user.id !== userId)
                };
            });
        } catch (error) {
            console.error('Failed to deenroll user', error);
        }
    };

    if (!event) {
        return <div><Spinner/></div>;
    }

    return (
        <div className="h-screen flex flex-col items-center p-8">
            <h1 className="text-4xl font-extrabold mb-8">{event.title}</h1>
            <p className="mb-4">{event.description}</p>
            <h2 className="text-2xl font-bold mb-4">Enrolled Students</h2>
            <ul>
                {event.participants.map((enrollment) => (
                    <li key={enrollment.user.id} className="flex justify-between items-center">
                        {enrollment.user.name}
                        {role ==='Admin' && (
                        <button
                            onClick={() => handleDeenroll(enrollment.user.id)}
                            className="ml-4 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                        >
                            Deenroll
                        </button>
                            )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default EventDetails;