import React from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from '../../utilities/axiosInstance';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useForm } from './hooks/useForm';

const TestScheduleForm = ({ batches, editingTest, setEditingTest, fetchTests }) => {
    const initialState = editingTest
        ? {
            testName: editingTest.testName || '',
            maxMarks: editingTest.maxMarks || '',
            testDate: new Date(editingTest.testDate).toISOString().slice(0, 16) || '',
            batchId: editingTest.batchId || '',
            subjectId: editingTest.subjectId || '',
            status: editingTest.status || 'scheduled',
            cancellationReason: editingTest.cancellationReason || ''
        }
        : {
            testName: '',
            maxMarks: '',
            testDate: '',
            batchId: '',
            subjectId: '',
            status: 'scheduled',
            cancellationReason: ''
        };

    const { formData, register, handleSubmit, reset } = useForm(initialState);

    const onSubmit = async (data) => {
        if (data.status === 'cancelled' && !data.cancellationReason) {
            alert('Cancellation reason is required');
            return;
        }

        try {
            if (editingTest) {
                await axiosInstance.put(`api/test/updateTest/${editingTest._id}`, {
                    testName: data.testName,
                    batchId: data.batchId,
                    subjectId: data.subjectId || null, // Allow optional subject
                    maxMarks: data.maxMarks,
                    testDate: data.testDate,
                    status: data.status,
                    cancellationReason: data.cancellationReason
                }, { withCredentials: true });
                setEditingTest(null);
            } else {
                await axiosInstance.post('api/test/createTest', {
                    ...data,
                    subjectId: data.subjectId || null, // Allow optional subject
                    studentResults: []
                }, { withCredentials: true });
            }
            reset();
            fetchTests(data.batchId);
        } catch (error) {
            console.error('Failed to save test', error);
        }
    };

    const selectedBatch = batches.find(b => b._id === formData.batchId);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="mb-4 p-4 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">{editingTest ? 'Update Test' : 'Schedule a New Test'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input {...register('testName')} placeholder="Test Name" />
                <Input {...register('maxMarks')} type="number" placeholder="Max Marks" />
                <Input {...register('testDate')} type="datetime-local" />
                <div>
                    <select {...register('batchId')} className="w-full p-2 border rounded">
                        <option value="">Select Batch</option>
                        {batches.map(batch => (
                            <option key={batch._id} value={batch._id}>{batch.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <select {...register('subjectId')} className="w-full p-2 border rounded">
                        <option value="">No Subject (Optional)</option>
                        {selectedBatch && selectedBatch.subject.map(subject => (
                            <option key={subject._id} value={subject._id}>{subject.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <select {...register('status')} className="w-full p-2 border rounded">
                        <option value="scheduled">Scheduled</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
                {formData.status === 'cancelled' && (
                    <Input {...register('cancellationReason')} placeholder="Cancellation Reason" />
                )}
            </div>
            <Button type="submit" className="mt-4">{editingTest ? 'Update Test' : 'Schedule Test'}</Button>
            {editingTest && (
                <Button type="button" onClick={() => setEditingTest(null)} className="mt-4 ml-2">Cancel Edit</Button>
            )}
        </form>
    );
};

export default TestScheduleForm;