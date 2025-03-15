import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Spinner from "../components/Spinner.tsx";
import DashboardButton from "../components/DashboardButton.tsx";


interface Event {
    id: number;
    title: string;
    description: string;
}

interface DecodedToken {
    id: number;
    role: string;
}

const AllEvents: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [loadingEnroll, setLoadingEnroll] = useState<number | null>(null);
    const [loadingDelete, setLoadingDelete] = useState<number | null>(null);
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const decoded: DecodedToken = jwtDecode(token);
            setRole(decoded.role);
        }

        const fetchEvents = async () => {
            const response = await axios.get('http://localhost:8787/api/v1/event/all', {
                headers: {
                    'Authorization': `${token}`
                }
            });
            setEvents(response.data.events);
            setLoading(false);
        };

        fetchEvents();
    }, []);

    const handleRegister = async (eventId: number) => {
        setLoadingEnroll(eventId);
        const token = localStorage.getItem("token");
        try {
            const response = await axios.post(`http://localhost:8787/api/v1/event/enroll/${eventId}`, {}, {
                headers: {
                    'Authorization': `${token}`
                }
            });

            if (response.status === 200) {
                alert('Registered successfully');
            } else {
                console.error('Failed to register');
            }
        } catch (error) {
            console.error('Failed to register', error);
        } finally {
            setLoadingEnroll(null);
        }
    };

    const handleDelete = async (eventId: number) => {
        setLoadingDelete(eventId);
        const token = localStorage.getItem("token");
        try {
            const response = await axios.delete(`http://localhost:8787/api/v1/event/delete/${eventId}`, {
                headers: {
                    'Authorization': `${token}`
                }
            });

            if (response.status === 200) {
                setEvents(events.filter((event) => event.id !== eventId));
            } else {
                console.error('Failed to delete event');
            }
        } catch (error) {
            console.error('Failed to delete event', error);
        } finally {
            setLoadingDelete(null);
        }
    };

    if (loading) {
        return <Spinner />;
    }
    if(loadingDelete){
        return <Spinner/>
    }

    if(loadingEnroll){
        return <Spinner/>
    }

    return (
        <div className="h-screen flex flex-col items-center p-8">
            <DashboardButton/>
            <h1 className="text-4xl font-extrabold mb-8">All Events</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-4xl">
                {events.map((event) => (
                    <div key={event.id} className="p-6 bg-white rounded-lg shadow-lg">
                        <h2 className="text-2xl font-bold mb-4">{event.title}</h2>
                        <p>{event.description}</p>
                        <div className="mt-4">
                            <button
                                onClick={() => handleRegister(event.id)}
                                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2"
                            >
                                Register
                            </button>
                            {(role === 'Admin') && (
                                <button
                                    onClick={() => handleDelete(event.id)}
                                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    Delete
                                </button>
                            )}
                            <Link to={`/event/${event.id}`} className="text-blue-600 hover:underline ml-2">
                                View Details
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AllEvents;