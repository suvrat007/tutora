import { useState, useEffect } from 'react';

export const useForm = (initialState = {}) => {
    const [formData, setFormData] = useState(initialState);

    useEffect(() => {
        setFormData(initialState);
    }, [JSON.stringify(initialState)]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    const register = (name) => ({
        name,
        value: formData[name] || '',
        onChange: handleInputChange,
    });

    const handleSubmit = (callback) => (e) => {
        e.preventDefault();
        callback(formData);
    };

    const reset = () => {
        setFormData(initialState);
    };

    return { formData, register, handleSubmit, reset, setFormData };
};
