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

const calculateFees = (stdData) => {
    let total = 0;
    for (let student of stdData) {
        console.log(student);
        if (student.fee_status && student.fee_status.amount) {
            total += student.fee_status.amount;
        }
    }
    return total;
}
export { calculateFees }
