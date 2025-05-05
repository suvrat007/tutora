import SideBar from "../Navbar/SideBar.jsx";
import Navbar from "../Navbar/Navbar.jsx";

const BatchPage = () => {


    return (
        <div className="flex h-screen ">
            <SideBar />
            <div className="flex flex-col w-full overflow-hidden">
                <Navbar />
                {/* Main Container */}
                <div className="h-full m-2 rounded-xl border-2 shadow-md overflow-hidden flex flex-col">
                    {/* Heading */}
                    <div className="w-full h-20 flex justify-center items-center border-b border-gray-200">
                        <h1 className="text-3xl font-semibold text-gray-700">All Batches in ORG NAME</h1>
                    </div>
                    {/* Batch Cards */}
                    <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-white cursor-pointer rounded-lg shadow hover:shadow-lg transition-shadow flex flex-col justify-center items-center border-2 border-dashed border-gray-300">
                            <span className={'text-xl'}>Create New Batch</span>
                        </div>

                        {[1, 2, 3, 4, 5].map((value, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow flex flex-col border border-gray-200"
                            >
                                {/* Batch Name */}
                                <div className="border-b border-gray-200 py-4 flex justify-center items-center">
                                    <h2 className="text-xl font-medium text-gray-800">BatchName {value}</h2>
                                </div>
                                {/* Batch Info */}
                                <div className="flex-1 grid grid-cols-1 gap-2 p-4 ">
                                    {["Grade", "Total Students", "Total Subjects", "Total Classes"].map((item, subIndex) => (
                                        <div
                                            key={subIndex}
                                            className="flex justify-between items-center border rounded-md p-3 bg-gray-50"
                                        >
                                            <span className="text-gray-600">{item}</span>
                                            <span className="font-semibold text-gray-800">10</span>
                                        </div>
                                    ))}
                                    <div className={'flex flex-col justify-center items-center '}>
                                        <button className={'py-2 px-1 rounded-lg cursor-pointer border-2 w-[40%]'}>View Details</button>
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BatchPage;
