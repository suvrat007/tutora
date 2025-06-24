import { useState } from "react"
import axiosInstance from "@/utilities/axiosInstance.jsx";
import OnboardingForm from "@/pages/Auth/OnboardingForm.jsx";
import {useNavigate} from "react-router-dom";
import {useDispatch} from "react-redux";
import {setUser} from "@/utilities/redux/userSlice.jsx";

const Login = () => {
    const [isSignup, setIsSignup] = useState(false)
    const [signupComplete, setSignupComplete] = useState(false)

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    })

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleSubmit =async (e) => {
        e.preventDefault()

        if (isSignup) {
            const response=await axiosInstance.post('api/auth/signup', {
                name: formData.username,
                emailId: formData.email,
                password: formData.password,
            },{withCredentials:true});
            console.log("Signing up user:", response.data)
            setSignupComplete(true)
        } else {
            const response = await axiosInstance.post('api/auth/login', {
                emailId: formData.email,
                password: formData.password,
            },{withCredentials:true});
            console.log("Logging in user:", response.data)
            dispatch(setUser(response.data.user));
            navigate("/main", { replace: true });
        }
    }

    const handleOnboardingSubmit = (e) => {
        e.preventDefault()
        console.log("Onboarding complete")
        // Redirect to /home or update auth state here
    }

    return (
        <div className="flex flex-col items-center justify-center ">
            <div className="border-2 p-6 rounded-lg shadow-md w-full max-w-md">
                {!signupComplete ? (
                    <>
                        <h2 className="text-2xl font-bold mb-4 text-center">
                            {isSignup ? "Sign Up" : "Login"}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {isSignup && (
                                <input
                                    type="text"
                                    name="username"
                                    placeholder="Username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border rounded-md"
                                    required
                                />
                            )}
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border rounded-md"
                                required
                            />
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border rounded-md"
                                required
                            />
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
                            >
                                {isSignup ? "Sign Up" : "Login"}
                            </button>
                        </form>
                        <p className="text-center mt-4 text-sm">
                            {isSignup ? "Already have an account?" : "New here?"}{" "}
                            <button
                                type="button"
                                onClick={() => {
                                    setIsSignup(!isSignup)
                                    setSignupComplete(false)
                                }}
                                className="text-blue-600 underline"
                            >
                                {isSignup ? "Login" : "Sign Up"}
                            </button>
                        </p>
                    </>
                ) : (
                    <OnboardingForm/>
                )}
            </div>
        </div>
    )
}

export default Login