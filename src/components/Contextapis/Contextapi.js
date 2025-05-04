import { createContext, useState, useEffect } from "react";

export const logincontext = createContext();

function Contextapi({ children }) {
    let [loginPatient, setLoginPatient] = useState(() => {
        // Retrieve login data from localStorage on initial load
        const savedUser = localStorage.getItem("loginPatient");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    useEffect(() => {
        if (loginPatient) {
            localStorage.setItem("loginPatient", JSON.stringify(loginPatient));
        } else {
            localStorage.removeItem("loginPatient"); // Clear storage on logout
        }
        console.log("Updated loginPatient state:", loginPatient);
    }, [loginPatient]);

    return (
        <logincontext.Provider value={[loginPatient, setLoginPatient]}>
            {children}
        </logincontext.Provider>
    );
}

export default Contextapi;
