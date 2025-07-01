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
            <div className={'flex flex-col items-center justify-center h-screen'}>
                Loading
            </div>
        )
    }
    return children
}

export default ProtectedRoute
