const useFeeData = (groupedStudents, batches) => {
  if (!groupedStudents || !Array.isArray(groupedStudents) || !batches || !Array.isArray(batches)) {
    return {
      batches: [],
      students: [],
      totalInstituteFees: 0
    };
  }

  const feeData = groupedStudents.map((batch) => {
    const batchDetails = batches.find((b) => b._id === batch.batchId) || { name: batch.batchId, subject: [], forStandard: "" };

    const batchFeeSummary = batch.students.reduce(
        (acc, student) => {
          const amount = student.fee_status?.amount || 0;
          const latestFeeStatus = student.fee_status?.feeStatus?.length > 0
              ? student.fee_status.feeStatus.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
              : null;
          const isPaidThisMonth = latestFeeStatus
              ? new Date(latestFeeStatus.date).getMonth() === new Date().getMonth() &&
              new Date(latestFeeStatus.date).getFullYear() === new Date().getFullYear() &&
              latestFeeStatus.paid
              : false;

          // Map subjectIds to subject names
          const subjectNames = student.subjectId.map((subjectId) => {
            const subject = batchDetails.subject.find((s) => s._id === subjectId);
            return subject ? subject.name : "Unknown Subject";
          });

          return {
            totalFees: acc.totalFees + amount,
            students: [
              ...acc.students,
              {
                studentId: student._id,
                name: student.name,
                batchId: batch.batchId,
                batchName: batchDetails.name,
                subjects: subjectNames,
                amount: amount,
                feeStatus: student.fee_status.feeStatus,
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

  // Calculate total institute fees
  const totalInstituteFees = feeData.reduce((sum, batch) => sum + batch.totalFees, 0);

  // Flatten students for table display
  const allStudents = feeData.flatMap((batch) => batch.students);

  return {
    batches: feeData,
    students: allStudents,
    totalInstituteFees
  };
};

export default useFeeData;