import React, { useEffect, useState } from 'react';
import axios from 'axios';

const QRCodeGenerator = ({ batchId, subId, date }) => {
    const [qrCodeDataURL, setQrCodeDataURL] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const generateQRCode = async (encodedData) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post('/generate-qr-code', {
                data: encodedData,
            });
            setQrCodeDataURL(response.data.qrCodeDataURL);
        } catch (err) {
            setError('Failed to generate QR code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (batchId && subId && date) {
            const encodedData = { batchId : batchId, subjectId: subId, date: date };
            generateQRCode(encodedData);
        }
    }, [batchId, subId, date]);

    return (
        <div className="p-4 border rounded-xl">
            <h3 className="text-lg font-semibold mb-2">QR Code for Attendance</h3>

            {loading && <p>Generating QR code...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && !error && qrCodeDataURL && (
                <img src={qrCodeDataURL} alt="QR Code" className="w-40 h-40" />
            )}
            {!loading && !qrCodeDataURL && (
                <p className="text-sm text-gray-500">Please enter Batch, Subject, and Date.</p>
            )}
        </div>
    );
};

export default QRCodeGenerator;
