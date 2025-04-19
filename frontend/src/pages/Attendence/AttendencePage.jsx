import SideBar from "../Navbar/SideBar.jsx";
import Navbar from "../Navbar/Navbar.jsx";

const AttendencePage = () => {
    return (
        <div className="flex h-screen ">
            {/* Sidebar */}
            <div className="">
                <SideBar />
            </div>

            {/* Main Content */}
            <div className="flex flex-col w-full overflow-hidden">
                {/* Navbar */}
                <div className="flex-shrink-0">
                    <Navbar />
                </div>

                {/* Main Body */}
                <div className="flex flex-col gap-4 m-2 overflow-hidden flex-1 justify-between items-center">
                    {/* Upper Half */}
                    <div className="flex gap-4 w-[75%] p-4 border-2 rounded-2xl">
                        {/* Attendance % Box */}
                        <div className="flex flex-col border-2 rounded-2xl flex-1 w-1/2">
                            <p className="text-xl mt-3 ml-3">
                                Student's Attendance Percentage Till Date:
                            </p>
                            <div className="flex flex-col items-center justify-center flex-1">
                                <h1 className="text-[5em] p-10 border-2 rounded-[50%] m-2">
                                    100%
                                </h1>
                            </div>
                        </div>

                        {/* Inputs */}
                        <div className="flex flex-col gap-5 w-1/2 justify-between">
                            <input
                                type="text"
                                placeholder="Enter Batch"
                                className="border-2 rounded-2xl h-1/3 text-xl p-2"
                            />
                            <input
                                type="text"
                                placeholder="Enter Subject"
                                className="border-2 rounded-2xl h-1/3 text-xl p-2"
                            />
                            <input
                                type="text"
                                placeholder="Enter Date"
                                className="border-2 rounded-2xl h-1/3 text-xl p-2"
                            />
                        </div>
                    </div>

                    {/* Lower Half */}
                    <div className="flex px-4 pb-1 w-full flex-1 overflow-hidden">
                        {/* All Students */}
                        <div className="flex flex-col w-1/2 border-2 rounded-l-xl overflow-hidden">
                            <div className="p-4 border-b-2">
                                <h2 className="text-lg font-semibold">All Students in Batch</h2>
                            </div>
                            <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-3">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((_, i) => (
                                    <div
                                        key={i}
                                        className="border p-3 rounded-lg flex justify-between items-center"
                                    >
                                        <span className="font-medium">{i + 1}.</span>
                                        <span className="flex-1 ml-3">Suvrat</span>
                                        <span className="text-green-600 font-semibold">Present</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Present Students */}
                        <div className="flex flex-col w-1/2 border-2 rounded-r-xl overflow-hidden">
                            <div className="p-4 border-b-2">
                                <h2 className="text-lg font-semibold">
                                    Students Present on Date:
                                </h2>
                            </div>
                            <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-3">
                                {[1, 2, 3, 4, 5, 6].map((_, i) => (
                                    <div
                                        key={i}
                                        className="border p-3 rounded-lg flex justify-between items-center"
                                    >
                                        <span className="font-medium">{i + 1}.</span>
                                        <span className="flex-1 ml-3">Suvrat</span>
                                        <span className="text-green-600 font-semibold">Present</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendencePage;
