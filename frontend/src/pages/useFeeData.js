import axios from 'axios';
import axiosInstance from "@/utilities/axiosInstance.jsx";

const useFeeData = async (groupedStudents, batches, month) => {
  // Early return if inputs are invalid
  if (!groupedStudents || !Array.isArray(groupedStudents) || !batches || !Array.isArray(batches)) {
    console.warn('useFeeData: Invalid input - groupedStudents or batches is missing or not an array');
    return {
      batches: [],
      students: [],
      totalInstituteFees: 0
    };
  }

  // Call the backend to ensure all students have a fee status for the current month
  try {
    const response = await axiosInstance.post('/api/student/ensure-current-month-fee-status', {}, {
      withCredentials: true
    });

    const updatedResponse = await axiosInstance.get('/api/student/get-students-grouped-by-batch', {
      withCredentials: true
    });
    groupedStudents = updatedResponse.data || groupedStudents;
  } catch (error) {
    console.error('useFeeData: Error ensuring current month fee status:', error.message, error.response?.data);
    // Proceed with existing data to avoid blocking
  }

  const feeData = groupedStudents.map((batch) => {
    const batchDetails = batches.find((b) => b._id === batch.batchId) || {
      name: batch.batchId || 'No Batch',
      subject: [],
      forStandard: batch.forStandard || ""
    };

    const batchFeeSummary = batch.students.reduce(
        (acc, student) => {
          const amount = student.fee_status?.amount || 0;
          const latestFeeStatus = student.fee_status?.feeStatus?.length > 0
              ? student.fee_status.feeStatus.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
              : null;
          const isPaidThisMonth = latestFeeStatus
              ? new Date(latestFeeStatus.date).getMonth() === new Date(month).getMonth() &&
              new Date(latestFeeStatus.date).getFullYear() === new Date(month).getFullYear() &&
              latestFeeStatus.paid
              : false;

          const subjectNames = (student.subjectId || []).map((subjectId) => {
            const subject = batchDetails.subject.find((s) =>subjectId.includes(s._id));
            return subject ? subject.name : "Unknown Subject";
          });

          return {
            totalFees: acc.totalFees + amount,
            students: [
              ...acc.students,
              {
                studentId: student._id,
                name: student.name || 'Unknown Student',
                batchId: batch.batchId,
                batchName: batchDetails.name,
                subjects: subjectNames,
                amount: amount,
                feeStatus: student.fee_status?.feeStatus || [],
                isPaidThisMonth,
                admission_date: student.admission_date
              }
            ]
          };
        },
        { totalFees: 0, students: [] }
    );

    return {
      batchId: batch.batchId,
      batchName: batchDetails.name,
      forStandard: batchDetails.forStandard || batch.forStandard || "",
      totalFees: batchFeeSummary.totalFees,
      students: batchFeeSummary.students
    };
  });

  const totalInstituteFees = feeData.reduce((sum, batch) => sum + batch.totalFees, 0);
  const allStudents = feeData.flatMap((batch) => batch.students);

  return {
    batches: feeData,
    students: allStudents,
    totalInstituteFees
  };
};

export default useFeeData;