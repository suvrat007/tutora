import axiosInstance from "../../../utilities/axiosInstance.jsx";

export const fetchStudentsOfBatch = async (batchId) => {
    const response = await axiosInstance.get(`/get-all-students-of-batch/${batchId}`);
    return response.data || [];
};
