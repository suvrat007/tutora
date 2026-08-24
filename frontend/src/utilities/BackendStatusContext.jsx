import { createContext, useContext } from "react";
import useBackendWakeup from "@/hooks/useBackendWakeup.js";

/**
 * Shares one cold-start probe across the app: the overlay renders it, and the
 * auth gates use it to tell "the server is still booting" apart from "you are
 * not logged in". Mounted once in App so only a single poller ever runs.
 */
const BackendStatusContext = createContext({
    status: "ready",
    elapsedMs: 0,
    isOffline: false,
    retry: () => {},
});

export const BackendStatusProvider = ({ children }) => {
    const value = useBackendWakeup();
    return <BackendStatusContext.Provider value={value}>{children}</BackendStatusContext.Provider>;
};

export const useBackendStatus = () => useContext(BackendStatusContext);

export default BackendStatusContext;
