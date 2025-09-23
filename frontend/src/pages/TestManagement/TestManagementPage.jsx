import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import TestScheduleForm from './TestScheduleForm';
import TestList from './TestList';
import TestDetail from './TestDetail';
import axiosInstance from '../../utilities/axiosInstance';

const TestManagementPage = () => {
    const batches = useSelector(state => state.batches) || [];
    const tests = useSelector(state => state.tests.tests || []);
    const dispatch = useDispatch();
    const [editingTest, setEditingTest] = useState(null);
    const [selectedTest, setSelectedTest] = useState(null);

    const fetchTests = async (batchId) => {
        if (!batchId) return;
        try {
            const res = await axiosInstance.get(`api/test/getAllTests?batchId=${batchId}`, { withCredentials: true });
            dispatch({ type: 'SET_TESTS', payload: res.data });
        } catch (error) {
            console.error('Failed to fetch tests', error);
        }
    };

    // Load tests for all batches on page load
    useEffect(() => {
        batches.forEach(batch => fetchTests(batch._id));
    }, [batches]);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Test Management</h1>
            <TestScheduleForm
                batches={batches}
                editingTest={editingTest}
                setEditingTest={setEditingTest}
                fetchTests={fetchTests}
            />
            <TestList
                batches={batches}
                tests={tests}
                setEditingTest={setEditingTest}
                setSelectedTest={setSelectedTest}
                fetchTests={fetchTests}
            />
            {selectedTest && <TestDetail test={selectedTest} />}
        </div>
    );
};

export default TestManagementPage;