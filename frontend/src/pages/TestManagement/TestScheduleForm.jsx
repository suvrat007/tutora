import axiosInstance from '../../utilities/axiosInstance';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useForm } from './hooks/useForm';
import { API, TEST_STATUS } from '../../utilities/constants';
import toast from 'react-hot-toast';

const selectClass = "w-full px-3 py-2 border border-[#e6c8a8] rounded-lg bg-white text-sm text-[#5a4a3c] focus:outline-none focus:ring-2 focus:ring-[#e0c4a8]";

const TestScheduleForm = ({ batches, editingTest, setEditingTest, fetchTests, showTitle = true }) => {
    const initialState = editingTest
        ? {
            testName: editingTest.testName || '',
            maxMarks: editingTest.maxMarks || '',
            passMarks: editingTest.passMarks || '',
            testDate: new Date(editingTest.testDate).toISOString().slice(0, 16) || '',
            batchId: editingTest.batchId || '',
            subjectId: editingTest.subjectId || '',
            status: editingTest.status || TEST_STATUS.SCHEDULED,
            cancellationReason: editingTest.cancellationReason || ''
        }
        : {
            testName: '',
            maxMarks: '',
            passMarks: '',
            testDate: '',
            batchId: '',
            subjectId: '',
            status: TEST_STATUS.SCHEDULED,
            cancellationReason: ''
        };

    const { formData, register, handleSubmit, reset } = useForm(initialState);

    const onSubmit = async (data) => {
        if (data.status === TEST_STATUS.CANCELLED && !data.cancellationReason) {
            toast.error('Cancellation reason is required');
            return;
        }
        try {
            if (editingTest) {
                await axiosInstance.put(API.UPDATE_TEST(editingTest._id), {
                    testName: data.testName,
                    batchId: data.batchId,
                    subjectId: data.subjectId || null,
                    maxMarks: data.maxMarks,
                    passMarks: data.passMarks || 0,
                    testDate: data.testDate,
                    status: data.status,
                    cancellationReason: data.cancellationReason
                });
                setEditingTest(null);
                toast.success('Test updated');
            } else {
                await axiosInstance.post(API.CREATE_TEST, {
                    ...data,
                    subjectId: data.subjectId || null,
                    studentResults: []
                });
                toast.success('Test scheduled');
            }
            reset();
            fetchTests(data.batchId);
        } catch (error) {
            console.error('Failed to save test', error);
            toast.error('Failed to save test');
        }
    };

    const selectedBatch = batches.find(b => b._id === formData.batchId);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
            {showTitle && (
                <h2 className="text-base font-bold text-[#5a4a3c]">
                    {editingTest ? 'Update Test' : 'Schedule a New Test'}
                </h2>
            )}
            <Input
                {...register('testName')}
                placeholder="Test Name"
                className="border-[#e6c8a8] bg-white focus:ring-[#e0c4a8] text-[#5a4a3c]"
            />
            <div className="grid grid-cols-2 gap-3">
                <Input
                    {...register('maxMarks')}
                    type="number"
                    placeholder="Max Marks"
                    className="border-[#e6c8a8] bg-white focus:ring-[#e0c4a8] text-[#5a4a3c]"
                />
                <Input
                    {...register('passMarks')}
                    type="number"
                    placeholder="Pass Marks (opt.)"
                    className="border-[#e6c8a8] bg-white focus:ring-[#e0c4a8] text-[#5a4a3c]"
                />
            </div>
            <Input
                {...register('testDate')}
                type="datetime-local"
                className="border-[#e6c8a8] bg-white focus:ring-[#e0c4a8] text-[#5a4a3c]"
            />
            <select {...register('batchId')} className={selectClass}>
                <option value="">Select Batch</option>
                {batches.map(batch => (
                    <option key={batch._id} value={batch._id}>{batch.name}</option>
                ))}
            </select>
            <select {...register('subjectId')} className={selectClass}>
                <option value="">No Subject (Optional)</option>
                {selectedBatch?.subject.map(subject => (
                    <option key={subject._id} value={subject._id}>{subject.name}</option>
                ))}
            </select>
            <select {...register('status')} className={selectClass}>
                <option value={TEST_STATUS.SCHEDULED}>Scheduled</option>
                <option value={TEST_STATUS.COMPLETED}>Completed</option>
                <option value={TEST_STATUS.CANCELLED}>Cancelled</option>
            </select>
            {formData.status === TEST_STATUS.CANCELLED && (
                <Input
                    {...register('cancellationReason')}
                    placeholder="Cancellation Reason"
                    className="border-[#e6c8a8] bg-white focus:ring-[#e0c4a8] text-[#5a4a3c]"
                />
            )}
            <div className="flex gap-2 mt-1">
                <Button type="submit" className="bg-[#8b5e3c] text-white hover:bg-[#7a4f2f] border-0 flex-1">
                    {editingTest ? 'Update Test' : 'Schedule Test'}
                </Button>
                {editingTest && (
                    <Button
                        type="button"
                        onClick={() => setEditingTest(null)}
                        className="bg-[#e0c4a8] text-[#5a4a3c] hover:bg-[#d8bca0] border-0"
                    >
                        Cancel
                    </Button>
                )}
            </div>
        </form>
    );
};

export default TestScheduleForm;
