import {AiOutlineClose, AiOutlineEdit} from "react-icons/ai";
import {useState} from "react";
import AddStudent from "./AddStudent.jsx";

const StdDataDisplay = ({ seeStdDetails, setSeeStdDetails, onStudentEdited }) => {
    const [edit, setEdit] = useState(false);

    const handleStudentAdded = () => {
        console.log("Student was added or edited!");
        onStudentEdited();
    };

    return (
        <div className="border-2 rounded-2xl overflow-y-scroll">
            {edit && (
                <AddStudent
                    batchId={seeStdDetails._id}
                    existingStudentData={seeStdDetails.stdDetails}
                    isEditMode={edit}
                    setEdit={setEdit}
                    setShowAddStd={() => setSeeStdDetails({ ...seeStdDetails, show: false })}
                    onStudentAdded={handleStudentAdded}
                />
            )}
            <div className="flex justify-between p-1">
                <button
                    onClick={() => setEdit(true)}
                    className="text-gray-500 hover:text-green-500 w-2 transition left-0 ml-2 mt-2"
                >
                    <AiOutlineEdit size={24}/>
                </button>
                <button
                    onClick={() => setSeeStdDetails(prev=>!prev)}
                    className="text-gray-500 hover:text-red-500 w-2 transition left-0 mr-2 mt-2"
                >
                    <AiOutlineClose size={24}/>
                </button>
            </div>
            <div className="flex flex-col items-center text-center gap-2 p-2 border-b break-words">
                <img
                    src="https://images.icon-icons.com/1378/PNG/512/avatardefault_92824.png"
                    alt="Student Avatar"
                    className="w-24 h-24 rounded-full object-cover border shadow"
                />
                <h2 className="text-2xl font-semibold">
                    {seeStdDetails.stdDetails.name || 'Unnamed Student'}
                </h2>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-700 w-full">
                    <span className="font-medium">School:</span>
                    <span>{seeStdDetails.stdDetails.school_name || 'N/A'}</span>
                    <span className="font-medium">Grade:</span>
                    <span>{seeStdDetails.stdDetails.grade || 'N/A'}</span>
                    <span className="font-medium">Admission Date:</span>
                    <span>{seeStdDetails.stdDetails.admission_date || 'N/A'}</span>
                    <span className="font-medium">Email:</span>
                    <span>{seeStdDetails.stdDetails.contact_info.emailIds.student || 'N/A'}</span>
                    <span className="font-medium">Phone No.:</span>
                    <span>{seeStdDetails.stdDetails.contact_info.phoneNumbers.student || 'N/A'}</span>
                    <span className="font-medium">Address:</span>
                    <span>{seeStdDetails.stdDetails.address || 'N/A'}</span>
                </div>
            </div>
            <div className="gap-2 p-3 break-words">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Parent Details</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-700">
                    <span className="font-medium">Father's Phone:</span>
                    <span>{seeStdDetails.stdDetails.contact_info.phoneNumbers.dad || 'N/A'}</span>
                    <span className="font-medium">Father's Email:</span>
                    <span>{seeStdDetails.stdDetails.contact_info.emailIds.dad || 'N/A'}</span>
                    <span className="font-medium">Mother's Phone:</span>
                    <span>{seeStdDetails.stdDetails.contact_info.phoneNumbers.mom || 'N/A'}</span>
                    <span className="font-medium">Mother's Email:</span>
                    <span>{seeStdDetails.stdDetails.contact_info.emailIds.mom || 'N/A'}</span>
                </div>
            </div>
        </div>
    );
};

export default StdDataDisplay;