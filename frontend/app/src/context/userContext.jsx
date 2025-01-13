import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        axios.get('/profile')
            .then(({ data }) => {
                setUser(data);
            })
            .catch((err) => {
                console.error('Error fetching profile:', err);
                // Optionally, set an error state or handle accordingly
            });
    }, []); // Ensure this runs only once

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
}