import PropTypes from "prop-types";
import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthContextProvider = ({children}) => {
    // Safe JSON parsing function
    const getStoredUser = () => {
        try {
            const storedUser = localStorage.getItem("user");
            if (storedUser && storedUser !== "undefined") {
                return JSON.parse(storedUser);
            }
            return null;
        } catch (error) {
            console.error("Error parsing user data from localStorage:", error);
            // Clear corrupted data
            localStorage.removeItem("user");
            return null;
        }
    };

    const [currentUser, setCurrentUser] = useState(getStoredUser());

    const updateUser = (data) => {
        setCurrentUser(data);
    }

    useEffect(() => {
        // Only store valid data
        if (currentUser) {
            localStorage.setItem("user", JSON.stringify(currentUser));
        } else {
            localStorage.removeItem("user");
        }
    }, [currentUser]);

    return(
        <AuthContext.Provider value={{currentUser, updateUser}}>
            {children}
        </AuthContext.Provider>
    )
}

AuthContextProvider.propTypes = {
    children: PropTypes.node.isRequired
}