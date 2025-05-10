import axiosInstance from "../../../../utilities/axiosInstance.jsx";

const getAllRemindersForTheDay = async () => {
    try {
        const response = await axiosInstance.get('get-all-batches');
        const batches = response.data;
        let reminders = [];

        const today = new Date().toISOString().split('T')[0];

        for (let batch of batches) {
            for (let subject of batch.subject) {
                for (let classStatus of subject.class_status) {
                    for (let session of classStatus.sessions) {
                        for (let status of session.status) {
                            if (!status.forDate) continue; // skip if forDate is missing
                            const statusDateObj = new Date(status.forDate);
                            if (isNaN(statusDateObj)) continue; // skip if invalid date

                            const statusDate = statusDateObj.toISOString().split('T')[0];
                            if (statusDate === today) {
                                reminders.push({
                                    batchName: batch.name,
                                    subjectName: subject.name,
                                    reminder: status.updates
                                });
                            }
                        }
                    }
                }
            }
        }

        return reminders;
    } catch (error) {
        console.log(error);
        return [];
    }
};


export { getAllRemindersForTheDay }