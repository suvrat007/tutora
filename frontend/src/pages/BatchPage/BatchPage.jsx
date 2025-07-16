import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axiosInstance from "@/utilities/axiosInstance";
import CreateEditBatch from "./CreateEditBatch.jsx";
import ViewBatchDetails from "./ViewBatchDetails.jsx";
import ConfirmationModal from "./ConfirmationModal.jsx";
import useFetchBatches from "@/pages/useFetchBatches.js";
import { addBatches } from "@/utilities/redux/batchSlice.js";
import WrapperCard from "@/utilities/WrapperCard.jsx";

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
    fetchBatches();
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
      alert(error?.response?.data?.message || "Something went wrong during deletion.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (batch, studentsForBatch) => {
    setViewDetails({ display: true, batch, studentsForBatch });
  };

  const handleBatchUpdated = (updatedBatch) => {
    dispatch(addBatches(batches.map((b) => (b._id === updatedBatch._id ? updatedBatch : b))));
  };

  const closeViewDetails = () => {
    setViewDetails({ display: false, batch: null });
  };

  const LoadingSpinner = () => (
      <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
  );

  const CreateBatchCard = () => (
      <div
          onClick={() => !isLoading && setCreateBatches(true)}
          className={` flex flex-col justify-center items-center rounded-xl border-2 border-dashed border-gray-300 bg-white hover:bg-gray-50 transition-colors cursor-pointer ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
      >
        <div className="text-4xl text-gray-400 mb-2">+</div>
        <span className="text-xl text-gray-500 font-medium">Create New Batch</span>
      </div>
  );

  const BatchCard = ({ batch }) => {
    const studentCount = groupedStudents.find((g) => g.batchId === batch._id)?.students?.length || 0;

    const infoSections = [
      { title: "Grade", value: batch.forStandard ?? "N/A" },
      { title: "Total Students", value: studentCount },
      { title: "Total Subjects", value: batch.subject?.length ?? 0 },
    ];

    return (
        <div className=" rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
          <div className="border-b px-4 py-3 bg-gray-50 rounded-t-xl">
            <h3 className="text-center font-semibold text-lg text-gray-800 truncate" title={batch.name}>
              {batch.name}
            </h3>
          </div>

          <div className="flex-1 p-4 flex flex-col justify-between">
            <div className="space-y-3">
              {infoSections.map((item, i) => (
                  <div
                      key={i}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm text-gray-600">{item.title}</span>
                    <span className="font-semibold text-gray-800">{item.value}</span>
                  </div>
              ))}
            </div>

            <div className="flex gap-2 mt-4">
              <button
                  disabled={isLoading}
                  onClick={() => {
                    const studentsForBatch = groupedStudents.find((g) => g.batchId === batch._id)?.students || [];
                    handleViewDetails(batch, studentsForBatch);
                  }}
                  className="flex-1 py-2 px-3 text-sm border border-blue-500 text-blue-500 rounded-md hover:bg-blue-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                View Details
              </button>
              <button
                  disabled={isLoading}
                  onClick={() => setBatchToDelete(batch._id)}
                  className="flex-1 py-2 px-3 text-sm border border-red-500 text-red-500 rounded-md hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
    );
  };

  const ModalBackdrop = ({ onClose, children }) => (
      <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={onClose}
      >
        <div onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      </div>
  );

  const MainContent = () => (
      <div className="p-6 bg-white h-full overflow-y-auto rounded-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Batch Management
          </h1>
          <p className="text-gray-600">
            {adminData?.institute_info?.name || "Institute"}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <CreateBatchCard />
          {batches.map((batch) => (
              <BatchCard key={batch._id} batch={batch} />
          ))}
        </div>

        {batches.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No batches yet</h3>
              <p className="text-gray-500">Create your first batch to get started</p>
            </div>
        )}
      </div>
  );

  return (
      <div className="relative h-full overflow-y-auto p-5">
        <WrapperCard>
          {viewDetails.display ? (
              <ViewBatchDetails
                  viewDetails={viewDetails}
                  setViewDetails={setViewDetails}
                  setRerender={setRerender}
                  onClose={closeViewDetails}
              />
          ) : (
              <MainContent />
          )}
        </WrapperCard>

        {createBatches && (
            <ModalBackdrop onClose={() => setCreateBatches(false)}>
              <CreateEditBatch
                  onClose={() => setCreateBatches(false)}
                  handleBatchUpdated={handleBatchUpdated}
                  batchToEdit={null}
              />
            </ModalBackdrop>
        )}

        {batchToDelete && (
            <ConfirmationModal
                closeModal={() => setBatchToDelete(null)}
                setRerender={setRerender}
                onClose={(shouldDeleteStudents) => handleDelete(batchToDelete, shouldDeleteStudents)}
            />
        )}

        {isLoading && <LoadingSpinner />}
      </div>
  );
};

export default BatchPage;