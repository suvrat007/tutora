import { Navigate, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";

const ProtectedRoute = ({ children }) => {
    const navigate = useNavigate();
    const user = useSelector((store) => store.user);
    const [checkedAuth, setCheckedAuth] = useState(false);

    useEffect(() => {
        if (user === null) {
            const timeout = setTimeout(() => {
                navigate('/login');
            }, 500);
            return () => clearTimeout(timeout);
        } else {
            setCheckedAuth(true);
        }
    }, [user, navigate]);

    if (!user && !checkedAuth) {
        return (
            <div className="min-h-screen bg-[#f8ede3] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-32 sm:-top-40 -right-32 sm:-right-40 w-64 sm:w-80 h-64 sm:h-80 bg-gradient-to-br from-[#e6c8a8]/20 to-[#f0d9c0]/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-32 sm:-bottom-40 -left-32 sm:-left-40 w-64 sm:w-80 h-64 sm:h-80 bg-gradient-to-tr from-[#f0d9c0]/20 to-[#d7b48f]/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 sm:w-96 h-80 sm:h-96 bg-gradient-to-r from-[#e6c8a8]/10 to-[#f0d9c0]/10 rounded-full blur-2xl animate-spin" style={{ animationDuration: '20s' }}></div>
                </div>

                <div className="relative z-10 text-center">
                    <div className="mb-6 sm:mb-8">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-[#7b5c4b] via-[#5a4a3c] to-[#d7b48f] bg-clip-text text-transparent animate-pulse">
                            Tutora
                        </h1>
                        <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-[#e6c8a8] to-[#f0d9c0] mx-auto mt-3 sm:mt-4 rounded-full animate-pulse"></div>
                    </div>

                    <div className="relative">
                        <div className="w-12 sm:w-16 h-12 sm:h-16 mx-auto mb-4 sm:mb-6 relative">
                            <div className="absolute inset-0 rounded-full border-4 border-[#f0d9c0]"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#e6c8a8] border-r-[#d7b48f] animate-spin"></div>
                            <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-[#e6c8a8] border-l-[#d7b48f] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                        </div>

                        <div className="flex justify-center space-x-2 mb-6 sm:mb-8">
                            <div className="w-2 h-2 bg-[#e6c8a8] rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-[#d7b48f] rounded-full animate-bounce delay-100"></div>
                            <div className="w-2 h-2 bg-[#e6c8a8] rounded-full animate-bounce delay-200"></div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-base sm:text-lg font-medium text-[#5a4a3c] animate-pulse">
                                Verifying your access...
                            </p>
                            <p className="text-xs sm:text-sm text-[#7b5c4b] animate-pulse delay-300">
                                Please wait while we secure your session
                            </p>
                        </div>
                    </div>

                    <div className="absolute inset-0 pointer-events-none">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-2 h-2 bg-[#e6c8a8]/30 rounded-full animate-ping"
                                style={{
                                    left: `${20 + i * 15}%`,
                                    top: `${30 + (i % 2) * 40}%`,
                                    animationDelay: `${i * 0.5}s`,
                                    animationDuration: `${2 + i * 0.5}s`,
                                }}
                            ></div>
                        ))}
                    </div>
                </div>

                <div className="absolute bottom-6 sm:bottom-10 left-1/2 transform -translate-x-1/2">
                    <div className="flex space-x-1">
                        <div className="w-1 h-6 sm:h-8 bg-gradient-to-t from-[#e6c8a8] to-transparent rounded-full animate-pulse"></div>
                        <div className="w-1 h-4 sm:h-6 bg-gradient-to-t from-[#d7b48f] to-transparent rounded-full animate-pulse delay-200"></div>
                        <div className="w-1 h-8 sm:h-10 bg-gradient-to-t from-[#e6c8a8] to-transparent rounded-full animate-pulse delay-400"></div>
                        <div className="w-1 h-3 sm:h-4 bg-gradient-to-t from-[#d7b48f] to-transparent rounded-full animate-pulse delay-600"></div>
                        <div className="w-1 h-5 sm:h-7 bg-gradient-to-t from-[#e6c8a8] to-transparent rounded-full animate-pulse delay-800"></div>
                    </div>
                </div>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;