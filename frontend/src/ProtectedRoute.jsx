import {Navigate, useNavigate} from "react-router-dom"
import { useSelector } from "react-redux"
import {useEffect, useState} from "react";

const ProtectedRoute = ({ children }) => {
    const navigate=useNavigate()
    const user=useSelector((store)=>store.user);
    const [checkedAuth,setCheckedAuth]=useState(false)

    useEffect(() => {
        if(user === null){
            const timeout=setTimeout(()=>{
                navigate('/login')
            },500)
            return ()=> clearTimeout(timeout)
        }
        else {
            setCheckedAuth(true)
        }
    }, [user]);

    if(!user && !checkedAuth){
        return  (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center relative overflow-hidden">

                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-300/10 to-purple-300/10 rounded-full blur-2xl animate-spin" style={{animationDuration: '20s'}}></div>
                </div>


                <div className="relative z-10 text-center">

                    <div className="mb-8">
                        <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent animate-pulse">
                            Tutora
                        </h1>
                        <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-4 rounded-full animate-pulse"></div>
                    </div>


                    <div className="relative">

                        <div className="w-16 h-16 mx-auto mb-6 relative">
                            <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-purple-500 animate-spin"></div>
                            <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-blue-400 border-l-purple-400 animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
                        </div>


                        <div className="flex justify-center space-x-2 mb-8">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100"></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
                        </div>


                        <div className="space-y-2">
                            <p className="text-lg font-medium text-gray-700 animate-pulse">
                                Verifying your access...
                            </p>
                            <p className="text-sm text-gray-500 animate-pulse delay-300">
                                Please wait while we secure your session
                            </p>
                        </div>
                    </div>


                    <div className="absolute inset-0 pointer-events-none">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-2 h-2 bg-blue-400/30 rounded-full animate-ping"
                                style={{
                                    left: `${20 + i * 15}%`,
                                    top: `${30 + (i % 2) * 40}%`,
                                    animationDelay: `${i * 0.5}s`,
                                    animationDuration: `${2 + i * 0.5}s`
                                }}
                            ></div>
                        ))}
                    </div>
                </div>


                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
                    <div className="flex space-x-1">
                        <div className="w-1 h-8 bg-gradient-to-t from-blue-500 to-transparent rounded-full animate-pulse"></div>
                        <div className="w-1 h-6 bg-gradient-to-t from-purple-500 to-transparent rounded-full animate-pulse delay-200"></div>
                        <div className="w-1 h-10 bg-gradient-to-t from-blue-500 to-transparent rounded-full animate-pulse delay-400"></div>
                        <div className="w-1 h-4 bg-gradient-to-t from-purple-500 to-transparent rounded-full animate-pulse delay-600"></div>
                        <div className="w-1 h-7 bg-gradient-to-t from-blue-500 to-transparent rounded-full animate-pulse delay-800"></div>
                    </div>
                </div>
            </div>
        )
    }
    return children
}

export default ProtectedRoute