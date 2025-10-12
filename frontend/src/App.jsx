import './index.css'
import './App.css'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import store from "./utilities/redux/store.js";
import { Provider } from "react-redux";
import Home from "./pages/Dashboard/Home.jsx";
import AttendencePage from "./pages/Attendence/components/AttendencePage.jsx";
import StudentData from "./pages/Student/StudentData.jsx";
import BatchPage from "./pages/BatchPage/BatchPage.jsx";
import Landing from './pages/LandingPage/Landing';
import CompleteInformationDisplay from './pages/InfoCenter/CompleteInformationDisplay';
import Body from "@/pages/Body.jsx";
import Login from "@/pages/Auth/Login.jsx";
import ProtectedRoute from "@/ProtectedRoute.jsx";
import { ThemeProvider } from "./components/ui/ThemeProvider.jsx";
import MainLayout from "./pages/MainLayout.jsx";
import LandingPage from "@/pages/LandingPage.jsx";
import InstituteInfo from "@/pages/InstiInfo/InstituteInfo.jsx";
import Fees from "@/pages/Fees Management/Fees.jsx";
import { Analytics } from "@vercel/analytics/next"

const appRouter = createBrowserRouter([
    {
        path: "/",
        element: <Body />,
        children: [
            {
                index: true,
                element: <Landing />,
            },
            {
                path: "login",
                element: <Login />,
            },
            {
                path: "main",
                element: (
                    <ProtectedRoute>
                        <MainLayout />
                    </ProtectedRoute>
                ),
                children: [
                    {
                        index: true,
                        element: <Home />,
                    },
                    {
                        path: "attendance",
                        element: <AttendencePage />,
                    },
                    {
                        path: "fees",
                        element: <Fees />,
                    },
                    {
                        path: "student-data",
                        element: <StudentData />,
                    },
                    {
                        path: "batches",
                        element: <BatchPage />,
                    },
                    {
                        path: "info-students",
                        element: <CompleteInformationDisplay />,
                    },
                    {
                        path: "info-institute",
                        element: <InstituteInfo />,
                    },
                ],
            },
        ],
    },
]);

function App() {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <Provider store={store}>
                <Analytics/>
                <RouterProvider router={appRouter} />
            </Provider>
        </ThemeProvider>
    );
}

export default App;
