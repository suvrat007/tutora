import React from 'react';
import { useSelector } from 'react-redux';

const TestDetail = ({ test }) => {
    const batches = useSelector(state => state.batches);

    const getSubjectName = (batchId, subjectId) => {
        const batch = batches.find(b => b._id === batchId);
        if (batch && subjectId) {
            const subject = batch.subject.find(s => s._id === subjectId);
            return subject ? subject.name : 'No Subject';
        }
        return 'No Subject';
    };

    const getBatchName = (batchId) => {
        const batch = batches.find(b => b._id === batchId);
        return batch ? batch.name : 'Unknown Batch';
    };

    if (!test) return null;

    return (
        <div className="p-4 border rounded-lg mt-4">
            <h2 className="text-xl font-semibold mb-2">Test Details</h2>
            <h3 className="font-bold">{test.testName}</h3>
            <p>Batch: {getBatchName(test.batchId)}</p>
            <p>Subject: {getSubjectName(test.batchId, test.subjectId)}</p>
            <p>Date: {new Date(test.testDate).toLocaleString()}</p>
            <p>Status: {test.status}</p>
            <p>Max Marks: {test.maxMarks}</p>
            {test.cancellationReason && <p>Cancellation Reason: {test.cancellationReason}</p>}

            <div className="mt-4">
                <h4 className="font-semibold">Student Results</h4>
                {test.studentResults.length > 0 ? (
                    <ul>
                        {test.studentResults.map(result => (
                            <li key={result.studentId._id}>
                                {result.studentId.name}: {result.marks} / {test.maxMarks} (Appeared: {result.appeared ? 'Yes' : 'No'})
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No results yet.</p>
                )}
            </div>
        </div>
    );
};

export default TestDetail;