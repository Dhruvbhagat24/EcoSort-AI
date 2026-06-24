import { useCallback, useEffect, useMemo, useState } from "react";
import API from "../services/api";
import { AuthContext } from "./authContext";

export function AuthProvider({ children }) {
	const [user, setUser] = useState(() => {
		const storedUser = localStorage.getItem("user");
		return storedUser ? JSON.parse(storedUser) : null;
	});
	const [token, setToken] = useState(() => localStorage.getItem("token") || "");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const bootstrapSession = async () => {
			if (!token) {
				setLoading(false);
				return;
			}

			try {
				const res = await API.get("/auth/profile");
				setUser(res.data);
				localStorage.setItem("user", JSON.stringify(res.data));
			} catch {
				localStorage.removeItem("token");
				localStorage.removeItem("user");
				setToken("");
				setUser(null);
			} finally {
				setLoading(false);
			}
		};

		bootstrapSession();
	}, [token]);

	const persistAuth = useCallback((authData) => {
		localStorage.setItem("token", authData.token);
		localStorage.setItem(
			"user",
			JSON.stringify({
				_id: authData._id,
				name: authData.name,
				email: authData.email
			})
		);
		setToken(authData.token);
		setUser({
			_id: authData._id,
			name: authData.name,
			email: authData.email
		});
	}, []);

	const login = useCallback(async (email, password) => {
		const res = await API.post("/auth/login", { email, password });
		persistAuth(res.data);
		return res.data;
	}, [persistAuth]);

	const register = useCallback(async (name, email, password) => {
		const res = await API.post("/auth/register", { name, email, password });
		persistAuth(res.data);
		return res.data;
	}, [persistAuth]);

	const logout = useCallback(() => {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		setToken("");
		setUser(null);
	}, []);

	const value = useMemo(
		() => ({
			user,
			token,
			loading,
			isAuthenticated: Boolean(token),
			login,
			register,
			logout
		}),
		[user, token, loading, login, register, logout]
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
