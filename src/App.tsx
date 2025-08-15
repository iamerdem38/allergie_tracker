
import React from 'react';
import { useAuth } from './contexts/AuthContext';
import Auth from './components/Auth';
import AllergyTracker from './components/AllergyTracker';

const App: React.FC = () => {
    const { session } = useAuth();

    return (
        <div className="bg-gray-100 min-h-screen">
            { !session ? <Auth /> : <AllergyTracker /> }
        </div>
    );
};

export default App;