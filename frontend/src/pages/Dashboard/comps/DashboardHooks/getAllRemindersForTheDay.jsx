// src/pages/Dashboard/comps/DashboardHooks/getAllRemindersForTheDay.jsx
import axiosInstance from "../../../../utilities/axiosInstance.jsx";

const getAllBatches = async () => {
    try{
        const response = await axiosInstance.get('/get-all-batches');
        console.log(response.data);
        return response.data;
    }catch(error){
        console.log(error);
        throw error;
    }
}



export { getAllBatches }