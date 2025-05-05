import axios from "axios";
import axiosInstance from "../../../utilities/axiosInstance.jsx";

const useFetchAllBatch = async () => {
    try{
        const response = await axiosInstance.get("/get-all-batches");
        // console.log(response.data);
        return response.data;
    }catch(e){
        console.error(e);
    }
}
export default useFetchAllBatch;