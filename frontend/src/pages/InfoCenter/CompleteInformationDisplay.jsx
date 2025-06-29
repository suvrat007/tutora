import Navbar from "../Navbar/Navbar.jsx";
import SideBar from "../Navbar/SideBar.jsx";
import Card from "../Dashboard/comps/uii/Card.jsx";
import { FaUser } from "react-icons/fa";

const WrapperCard = ({ children }) => (
  <div className="relative bg-[#f3d8b6] rounded-3xl shadow-lg p-2 flex flex-1 justify-center items-center">
    <div className="w-full h-full">{children}</div>
  </div>
);

const CompleteInformationDisplay = () => {
  return (
    <div className="min-h-screen w-screen bg-[#d3a781] text-white flex justify-center items-start overflow-hidden">
      {/* Outer Big Rounded Card */}
      <div className="bg-[#fee5cf] relative w-full min-h-[95vh] rounded-[2rem] border border-[#e0b890] shadow-2xl overflow-hidden flex mx-2 my-4">
        
        {/* Sidebar */}
        <SideBar />

        {/* Main Content */}
        <div className="flex flex-col w-full overflow-hidden">
          <Navbar />

          {/* Content Area */}
          <div className="flex flex-col gap-6 p-6 flex-1 overflow-hidden">
            {/* Top Row */}
            <div className="flex gap-6 flex-1">
              <WrapperCard>
                <Card className="w-full h-full bg-white text-gray-800 p-6 rounded-2xl flex items-start">
                  <p className="font-medium">Panel 1</p>
                </Card>
              </WrapperCard>

              <WrapperCard>
                <Card className="w-full h-full bg-white text-gray-800 p-6 rounded-2xl flex items-start">
                  <p className="font-medium">Panel 2</p>
                </Card>
              </WrapperCard>

              <WrapperCard>
                <Card className="w-full h-full bg-white p-6 rounded-2xl flex justify-center items-center">
                  <div className="w-24 h-24 border-2 border-purple-300 rounded-full flex justify-center items-center">
                    <FaUser className="text-purple-600 text-3xl" />
                  </div>
                </Card>
              </WrapperCard>
            </div>

            {/* Bottom Row */}
            <div className="flex gap-6 flex-1">
              <WrapperCard>
                <Card className="w-full h-full bg-white text-gray-800 p-6 rounded-2xl">
                  <h2 className="text-lg font-semibold mb-2">Attendance Percentage</h2>
                  <p className="text-sm text-gray-600">/* Add percentage logic here */</p>
                </Card>
              </WrapperCard>

              <WrapperCard>
                <Card className="w-full h-full bg-white text-gray-800 p-6 overflow-x-auto rounded-2xl">
                  <h2 className="text-lg font-semibold mb-4">Attendance Table</h2>
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b text-gray-600">
                        <th className="p-2">Dates</th>
                        <th className="p-2">Subject</th>
                        <th className="p-2">Status</th>
                        <th className="p-2">Order By</th>
                        <th className="p-2">Filter By</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="p-2">01/05/25</td>
                        <td className="p-2">Math</td>
                        <td className="p-2">Present</td>
                        <td className="p-2">
                          <select className="border rounded px-2 py-1 text-sm text-gray-700">
                            <option>Present</option>
                            <option>Absent</option>
                          </select>
                        </td>
                        <td className="p-2">
                          <select className="border rounded px-2 py-1 text-sm text-gray-700">
                            <option>Presence</option>
                            <option>Absence</option>
                          </select>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </Card>
              </WrapperCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteInformationDisplay;
