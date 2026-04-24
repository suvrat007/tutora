import './index.css'
import './App.css'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { lazy, Suspense } from "react";
import store from "./utilities/redux/store.js";
import { Provider } from "react-redux";
import Body from "@/pages/Body.jsx";
import ProtectedRoute from "@/ProtectedRoute.jsx";
import { ThemeProvider } from "./components/ui/ThemeProvider.jsx";
import MainLayout from "./pages/MainLayout.jsx";

const Home = lazy(() => import('./pages/Dashboard/Home.jsx'));
const AttendencePage = lazy(() => import('./pages/Attendence/components/AttendencePage.jsx'));
const StudentData = lazy(() => import('./pages/Student/StudentData.jsx'));
const BatchPage = lazy(() => import('./pages/BatchPage/BatchPage.jsx'));
const Landing = lazy(() => import('./pages/LandingPage/Landing'));
const CompleteInformationDisplay = lazy(() => import('./pages/InfoCenter/CompleteInformationDisplay'));
const Login = lazy(() => import('@/pages/Auth/Login.jsx'));
const LandingPage = lazy(() => import('@/pages/LandingPage.jsx'));
const InstituteInfo = lazy(() => import('@/pages/InstiInfo/InstituteInfo.jsx'));
const Fees = lazy(() => import('@/pages/Fees Management/Fees.jsx'));
const TestManagementPage = lazy(() => import('@/pages/TestManagement/TestManagementPage.jsx'));
const TeacherPage = lazy(() => import('@/pages/TeacherManagement/TeacherPage.jsx'));

const PageLoader = () => (
    <div className="flex items-center justify-center h-full w-full min-h-[200px]">
        <div className="w-8 h-8 border-4 border-[#e6c8a8] border-t-[#8b5e3c] rounded-full animate-spin" />
    </div>
);

const appRouter = createBrowserRouter([
    {
        path: "/",
        element: <Body />,
        children: [
            {
                index: true,
                element: <Suspense fallback={<PageLoader />}><Landing /></Suspense>,
            },
            {
                path: "login",
                element: <Suspense fallback={<PageLoader />}><Login /></Suspense>,
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
                        element: <Suspense fallback={<PageLoader />}><Home /></Suspense>,
                    },
                    {
                        path: "attendance",
                        element: <Suspense fallback={<PageLoader />}><AttendencePage /></Suspense>,
                    },
                    {
                        path: "fees",
                        element: <Suspense fallback={<PageLoader />}><Fees /></Suspense>,
                    },
                    {
                        path: "student-data",
                        element: <Suspense fallback={<PageLoader />}><StudentData /></Suspense>,
                    },
                    {
                        path: "batches",
                        element: <Suspense fallback={<PageLoader />}><BatchPage /></Suspense>,
                    },
                    {
                        path: "info-students",
                        element: <Suspense fallback={<PageLoader />}><CompleteInformationDisplay /></Suspense>,
                    },
                    {
                        path: "info-institute",
                        element: <Suspense fallback={<PageLoader />}><InstituteInfo /></Suspense>,
                    },
                    {
                        path: "tests",
                        element: <Suspense fallback={<PageLoader />}><TestManagementPage /></Suspense>,
                    },
                    {
                        path: "teachers",
                        element: <Suspense fallback={<PageLoader />}><TeacherPage /></Suspense>,
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
                <RouterProvider router={appRouter} />
            </Provider>
        </ThemeProvider>
    );
}

export default App;
