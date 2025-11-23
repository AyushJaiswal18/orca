import { createContext, useContext } from "react";
import { useState } from "react";

const authContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authStatus, setauthStatus] = useState(false);
  return (
    <authContext.Provider
      value={{ authStatus: authStatus, setauthStatus: setauthStatus }}
    >
      {children}
    </authContext.Provider>
  );
};

export const useAuth = () => useContext(authContext);
