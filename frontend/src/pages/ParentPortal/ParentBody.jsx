import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import useFetchParentUser from "@/hooks/useFetchParentUser.js";
import { useBackendStatus } from "@/utilities/BackendStatusContext.jsx";
import GuestChrome from "@/components/guest/GuestChrome.jsx";

const ParentBody = () => {
    const fetchParentUser = useFetchParentUser();
    const navigate = useNavigate();
    const { status: backendStatus } = useBackendStatus();
    const unreachableRef = useRef(false);

    const checkSession = () =>
        fetchParentUser()
            .then((user) => {
                unreachableRef.current = false;
                if (!user) navigate("/parent/login");
            })
            .catch(() => {
                // Server/network error - the session may well be fine, so hold
                // the page instead of redirecting, and try again once it's up.
                unreachableRef.current = true;
            });

    useEffect(() => {
        checkSession();
    }, []);

    useEffect(() => {
        if (backendStatus === "ready" && unreachableRef.current) {
            unreachableRef.current = false;
            checkSession();
        }
    }, [backendStatus]);

    return (
        <>
            <Outlet />
            <GuestChrome />
        </>
    );
};

export default ParentBody;
