import { useState } from "react"
import { useNavigate } from "react-router-dom"
import OnboardingForm from "@/pages/Auth/OnboardingForm"
import axiosInstance from "@/utilities/axiosInstance"

const Login = () => {
    const [isSignup, setIsSignup] = useState(false)
    const [signupCreds, setSignupCreds] = useState(null)
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    })

    const navigate = useNavigate()

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleLogin = async (e) => {
        e.preventDefault()
        try {
            const response = await axiosInstance.post("/api/auth/login", {
                emailId: formData.email,
                password: formData.password,
            }, { withCredentials: true })

            console.log("Login success:", response.data)
            navigate("/main")
        } catch (err) {
            console.error("Login failed:", err)
        }
    }

    const handleSignupCreds = (e) => {
        e.preventDefault()
        setSignupCreds({
            name: formData.username,
            emailId: formData.email,
            password: formData.password,
        })
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="border-2 p-6 rounded-lg shadow-md w-full max-w-md">
                {!signupCreds ? (
                    <>
                        <h2 className="text-2xl font-bold mb-4 text-center">
                            {isSignup ? "Sign Up" : "Login"}
                        </h2>
                        <form onSubmit={isSignup ? handleSignupCreds : handleLogin} className="space-y-4">
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
                                {isSignup ? "Next" : "Login"}
                            </button>
                        </form>
                        <p className="text-center mt-4 text-sm">
                            {isSignup ? "Already have an account?" : "New here?"}{" "}
                            <button
                                type="button"
                                onClick={() => {
                                    setIsSignup(!isSignup)
                                    setSignupCreds(null)
                                }}
                                className="text-blue-600 underline"
                            >
                                {isSignup ? "Login" : "Sign Up"}
                            </button>
                        </p>
                    </>
                ) : (
                    <OnboardingForm adminCreds={signupCreds} />
                )}
            </div>
        </div>
    )
}

export default Login
