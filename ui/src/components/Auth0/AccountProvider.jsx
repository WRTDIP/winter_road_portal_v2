import { createContext, useCallback, useContext, useEffect, useState } from "react";

const AccountContext = createContext(null);

// Sign in happens on the portal's own login and register pages. The API
// exchanges the credentials with Auth0 and keeps the session in an httpOnly
// cookie, so this provider only asks the API who is signed in.
async function request(path, body) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const result = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, result };
}

export function AccountProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAccount = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const { ok, status, result } = await request("/api/user/sync");
      if (ok) {
        setAccount(result.data);
        setIsAuthenticated(true);
      } else if (status === 401) {
        setAccount(null);
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
        setError(result.message || "Unable to load your account. Please try again.");
      }
    } catch {
      setError("We could not reach the server. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAccount();
  }, [loadAccount]);

  const authenticate = useCallback(async (path, body) => {
    const { ok, result } = await request(path, body);
    if (!ok) throw new Error(result.message || "Unable to sign in. Please try again.");
    await loadAccount();
  }, [loadAccount]);

  const value = {
    account,
    isAuthenticated,
    isLoading,
    error,
    retry: loadAccount,
    login: (email, password) => authenticate("/api/auth/login", { email, password }),
    signup: (name, email, password) => authenticate("/api/auth/signup", { name, email, password }),
    logout: async () => {
      await request("/api/auth/logout");
      setAccount(null);
      setIsAuthenticated(false);
      setError("");
    },
  };

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount() {
  return useContext(AccountContext);
}
