import { createContext, useState, useEffect } from 'react';
import api from '../axios'; // Import the centralized Axios instance

// Create the UserContext
export const UserContext = createContext({});

export function UserContextProvider({ children }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Fetch user profile if not already set
        if (!user) {
            api.get('/profile')
                .then(({ data }) => {
                    setUser(data); // Set user data from the response
                })
                .catch((err) => {
                    console.error('Error fetching profile:', err);
                });
        }
    }, [user]);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
}
