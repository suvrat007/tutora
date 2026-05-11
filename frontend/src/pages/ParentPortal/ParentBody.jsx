import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import useFetchParentUser from "@/hooks/useFetchParentUser.js";

const ParentBody = () => {
    const fetchParentUser = useFetchParentUser();
    const parentUser = useSelector((state) => state.parentUser);
    const navigate = useNavigate();

    useEffect(() => {
        fetchParentUser()
            .then((user) => { if (!user) navigate("/parent/login"); })
            .catch(() => { /* server/network error — user is authenticated, let page handle it */ });
    }, []);

    return <Outlet />;
};

export default ParentBody;
