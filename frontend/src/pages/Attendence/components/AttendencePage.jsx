import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import useFetchClassLogs from "../../useFetchClassLogs.js";
import useAttendanceConstraints from "../hooks/useAttendanceConstraints.js";
import MarkedPresentList from "@/pages/Attendence/components/MarkedPresentList.jsx";
import {AttendanceForm} from "@/pages/Attendence/components/AttendanceForm.jsx";
import {StudentList} from "@/pages/Attendence/components/StudentList.jsx";
import {useAttendanceState} from "@/pages/Attendence/hooks/useAttendanceState.js";
import {useStudentFetcher} from "@/pages/Attendence/hooks/useStudentFetcher.js";
import {useAttendanceSubmission} from "@/pages/Attendence/hooks/useAttendanceSubmission.js";
import {useStudentActions} from "@/pages/Attendence/hooks/useStudentActions.js";
import AttendancePercentages from "@/pages/Attendence/components/AttendancePercentages.jsx";
import useFetchAttendanceSummary from "@/pages/useFetchAttendanceSummary.js";
import { motion } from "framer-motion";

const AttendancePage = () => {
  const state = useAttendanceState();
  const {
    batchName, subjectName, date, students, presentIds, error, loading,
    success, markedPresentStudents, clearForm, resetStudentData
  } = state;

  const batches = useSelector((state) => state.batches);
  const groupedStudents = useSelector((state) => state.students.groupedStudents);
  const classLogs = useSelector((state) => state.classlogs);
  const attendanceSummary= useSelector((state)=>state.attendance.data)

  const fetchAllClassLogs = useFetchClassLogs();
  const fetchAttendance = useFetchAttendanceSummary()

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
      fetchAllClassLogs,fetchAttendance,
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
      <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="p-4 flex flex-col gap-4 flex-1 overflow-hidden bg-background"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1">
            <AttendancePercentages
                attendance={attendanceSummary}
                batchName={batchName}
                setBatchName={state.setBatchName}
                subjectName={subjectName}
                setSubjectName={state.setSubjectName}
                batches={batches}
            />
          </div>

          <div className="lg:col-span-2">
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
          </div>
        </div>

        <div className="bg-white p-2 rounded-3xl shadow-medium flex-1 overflow-hidden border border-border">
          <div className="flex flex-col lg:flex-row gap-4 h-full">
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
            <MarkedPresentList
                markedPresentStudents={markedPresentStudents}
                batchName={batchName}
                subjectName={subjectName}
                date={date}
            />
          </div>
        </div>
      </motion.div>
  );
};

export default AttendancePage