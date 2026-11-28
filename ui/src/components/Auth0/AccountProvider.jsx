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
      } else {
        // Anything but success leaves the user signed out, so a failed account
        // load never looks like a working session.
        setAccount(null);
        setIsAuthenticated(false);
        if (status !== 401) setError(result.message || "Unable to load your account. Please try again.");
        if (status === 409) await request("/api/auth/logout").catch(() => {});
      }
      return { ok, status, result };
    } catch {
      setAccount(null);
      setIsAuthenticated(false);
      const message = "We could not reach the server. Please check your connection and try again.";
      setError(message);
      return { ok: false, status: 0, result: { message } };
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAccount();
  }, [loadAccount]);

  const authenticate = useCallback(async (path, body) => {
    const { ok, result } = await request(path, body);
    if (!ok) {
      const failure = new Error(result.message || "Unable to sign in. Please try again.");
      failure.accountCreated = result.accountCreated === true;
      throw failure;
    }
    const loaded = await loadAccount();
    if (!loaded.ok) {
      // The sign-in cookie was set but the account could not be loaded; drop
      // the cookie so the user is not left half signed in.
      await request("/api/auth/logout");
      throw new Error(loaded.result.message || "Signed in, but your account could not be loaded. Please try again.");
    }
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
