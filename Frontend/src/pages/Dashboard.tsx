import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
    id: number;
    role: string;
}

function Dashboard() {
    const [role, setRole] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const decoded: DecodedToken = jwtDecode(token);
            setRole(decoded.role);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate('/signin');
    };

    return (
        <div className="h-screen flex flex-col items-center p-8">
            <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded fixed top-4 right-4"
            >
                Logout
            </button>
            <h1 className="text-4xl font-extrabold mb-8">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-4xl">
                {(role === 'Manager' || role === 'Admin') && (
                    <Link to="/create-event" className="p-6 bg-white rounded-lg shadow-lg text-center">
                        <h2 className="text-2xl font-bold mb-4">Create Event</h2>
                    </Link>
                )}
                <Link to="/all-events" className="p-6 bg-white rounded-lg shadow-lg text-center">
                    <h2 className="text-2xl font-bold mb-4">All Events</h2>
                </Link>
            </div>
        </div>
    );
}

export default Dashboard;