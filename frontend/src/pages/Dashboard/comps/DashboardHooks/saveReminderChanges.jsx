import axiosInstance from "@/utilities/axiosInstance.jsx";


const saveReminderChanges = async (remindersToUpdate) => {
    try {
        const response = await axiosInstance.post('/update-reminder-status', remindersToUpdate);
        console.log("Save successful:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error saving reminder changes:", error);
        throw error; // Re-throw to handle in the component
    }
};
export { saveReminderChanges }
