import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { ModeToggle } from "@/components/ui/ModeToggle.jsx";

const LandingPage = () => {
    const navigate = useNavigate();
    const goToLogin = () => {
        navigate("/login");
    }
    const goToHome = () => {
        navigate("/main");
    }
    const user = useSelector((state) => state.user)

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="flex flex-col items-center justify-center min-h-screen bg-background text-text p-4"
        >
            <div className="absolute top-4 right-4">
                <ModeToggle />
            </div>
            <div className="text-center max-w-2xl mx-auto">
                <h1 className="text-5xl md:text-6xl font-bold text-primary mb-4">
                    Welcome to MeriKaksha
                </h1>
                <p className="text-lg md:text-xl text-text-light mb-8">
                    Your comprehensive platform for seamless educational institution management.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {!user ? (
                        <Button
                            onClick={goToLogin}
                            className="px-8 py-3 text-lg"
                        >
                            Login
                        </Button>
                    ) : (
                        <Button
                            onClick={goToHome}
                            className="px-8 py-3 text-lg"
                        >
                            Go to Dashboard
                        </Button>
                    )}
                </div>
            </div>
        </motion.div>
    )
}
export default LandingPage;