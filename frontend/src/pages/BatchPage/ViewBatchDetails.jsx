import {AiOutlineClose, AiOutlineMinus, AiOutlinePlus} from "react-icons/ai";

const ViewBatchDetails = () => {

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in">
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold">Create New Batch</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition">
                        <AiOutlineClose size={24}/>
                    </button>
                </div>

                <div className="p-4 space-y-6 max-h-[75vh] overflow-y-auto">
                    {/* Batch Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Batch Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={batchData.name}
                                onChange={handleBatchChange}
                                className="w-full border rounded-lg px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Normalized Name (auto)</label>
                            <input
                                type="text"
                                value={batchData.normalized_name}
                                disabled
                                className="w-full bg-gray-100 border rounded-lg px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Standard / Grade (numeric value
                                only)*</label>
                            <input
                                type="text"
                                name="forStandard"
                                value={batchData.forStandard}
                                onChange={handleBatchChange}
                                className="w-full border rounded-lg px-3 py-2"
                            />
                        </div>
                    </div>

                    {/* Subjects */}
                    <div>
                        <h3 className="text-md font-semibold mb-2 flex items-center justify-between">
                            Subjects
                            <button
                                onClick={addSubject}
                                className="flex items-center text-blue-600 hover:underline"
                            >
                                <AiOutlinePlus className="mr-1"/> Add Subject
                            </button>
                        </h3>
                        {batchData.subject.map((subj, subjIdx) => (
                            <div
                                key={subjIdx}
                                className="border p-4 rounded-lg mb-4 bg-gray-50 space-y-4 relative"
                            >
                                <button
                                    onClick={() => removeSubject(subjIdx)}
                                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                    disabled={batchData.subject.length === 1}
                                    title="Remove Subject"
                                >
                                    <AiOutlineMinus size={20}/>
                                </button>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Subject Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={subj.name}
                                        onChange={(e) => handleSubjectChange(subjIdx, e)}
                                        className="w-full border rounded-lg px-3 py-2"
                                    />
                                </div>
                                {subj.classSchedule.map((schedule, schedIdx) => (
                                    <div key={schedIdx} className="border-t pt-4">
                                        <label className="block text-sm font-medium mb-1">Class Time *</label>
                                        <input
                                            type="time"
                                            name="time"
                                            value={schedule.time}
                                            onChange={(e) => handleScheduleChange(subjIdx, schedIdx, e)}
                                            className="w-full border rounded-lg px-3 py-2 mb-3"
                                        />
                                        <label className="block text-sm font-medium mb-1">Days *</label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                            {daysOfWeek.map(day => (
                                                <label key={day} className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        name="days"
                                                        value={day}
                                                        checked={schedule.days.includes(day)}
                                                        onChange={(e) =>
                                                            handleScheduleChange(subjIdx, schedIdx, e)
                                                        }
                                                    />
                                                    <span className="text-sm">{day}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end p-4 border-t">
                    <button
                        onClick={handleSubmit}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        Create Batch
                    </button>
                </div>
            </div>
        </div>

    )
}
export default ViewBatchDetails