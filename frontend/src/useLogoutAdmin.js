import axiosInstance from "@/utilities/axiosInstance.jsx";
import {useDispatch} from "react-redux";
import {deleteUser} from "@/utilities/redux/userSlice.jsx";

const handleLogoutAdmin = async () => {
    const dispatch = useDispatch();
    try {
        const response = await axiosInstance.post("/api/auth/logout", null, {
            withCredentials: true,
        });
        dispatch(deleteUser());
        console.log(response);
    } catch (error) {
        console.log(error);
    }
}

export default {handleLogoutAdmin};