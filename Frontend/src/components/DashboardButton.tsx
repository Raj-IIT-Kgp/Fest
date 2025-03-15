import React from 'react';
import { useNavigate } from 'react-router-dom';

const DashboardButton: React.FC = () => {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded fixed top-4 right-4"
        >
            Dashboard
        </button>
    );
};

export default DashboardButton;