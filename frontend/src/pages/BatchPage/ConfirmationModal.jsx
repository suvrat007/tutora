import {AiOutlineClose} from "react-icons/ai";

const ConfirmationModal = ({onClose,closeModal}) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-900">
                        Do you want to DELETE data of enrolled students
                    </h2>
                    <button onClick={()=> closeModal()}
                            className="text-gray-500 hover:text-red-500 transition-colors duration-200">
                        <AiOutlineClose size={24}/>
                    </button>
                </div>
                <div className="flex justify-around py-6">
                    <button
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                        onClick={() => onClose(true)}  // Yes → delete students
                    >
                        Yes
                    </button>
                    <button
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                        onClick={() => onClose(false)} // No → skip students
                    >
                        No
                    </button>
                </div>

            </div>
        </div>
    )
}
export default ConfirmationModal;