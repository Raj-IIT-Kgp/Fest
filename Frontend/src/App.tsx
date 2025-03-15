import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CreateEvent from './pages/CreatedEvent';
import AllEvents from './pages/AllEvents';
import EventDetails from './pages/EventDetails';
import Signin from "./pages/Signin.tsx";
import Signup from "./pages/Signup.tsx";
import Opening from "./pages/Opening.tsx";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Opening/>} />
                <Route path="/signin" element={<Signin/>} />
                <Route path="/signup" element={<Signup/>} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/create-event" element={<CreateEvent />} />
                <Route path="/all-events" element={<AllEvents />} />
                <Route path="/event/:id" element={<EventDetails />} />
            </Routes>
        </Router>
    );
}

export default App;