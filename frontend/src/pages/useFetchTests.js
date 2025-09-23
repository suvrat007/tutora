import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import axiosInstance from '../utilities/axiosInstance';
import { setTests } from '../utilities/redux/testSlice';

const useFetchTests = (batchId) => {
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchTests = async () => {
            try {
                const response = await axiosInstance.get('api/test/getAllTests',{withCredentials: true});
                dispatch(setTests(response.data));
            } catch (error) {
                console.error('Failed to fetch tests', error);
            }
        };

        fetchTests();
    }, [batchId, dispatch]);
};

export default useFetchTests;
