import { useEffect, useState } from "react";
import axiosInstance from "../../utilities/axiosInstance.jsx";
import useGetBatchId from "./hooks/useGetBatchId.js";
import editStudentAttendance from "./hooks/editStudentAttendence.jsx";
import { getTotalClasses } from "@/pages/Attendence/hooks/getTotalClasses.jsx";
import useFetchAllBatch from "@/pages/BatchPage/Functions/useFetchAllBatch.jsx";
import SideBar from "../Navbar/SideBar.jsx";
import Navbar from "../Navbar/Navbar.jsx";

const AttendancePage = () => {
  const [batchName, setBatchName] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [date, setDate] = useState("");
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [students, setStudents] = useState([]);
  const [alreadyPresent, setAlreadyPresent] = useState([]);
  const [presentIds, setPresentIds] = useState(new Set());
  const [error, setError] = useState("");
  const [totalClasses, setTotalClasses] = useState(0);

  const { batchId, subjectId } = useGetBatchId(batchName, subjectName);

  useEffect(() => {
    useFetchAllBatch().then(setBatches).catch(() => setBatches([]));
  }, []);

  useEffect(() => {
    const batch = batches.find((b) => b.name === batchName);
    setSelectedBatch(batch || null);
  }, [batchName, batches]);

  useEffect(() => {
    if (batchId && subjectId && isToday()) {
      fetchStudents();
      fetchTotal();
    } else {
      resetStudentData();
    }
  }, [batchId, subjectId, date]);

  const isToday = () => new Date(date).toDateString() === new Date().toDateString();

  const fetchTotal = async () => {
    try {
      const count = await getTotalClasses(batchId, subjectId);
      setTotalClasses(count);
    } catch {
      setTotalClasses(0);
    }
  };

  const fetchStudents = async () => {
    setError("");
    try {
      const res = await axiosInstance.get(`/get-all-students-of-batch/${batchId}`);
      const all = res.data || [];
      const dStr = new Date(date).toISOString().split("T")[0];

      const present = [], alreadyIds = new Set();

      all.forEach((s) => {
        const marked = (s.attendance || []).some((r) =>
            new Date(r.date).toISOString().split("T")[0] === dStr && r.subject === subjectId
        );
        if (marked) {
          alreadyIds.add(s._id);
          present.push({ student: s, time: "Marked" });
        }
      });

      setStudents(all.filter((s) => !alreadyIds.has(s._id)));
      setAlreadyPresent(present);
      setPresentIds(new Set());
    } catch {
      setError("Could not load students");
    }
  };

  const resetStudentData = () => {
    setStudents([]);
    setAlreadyPresent([]);
    setPresentIds(new Set());
    setTotalClasses(0);
  };

  const togglePresent = (id) => {
    setPresentIds((prev) => {
      const copy = new Set(prev);
      copy.has(id) ? copy.delete(id) : copy.add(id);
      return copy;
    });
  };

  const clearForm = () => {
    setBatchName("");
    setSubjectName("");
    setDate("");
    resetStudentData();
    setError("");
  };

  const isScheduledToday = () => {
    if (!selectedBatch || !subjectName || !date) return false;
    const day = new Date(date).toLocaleString("en-US", { weekday: "long" });
    const subj = selectedBatch.subject.find((s) => s.name === subjectName);
    return subj?.classSchedule.some((s) => s.days.includes(day));
  };

  const submit = async () => {
    setError("");
    if (!batchName || !subjectName || !date)
      return setError("All fields required");
    if (new Date(date) < new Date().setHours(0, 0, 0, 0))
      return setError("Cannot mark for past dates");
    if (!isScheduledToday())
      return setError("Subject not scheduled today");
    if (!presentIds.size)
      return alert("No students marked present");

    try {
      const errs = await editStudentAttendance([...presentIds], subjectId, batchId, date);
      if (!errs.length) {
        alert("Submitted successfully");
        fetchStudents();
      } else {
        setError("Some entries failed");
      }
    } catch {
      setError("Submission failed");
    }
  };

  return (
      <div className="min-h-screen w-screen bg-[#d3a781] text-white flex justify-center items-start overflow-hidden">
        <div className="bg-[#fee5cf] w-full min-h-[95vh] rounded-[2rem] border shadow-2xl overflow-hidden flex mx-2 my-4">
          <SideBar />
          <div className="flex flex-col w-full overflow-hidden">
            <Navbar />
            <div className="p-4 flex flex-col gap-4 flex-1 overflow-hidden">
              {/* Top Section: Summary + Form */}
              <div className="flex gap-4 flex-1">
                {/* Summary */}
                <div className="bg-[#f4d8bb] p-2 rounded-3xl shadow-md flex-1">
                  <div className="bg-white rounded-2xl p-4 text-black h-full">
                    <h2 className="font-bold mb-2">Overall Attendance</h2>
                    <ul className="flex flex-wrap gap-2">
                      {students.map((s) => {
                        const count = (s.attendance || []).filter((r) => r.subject === subjectId && r.present).length;
                        const percent = totalClasses > 0 ? Math.round((count / totalClasses) * 100) : 0;
                        return (
                            <li key={s._id} className="p-2 border rounded-lg w-[7em] text-center">
                              <span>{s.name}</span>
                              <span className="block font-bold">{percent}%</span>
                            </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>

                {/* Form */}
                <div className="bg-[#f4d8bb] p-2 rounded-3xl shadow-md flex-1">
                  <div className="bg-white rounded-2xl p-4 text-black flex flex-col gap-3 h-full">
                    <select value={batchName} onChange={(e) => setBatchName(e.target.value)} className="border p-2 rounded-md">
                      <option value="">Select Batch</option>
                      {batches.map((b, i) => <option key={i} value={b.name}>{b.name}</option>)}
                    </select>

                    <select value={subjectName} onChange={(e) => setSubjectName(e.target.value)} className="border p-2 rounded-md">
                      <option value="">Select Subject</option>
                      {selectedBatch?.subject.map((s, i) => <option key={i} value={s.name}>{s.name}</option>)}
                    </select>

                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border p-2 rounded-md" />

                    {error && <p className="text-red-600 text-sm">{error}</p>}

                    <div className="flex gap-2 mt-auto">
                      <button onClick={fetchStudents} className="bg-blue-500 text-white p-2 rounded-md w-1/2">Search</button>
                      <button onClick={clearForm} className="bg-gray-400 text-white p-2 rounded-md w-1/2">Clear</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Section: Marking + Already Present */}
              <div className="flex gap-4 flex-1">
                {/* Marking */}
                <div className="bg-[#f4d8bb] p-2 rounded-3xl shadow-md flex-1">
                  <div className="bg-white rounded-2xl p-4 text-black h-full overflow-y-auto">
                    <div className="flex justify-between mb-2">
                      <h2 className="font-bold">All Students</h2>
                      <button onClick={submit} className="bg-green-600 text-white px-4 py-2 rounded-md">Submit</button>
                    </div>
                    {students.map((s, i) => (
                        <div key={s._id} className="border p-3 rounded-md mb-2 flex justify-between items-center">
                          <span>{i + 1}. {s.name}</span>
                          <button
                              onClick={() => togglePresent(s._id)}
                              className={`w-8 h-8 border rounded-full flex items-center justify-center ${
                                  presentIds.has(s._id) ? "bg-green-500 text-white" : "bg-white text-black"
                              }`}
                          >
                            {presentIds.has(s._id) ? "✓" : ""}
                          </button>
                        </div>
                    ))}
                  </div>
                </div>

                {/* Already Present */}
                <div className="bg-[#f4d8bb] p-2 rounded-3xl shadow-md flex-1">
                  <div className="bg-white rounded-2xl p-4 text-black h-full overflow-y-auto">
                    <h2 className="font-bold mb-2">Already Marked on {date || "N/A"}</h2>
                    {alreadyPresent.map((entry, i) => (
                        <div key={entry.student._id} className="border p-3 rounded-md mb-2 flex justify-between items-center">
                          <span>{i + 1}. {entry.student.name}</span>
                          <span className="text-green-700 font-bold">{entry.time}</span>
                        </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
  );
};

export default AttendancePage;
