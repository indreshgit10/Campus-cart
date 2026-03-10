import { createContext, useState, useEffect } from "react";
import api from "../utils/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("userInfo");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post("/users/login", { email, password });
      setUser(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
      return data;
    } catch (error) {
      throw error.response?.data?.message || "Login failed";
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await api.post("/users/register", userData);
      setUser(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
      return data;
    } catch (error) {
      throw error.response?.data?.message || "Registration failed";
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("userInfo");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
