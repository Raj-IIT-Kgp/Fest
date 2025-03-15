import React from 'react';
import { Link } from 'react-router-dom';

const Opening: React.FC = () => {
    return (
        <div className="h-screen flex flex-col items-center justify-center p-8">
            <h1 className="text-4xl font-extrabold mb-8">Welcome to Our Website</h1>
            <div className="flex space-x-4">
                <Link to="/signup" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Get Started
                </Link>
                <Link to="/signin" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                    Sign In
                </Link>
            </div>
        </div>
    );
};

export default Opening;