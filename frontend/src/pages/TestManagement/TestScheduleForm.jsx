import { useState } from 'react';
import axiosInstance from '../../utilities/axiosInstance';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useForm } from './hooks/useForm';
import { API, TEST_STATUS } from '../../utilities/constants';
import { mergeTests, setTests } from '../../utilities/redux/testSlice';
import { useDispatch } from 'react-redux';
import { toDatetimeLocalString } from '../../utilities/dateUtils';
import toast from 'react-hot-toast';
import Dropdown from '@/components/ui/Dropdown';

const TestScheduleForm = ({ batches, editingTest, setEditingTest, fetchTests, showTitle = true }) => {
    const [formError, setFormError] = useState(null);
    const dispatch = useDispatch();

    const initialState = editingTest
        ? {
            testName: editingTest.testName || '',
            maxMarks: editingTest.maxMarks || '',
            passMarks: editingTest.passMarks || '',
            // toDatetimeLocalString uses local time; toISOString would give UTC causing wrong display
            testDate: toDatetimeLocalString(editingTest.testDate),
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

    const isAllBatches = formData.batchId === 'all';

    const onSubmit = async (data) => {
        setFormError(null);
        if (data.status === TEST_STATUS.CANCELLED && !data.cancellationReason) {
            toast.error('Cancellation reason is required');
            return;
        }
        try {
            if (editingTest) {
                if (editingTest.groupId) {
                    // Update all tests in the group
                    const res = await axiosInstance.put(API.UPDATE_GROUP_TEST(editingTest.groupId), {
                        testName: data.testName,
                        maxMarks: Number(data.maxMarks),
                        passMarks: Number(data.passMarks) || 0,
                        testDate: new Date(data.testDate),
                        status: data.status,
                        cancellationReason: data.cancellationReason,
                    });
                    dispatch(mergeTests(res.data.tests));
                } else {
                    await axiosInstance.put(API.UPDATE_TEST(editingTest._id), {
                        testName: data.testName,
                        batchId: data.batchId,
                        subjectId: data.subjectId || null,
                        maxMarks: Number(data.maxMarks),
                        passMarks: Number(data.passMarks) || 0,
                        testDate: new Date(data.testDate),
                        status: data.status,
                        cancellationReason: data.cancellationReason,
                    });
                    fetchTests(data.batchId);
                }
                setEditingTest(null);
                toast.success('Test updated');
                reset();
            } else {
                const batchIds = data.batchId === 'all'
                    ? batches.map(b => b._id)
                    : [data.batchId || null];

                const groupId = data.batchId === 'all'
                    ? `grp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`
                    : undefined;

                await Promise.all(batchIds.map(bid =>
                    axiosInstance.post(API.CREATE_TEST, {
                        testName: data.testName,
                        batchId: bid,
                        subjectId: data.batchId === 'all' ? null : (data.subjectId || null),
                        maxMarks: Number(data.maxMarks),
                        passMarks: Number(data.passMarks) || 0,
                        testDate: new Date(data.testDate),
                        status: data.status,
                        cancellationReason: data.cancellationReason,
                        studentResults: [],
                        groupId,
                    })
                ));

                toast.success(
                    data.batchId === 'all'
                        ? `Test scheduled for all ${batches.length} batches`
                        : 'Test scheduled'
                );
                reset();
                fetchTests(data.batchId === 'all' ? '' : data.batchId);
            }
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to save test. Please try again.';
            setFormError(msg);
            toast.error(msg);
        }
    };

    const selectedBatch = isAllBatches ? null : batches.find(b => b._id === formData.batchId);
    const isFutureTest = formData.testDate && new Date(formData.testDate) > new Date();

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
                className="rounded-full border-[#e6c8a8] bg-white focus:ring-[#e0c4a8] text-[#5a4a3c]"
            />
            <div className="grid grid-cols-2 gap-3">
                <Input
                    {...register('maxMarks')}
                    type="number"
                    placeholder="Max Marks"
                    className="rounded-full border-[#e6c8a8] bg-white focus:ring-[#e0c4a8] text-[#5a4a3c]"
                />
                <Input
                    {...register('passMarks')}
                    type="number"
                    placeholder="Pass Marks (opt.)"
                    className="rounded-full border-[#e6c8a8] bg-white focus:ring-[#e0c4a8] text-[#5a4a3c]"
                />
            </div>
            <Input
                {...register('testDate')}
                type="datetime-local"
                className="rounded-full border-[#e6c8a8] bg-white focus:ring-[#e0c4a8] text-[#5a4a3c]"
            />
            <Dropdown 
                {...register('batchId')} 
                placeholder="Select Batch"
                options={[
                    ...(!editingTest ? [{ label: 'All Batches', value: 'all' }] : []),
                    ...batches.map(b => ({ label: b.name, value: b._id }))
                ]}
            />
            {isAllBatches ? (
                <p className="text-xs text-[#b0998a] px-1">
                    Subject selection is per-batch — not available when scheduling for all batches.
                </p>
            ) : (
                <Dropdown 
                    {...register('subjectId')} 
                    placeholder="No Subject (Optional)"
                    options={(selectedBatch?.subject || []).map(s => ({ label: s.name, value: s._id }))}
                />
            )}
            <Dropdown 
                {...register('status')} 
                placeholder="Status"
                options={[
                    { label: 'Scheduled', value: TEST_STATUS.SCHEDULED },
                    { label: `Completed${isFutureTest ? ' (date not yet reached)' : ''}`, value: TEST_STATUS.COMPLETED },
                    { label: 'Cancelled', value: TEST_STATUS.CANCELLED }
                ]}
            />
            {formData.status === TEST_STATUS.CANCELLED && (
                <Input
                    {...register('cancellationReason')}
                    placeholder="Cancellation Reason"
                    className="rounded-full border-[#e6c8a8] bg-white focus:ring-[#e0c4a8] text-[#5a4a3c]"
                />
            )}
            {formError && (
                <p className="text-red-500 text-sm mt-1">{formError}</p>
            )}
            <div className="flex gap-2 mt-1">
                <Button type="submit" className="rounded-full bg-[#8b5e3c] text-white hover:bg-[#7a4f2f] border-0 flex-1">
                    {editingTest ? 'Update Test' : 'Schedule Test'}
                </Button>
                {editingTest && (
                    <Button
                        type="button"
                        onClick={() => setEditingTest(null)}
                        className="rounded-full bg-[#e0c4a8] text-[#5a4a3c] hover:bg-[#d8bca0] border-0"
                    >
                        Cancel
                    </Button>
                )}
            </div>
        </form>
    );
};

export default TestScheduleForm;
