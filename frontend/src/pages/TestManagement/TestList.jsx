import React from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from '../../utilities/axiosInstance';

const TestList = ({ batches, tests, setEditingTest, setSelectedTest, fetchTests }) => {
    const getSubjectName = (batchId, subjectId) => {
        const batch = batches.find(b => b._id === batchId);
        if (batch && subjectId) {
            const subject = batch.subject.find(s => s._id === subjectId);
            return subject ? subject.name : 'No Subject';
        }
        return 'No Subject';
    };

    const handleDelete = async (testId, batchId) => {
        if (!window.confirm('Are you sure you want to delete this test?')) return;
        try {
            await axiosInstance.delete(`api/test/${testId}`, { withCredentials: true });
            fetchTests(batchId);
        } catch (error) {
            console.error('Failed to delete test', error);
        }
    };

    const getBatchName = (batchId) => {
        const batch = batches.find(b => b._id === batchId);
        return batch ? batch.name : 'Unknown Batch';
    };

    return (
        <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">Scheduled Tests</h2>
            {tests.length === 0 ? (
                <p>No tests found.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tests.map(test => (
                        <div
                            key={test._id}
                            className="p-4 border rounded-lg cursor-pointer"
                            onClick={() => setSelectedTest(test)}
                        >
                            <h3 className="font-bold">{test.testName}</h3>
                            <p>Batch: {getBatchName(test.batchId)}</p>
                            <p>Subject: {getSubjectName(test.batchId, test.subjectId)}</p>
                            <p>Date: {new Date(test.testDate).toLocaleString()}</p>
                            <p>Status: {test.status}</p>
                            <p>Max Marks: {test.maxMarks}</p>
                            <div className="mt-2">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setEditingTest(test); }}
                                    className="mr-2 text-blue-500"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(test._id, test.batchId); }}
                                    className="text-red-500"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TestList;