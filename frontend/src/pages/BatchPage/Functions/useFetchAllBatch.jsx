import axiosInstance from "../../../utilities/axiosInstance.jsx";

const useFetchAllBatch = async () => {
    try{
        const response = await axiosInstance.get('batch/get-all-batches', { withCredentials: true });
        // console.log(response.data);
        return response.data.data;
    }catch(e){
        console.error(e);
    }
}
export default useFetchAllBatch;


