import { useEffect } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import useFetchClassLogs from "@/pages/useFetchClassLogs.js";
import useAttendanceConstraints from "../hooks/useAttendanceConstraints.js";
import MarkedPresentList from "@/pages/Attendence/components/MarkedPresentList.jsx";
import { AttendanceForm } from "@/pages/Attendence/components/AttendanceForm.jsx";
import { useAttendanceState } from "@/pages/Attendence/hooks/useAttendanceState.js";
import { useStudentFetcher } from "@/pages/Attendence/hooks/useStudentFetcher.js";
import { useStudentActions } from "@/pages/Attendence/hooks/useStudentActions.js";
import AttendancePercentages from "@/pages/Attendence/components/AttendancePercentages.jsx";
import useFetchAttendanceSummary from "@/pages/useFetchAttendanceSummary.js";
import { StudentList } from "@/pages/Attendence/components/StudentList.jsx";
import { useAttendanceSubmission } from "@/pages/Attendence/hooks/useAttendanceSubmission.js";
import WrapperCard from "@/utilities/WrapperCard.jsx";

export const AttendancePage = () => {
  const state = useAttendanceState();
  const {
    batchName,
    subjectName,
    date,
    students,
    presentIds,
    error,
    loading,
    success,
    markedPresentStudents,
    clearForm,
    resetStudentData,
  } = state;

  const batches = useSelector((state) => state.batches);
  const groupedStudents = useSelector((state) => state.students.groupedStudents);
  const classLogs = useSelector((state) => state.classlogs);
  const attendanceSummary = useSelector((state) => state.attendance.data);

  const fetchAllClassLogs = useFetchClassLogs();
  const fetchAttendance = useFetchAttendanceSummary();

  const { isValidDateTime, errorMessage } = useAttendanceConstraints(
      batchName,
      subjectName,
      date,
      batches
  );

  const { fetchStudents } = useStudentFetcher(
      batches,
      groupedStudents,
      classLogs,
      state.setStudents,
      state.setMarkedPresentStudents,
      state.setPresentIds,
      state.setSuccess,
      state.setError
  );

  const { submit } = useAttendanceSubmission(
      batches,
      fetchAllClassLogs,
      fetchAttendance,
      state.setLoading,
      state.setError,
      state.setSuccess
  );

  const actions = useStudentActions(
      presentIds,
      state.setPresentIds,
      students,
      markedPresentStudents
  );

  const handleSearch = () => {
    fetchStudents(batchName, subjectName, date, isValidDateTime, errorMessage);
  };

  const handleSubmit = async () => {
    await submit(
        batchName,
        subjectName,
        date,
        presentIds,
        isValidDateTime,
        errorMessage,
        handleSearch
    );
  };

  useEffect(() => {
    if (batchName && subjectName && date && classLogs.length > 0) {
      const timer = setTimeout(() => {
        fetchStudents(batchName, subjectName, date, isValidDateTime, errorMessage);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [batchName, subjectName, date, classLogs.length, classLogs]);

  return (
      <div className="min-h-screen py-3 px-5 sm:px-6 flex flex-col gap-6 flex-1 overflow-y-auto">
        <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.5, ease: "easeInOut"}}
            className="flex flex-col lg:flex-row gap-6"
        >
          <div className="flex-1 order-2 sm:order-1">
            <WrapperCard>
              <AttendancePercentages
                  attendance={attendanceSummary}
                  batchName={batchName}
                  setBatchName={state.setBatchName}
                  subjectName={subjectName}
                  setSubjectName={state.setSubjectName}
                  batches={batches}
              />
            </WrapperCard>
          </div>
          <div className="flex-1 order-1 sm:order-2">
            <WrapperCard>
              <AttendanceForm
                  batchName={batchName}
                  setBatchName={state.setBatchName}
                  subjectName={subjectName}
                  setSubjectName={state.setSubjectName}
                  date={date}
                  setDate={state.setDate}
                  batches={batches}
                  error={error}
                  success={success}
                  loading={loading}
                  resetStudentData={resetStudentData}
                  clearForm={clearForm}
                  handleSearch={handleSearch}
              />
            </WrapperCard>
          </div>
        </motion.div>


        <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.5, ease: "easeInOut", delay: 0.2}}
            className="flex flex-col lg:flex-row gap-6"
        >
          <WrapperCard>
            <StudentList
                students={students}
                presentIds={presentIds}
                loading={loading}
                markedPresentStudents={markedPresentStudents}
                togglePresent={actions.togglePresent}
                selectAll={actions.selectAll}
                clearAll={actions.clearAll}
                markAllPreviouslyPresent={actions.markAllPreviouslyPresent}
                handleSubmit={handleSubmit}
                isValidDateTime={isValidDateTime}
                batchName={batchName}
                subjectName={subjectName}
                date={date}
            />
          </WrapperCard>

          <WrapperCard>
            <MarkedPresentList
                markedPresentStudents={markedPresentStudents}
                batchName={batchName}
                subjectName={subjectName}
                date={date}
            />
          </WrapperCard>
        </motion.div>
      </div>
  );
};

export default AttendancePage;
