import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Restore user session on browser refresh safely
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Live Backend Login Action
  const login = async (email_address, password) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email_address, password }),
      });

      const contentType = res.headers.get("content-type");
      if (!res.ok || !contentType || !contentType.includes("application/json")) {
        // Parse the error message if JSON, fallback to fallback text
        const errorData = contentType?.includes("application/json") ? await res.json() : {};
        throw new Error(errorData.message || "Invalid login credentials or server error.");
      }

      const data = await res.json();
      
      // Save data to state and browser storage
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token); // Save your JWT token for checkout routes
      
      return { success: true };
    } catch (err) {
      console.error("[Auth Context Error - Login]:", err.message);
      return { success: false, error: err.message };
    }
  };

  // Live Backend Registration (Signup) Action
  const signup = async (first_name, last_name, email_address, password) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ first_name, last_name, email_address, password }),
      });

      const contentType = res.headers.get("content-type");
      if (!res.ok || !contentType || !contentType.includes("application/json")) {
        const errorData = contentType?.includes("application/json") ? await res.json() : {};
        throw new Error(errorData.message || "Registration failed. Please try again.");
      }

      const data = await res.json();

      // Save data to state and browser storage
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      
      return { success: true };
    } catch (err) {
      console.error("[Auth Context Error - Signup]:", err.message);
      return { success: false, error: err.message };
    }
  };

  // Clear State & Local Session
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
