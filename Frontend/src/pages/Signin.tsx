import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Spinner from '../components/Spinner';

function Signin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
        };

        try {
            const response = await axios.post('http://localhost:8787/api/v1/user/signin', data);
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
            {loading ? (
                <div className="fixed inset-0 bg-gray-100 flex items-center justify-center">
                    <Spinner />
                </div>
            ) : (
                <div className="p-8 rounded-lg shadow-lg w-full max-w-md">
                    <h2 className="text-3xl font-extrabold mb-4 text-center">Signin</h2>
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
                        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Signin</button>
                    </form>
                    {message && <div className="mt-4 text-center alert">{message}</div>}
                    <p className="mt-4 text-center">
                        No account? <Link to="/signup" className="text-blue-600 hover:underline">Signup</Link>
                    </p>
                </div>
            )}
        </div>
    );
}

export default Signin;