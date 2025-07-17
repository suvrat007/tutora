import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axiosInstance from "@/utilities/axiosInstance";
import CreateEditBatch from "./CreateEditBatch.jsx";
import ViewBatchDetails from "./ViewBatchDetails.jsx";
import ConfirmationModal from "./ConfirmationModal.jsx";
import useFetchBatches from "@/pages/useFetchBatches.js";
import { addBatches } from "@/utilities/redux/batchSlice.js";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button.jsx";

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

      toast.success("Batch successfully deleted.");
      await fetchBatches();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong during deletion.");
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
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
  );

  const CreateBatchCard = () => (
      <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => !isLoading && setCreateBatches(true)}
          className={`flex flex-col justify-center items-center rounded-xl border-2 border-dashed border-border bg-background hover:bg-accent-light transition-colors cursor-pointer p-6 ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
      >
        <div className="text-4xl text-text-light mb-2">+</div>
        <span className="text-xl text-text-light font-medium">Create New Batch</span>
      </motion.div>
  );

  const BatchCard = ({ batch }) => {
    const studentCount = groupedStudents.find((g) => g.batchId === batch._id)?.students?.length || 0;

    const infoSections = [
      { title: "Grade", value: batch.forStandard ?? "N/A" },
      { title: "Total Students", value: studentCount },
      { title: "Total Subjects", value: batch.subject?.length ?? 0 },
    ];

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="rounded-xl bg-white border border-border shadow-soft hover:shadow-medium transition-shadow flex flex-col"
        >
            <div className="border-b border-border px-4 py-3 bg-background rounded-t-xl">
                <h3 className="text-center font-semibold text-lg text-text truncate" title={batch.name}>
                    {batch.name}
                </h3>
            </div>

            <div className="flex-1 p-4 flex flex-col justify-between">
                <div className="space-y-3">
                    {infoSections.map((item, i) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-background rounded-lg">
                            <span className="text-sm text-text-light">{item.title}</span>
                            <span className="font-semibold text-text">{item.value}</span>
                        </div>
                    ))}
                </div>

                <div className="flex gap-2 mt-4">
                    <Button
                        size="sm"
                        variant="outline"
                        disabled={isLoading}
                        onClick={() => {
                            const studentsForBatch = groupedStudents.find((g) => g.batchId === batch._id)?.students || [];
                            handleViewDetails(batch, studentsForBatch);
                        }}
                        className="flex-1"
                    >
                        View Details
                    </Button>
                    <Button
                        size="sm"
                        variant="destructive"
                        disabled={isLoading}
                        onClick={() => setBatchToDelete(batch._id)}
                        className="flex-1"
                    >
                        Delete
                    </Button>
                </div>
            </div>
        </motion.div>
    );
  };

  const ModalBackdrop = ({ onClose, children }) => (
      <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={onClose}
      >
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={(e) => e.stopPropagation()}>
              {children}
          </motion.div>
      </motion.div>
  );

  const MainContent = () => (
      <div className="p-6 bg-white h-full overflow-y-auto rounded-2xl border border-border">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text mb-2">
            Batch Management
          </h1>
          <p className="text-text-light">
            {adminData?.institute_info?.name || "Institute"}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <CreateBatchCard />
          <AnimatePresence>
              {batches.map((batch) => (
                  <BatchCard key={batch._id} batch={batch} />
              ))}
          </AnimatePresence>
        </div>

        {batches.length === 0 && (
            <div className="text-center py-12">
              <div className="text-text-light text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-text-light mb-2">No batches yet</h3>
              <p className="text-text-light">Create your first batch to get started</p>
            </div>
        )}
      </div>
  );

  return (
      <div className="relative h-full overflow-y-auto p-5 bg-background">
        <AnimatePresence mode="wait">
          {viewDetails.display ? (
              <motion.div key="details" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ViewBatchDetails
                      viewDetails={viewDetails}
                      setViewDetails={setViewDetails}
                      setRerender={setRerender}
                      onClose={closeViewDetails}
                  />
              </motion.div>
          ) : (
              <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <MainContent />
              </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
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
              <ModalBackdrop onClose={() => setBatchToDelete(null)}>
                  <ConfirmationModal
                      closeModal={() => setBatchToDelete(null)}
                      setRerender={setRerender}
                      onClose={(shouldDeleteStudents) => handleDelete(batchToDelete, shouldDeleteStudents)}
                  />
              </ModalBackdrop>
          )}
        </AnimatePresence>

        {isLoading && <LoadingSpinner />}
      </div>
  );
};

export default BatchPage;