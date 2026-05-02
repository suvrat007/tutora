import axios from 'axios';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import axiosInstance from '../utilities/axiosInstance';
import { setTests } from '../utilities/redux/testSlice';

const useFetchTests = (batchId) => {
    const dispatch = useDispatch();

    useEffect(() => {
        const controller = new AbortController();

        const fetchTests = async () => {
            try {
                const response = await axiosInstance.get('test/getAllTests', {
                    withCredentials: true,
                    signal: controller.signal,
                });
                dispatch(setTests(response.data.data));
            } catch (error) {
                if (axios.isCancel(error)) return;
                console.error('Failed to fetch tests', error);
            }
        };

        fetchTests();
        return () => controller.abort();
    }, [batchId, dispatch]);
};

export default useFetchTests;
