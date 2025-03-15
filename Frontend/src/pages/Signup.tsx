import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Spinner from '../components/Spinner';

function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState('User');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        const data = {
            email: formData.get('email') as string,
            password: formData.get('password') as string,
            name: formData.get('name') as string,
            role: formData.get('role') as string,
        };

        try {
            const response = await axios.post('http://localhost:8787/api/v1/user/signup', data);
            const jwt = response.data.token;
            localStorage.setItem("token", jwt);
            setMessage(response.data.message);
            navigate('/dashboard');
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setMessage(error.response?.data.message || 'An error occurred');
            } else {
                setMessage('An unexpected error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen flex justify-center items-center">
            <div className="p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-3xl font-extrabold mb-4 text-center">Signup</h2>
                {loading ? (
                    <div className="fixed inset-0 bg-gray-100 flex items-center justify-center">
                        <Spinner />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1" htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="w-full p-2 border rounded"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1" htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                className="w-full p-2 border rounded"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1" htmlFor="name">Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                className="w-full p-2 border rounded"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1" htmlFor="role">Role</label>
                            <select
                                id="role"
                                name="role"
                                className="w-full p-2 border rounded"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                required
                            >
                                <option value="User">User</option>
                                <option value="Admin">Admin</option>
                                <option value="Manager">Manager</option>
                            </select>
                        </div>
                        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Signup</button>
                    </form>
                )}
                {message && <div className="mt-4 text-center alert">{message}</div>}
                <p className="mt-4 text-center">
                    Already have an account? <Link to="/signin" className="text-blue-600 hover:underline">Signin</Link>
                </p>
            </div>
        </div>
    );
}

export default Signup;