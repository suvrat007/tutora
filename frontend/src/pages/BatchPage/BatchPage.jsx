import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axiosInstance from "@/utilities/axiosInstance";
import SideBar from "../Navbar/SideBar.jsx";
import Navbar from "../Navbar/Navbar.jsx";
import CreateEditBatch from "./CreateEditBatch.jsx";
import ViewBatchDetails from "./ViewBatchDetails.jsx";
import ConfirmationModal from "./ConfirmationModal.jsx";
import useFetchBatches from "@/pages/useFetchBatches.js";
import { addBatches } from "@/utilities/redux/batchSlice.jsx";

const WrapperCard = ({ children }) => (
    <div className="relative bg-[#f3d8b6] rounded-3xl shadow-lg p-2 flex flex-1 justify-center items-center">
      <div className="w-full h-full">{children}</div>
    </div>
);

const BatchPage = () => {
  const [createBatches, setCreateBatches] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState(null);
  const [viewDetails, setViewDetails] = useState({ display: false, batch: null });
  const [isLoading, setIsLoading] = useState(false);
  const [rerender, setRerender] = useState(false);

  const adminData = useSelector((state) => state.user);
  const batches = useSelector((state) => state.batches);
  const groupedStudents = useSelector((state) => state.students.groupedStudents);

  const dispatch = useDispatch();
  const fetchBatches = useFetchBatches();

  useEffect(() => {
    const getAllBatches = async () => {
      await fetchBatches();
    };
    getAllBatches();
  }, [rerender]);

  const handleDelete = async (id, shouldDeleteStudents) => {
    setBatchToDelete(null);
    setIsLoading(true);
    try {
      const response = await axiosInstance.delete(`/api/batch/delete-batch/${id}`, {
        data: { shouldDeleteStudents },
        withCredentials: true,
      });

      if (response.status !== 200) throw new Error("Failed to delete the batch");

      alert("Batch successfully deleted.");
      await fetchBatches();
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Something went wrong during deletion.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (batch,studentsForBatch) => {
    setViewDetails({ display: true, batch ,studentsForBatch});
  };

  const handleBatchUpdated = (updatedBatch) => {
    dispatch(
        addBatches(batches.map((b) => (b._id === updatedBatch._id ? updatedBatch : b)))
    );
  };

  return (
      <>
        <>
          <div className="flex flex-col gap-6 p-6 flex-1 overflow-hidden">
            {viewDetails.display ? (
                <div onClick={() => setViewDetails({display: false, batch: null})}>
                  <div onClick={(e) => e.stopPropagation()}>
                    <ViewBatchDetails
                        viewDetails={viewDetails}
                        setViewDetails={setViewDetails}
                        setRerender={setRerender}
                    />
                  </div>
                </div>
            ) : (
                <WrapperCard>
                  <div className="w-full p-4 bg-white rounded-2xl shadow-md">
                    <h1 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
                      All Batches in {adminData?.institute_info?.name}
                    </h1>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div
                          onClick={() => !isLoading && setCreateBatches(true)}
                          className={`h-80 cursor-pointer rounded-lg shadow hover:shadow-lg transition-shadow flex flex-col justify-center items-center border-2 border-dashed border-gray-300 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <span className="text-xl text-gray-500">+ Create New Batch</span>
                      </div>

                      {batches.map((batch) => {
                        const studentCount =
                            groupedStudents.find((g) => g.batchId === batch._id)?.students?.length || 0;

                        const infoSections = [
                          {title: "Grade", value: batch.forStandard ?? "N/A"},
                          {title: "Total Students", value: studentCount},
                          {title: "Total Subjects", value: batch.subject?.length ?? 0},
                        ];

                        return (
                            <div
                                key={batch._id}
                                className="h-80 rounded-lg shadow hover:shadow-lg transition-shadow flex flex-col border border-gray-200"
                            >
                              <div className="border-b border-gray-200 py-4 flex justify-center items-center">
                                <h2 className="text-xl font-medium text-gray-800">{batch.name}</h2>
                              </div>
                              <div className="flex-1 flex flex-col justify-between p-4">
                                <div className="space-y-2">
                                  {infoSections.map((item, i) => (
                                      <div
                                          key={i}
                                          className="flex justify-between items-center border rounded-md p-3 bg-gray-50"
                                      >
                                        <span className="text-gray-600">{item.title}</span>
                                        <span className="font-semibold text-gray-800">{item.value}</span>
                                      </div>
                                  ))}
                                </div>
                                <div className="mt-4 flex justify-center gap-3">
                                  <button
                                      className={`py-2 px-4 rounded-lg border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition-all ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                      disabled={isLoading}

                                      onClick={() => {
                                        const studentsForBatch = groupedStudents.find(g => g.batchId === batch._id)?.students || [];
                                        handleViewDetails(batch, studentsForBatch);
                                      }}
                                  >
                                    View Details
                                  </button>
                                  <button
                                      onClick={() => setBatchToDelete(batch._id)}
                                      disabled={isLoading}
                                      className={`py-2 px-4 rounded-lg border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                  >
                                    Delete Batch
                                  </button>
                                </div>
                              </div>
                            </div>
                        );
                      })}
                    </div>
                  </div>
                </WrapperCard>
            )}
          </div>
        </>
        {createBatches && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
                 onClick={() => setCreateBatches(false)}>
              <div onClick={(e) => e.stopPropagation()}>
                <CreateEditBatch
                    onClose={() => setCreateBatches(false)}
                    handleBatchUpdated={handleBatchUpdated}
                    batchToEdit={null}
                />
              </div>
            </div>
        )}

        {batchToDelete && (
            <ConfirmationModal
                closeModal={() => setBatchToDelete(null)}
                setRerender={setRerender}
                onClose={(shouldDeleteStudents) => handleDelete(batchToDelete, shouldDeleteStudents)}
            />
        )}

        {isLoading && (
            <div className="absolute inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
              <div
                  className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )}

      </>


  );
};

export default BatchPage;
