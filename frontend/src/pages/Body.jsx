import {Outlet} from "react-router-dom";
import {useEffect} from "react";
import useFetchUser from "@/pages/useFetchUser.js";

const Body = () => {
    const fetchUser=useFetchUser()
    useEffect(() => {
        fetchUser();
    }, []);
    return (
        <>
            <Outlet/>
        </>
    )
}

export default Body
