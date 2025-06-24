import axiosInstance from "@/utilities/axiosInstance.jsx";
import {useDispatch} from "react-redux";
import {setUser} from "@/utilities/redux/userSlice.jsx";

const useFetchUser = () => {
    const dispatch = useDispatch();
    const getUser = async () => {
        const response  =await axiosInstance.get("/api/admin/get",{withCredentials: true});
        dispatch(setUser(response.data.data));
    }
    return getUser;
}
export default useFetchUser