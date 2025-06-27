import {ModeToggle} from "@/components/ui/ModeToggle.jsx";
import {useNavigate} from "react-router-dom";
import {useSelector} from "react-redux";
import Navbar from "@/pages/Navbar/Navbar.jsx";

const LandingPage = () => {
    const navigate = useNavigate();
    const goToLogin = () => {
        navigate("/login");
    }
    const goToHome = () => {
        navigate("/main");
    }


    const user = useSelector((state) => state.user);
    console.log(user);
    return (
        <div>
            {/*<Navbar/>*/}
            <ModeToggle />
            Landing Page
            {!user ? (<button onClick={goToLogin}>Login</button>) : (
                <button onClick={goToHome}>Home Page</button>
            )}

        </div>
    )
}
export default LandingPage;