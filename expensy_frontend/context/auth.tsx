"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Car = { id: string; name: string; year: string; color: string; photo: string | null };

type User = {
  name: string;
  email: string;
  bio: string;
  avatar: string | null; // data URL
  cars: Car[];
};

type AuthCtx = {
  user: User | null;
  login: (u: Pick<User, "name" | "email">) => void;
  logout: () => void;
  updateProfile: (patch: Partial<Pick<User, "bio" | "avatar" | "name">>) => void;
  addCar: (car: Omit<Car, "id">) => void;
  updateCar: (id: string, patch: Partial<Omit<Car, "id">>) => void;
  removeCar: (id: string) => void;
};

const AuthContext = createContext<AuthCtx>({
  user: null,
  login: () => {},
  logout: () => {},
  updateProfile: () => {},
  addCar: () => {},
  updateCar: () => {},
  removeCar: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const s = localStorage.getItem("yola_user");
      if (s) setUser(JSON.parse(s) as User);
    } catch {}
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem("yola_user", JSON.stringify(user));
    else localStorage.removeItem("yola_user");
  }, [user]);

  function login(u: Pick<User, "name" | "email">) {
    setUser({ ...u, bio: "", avatar: null, cars: [] });
  }

  function logout() { setUser(null); }

  function updateProfile(patch: Partial<Pick<User, "bio" | "avatar" | "name">>) {
    setUser(prev => prev ? { ...prev, ...patch } : prev);
  }

  function addCar(car: Omit<Car, "id">) {
    setUser(prev => prev ? { ...prev, cars: [...prev.cars, { ...car, id: Date.now().toString() }] } : prev);
  }

  function updateCar(id: string, patch: Partial<Omit<Car, "id">>) {
    setUser(prev => prev ? { ...prev, cars: prev.cars.map(c => c.id === id ? { ...c, ...patch } : c) } : prev);
  }

  function removeCar(id: string) {
    setUser(prev => prev ? { ...prev, cars: prev.cars.filter(c => c.id !== id) } : prev);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile, addCar, updateCar, removeCar }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
