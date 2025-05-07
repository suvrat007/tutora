import axiosInstance from "../../../utilities/axiosInstance.jsx";

const fetchStudents = async (batchId) => {
    try {
        const response = await axiosInstance.get(`/get-all-students-of-batch/${batchId}`);
        return response.data;
    } catch (err) {
        console.error("Error fetching students:", err);
    }
}
export default fetchStudents;