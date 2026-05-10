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
import { Analytics } from "@vercel/analytics/react";

// On chunk-load failure (stale cache after a new deploy), force a full reload
// so the browser fetches fresh HTML and the correct hashed chunk filenames.
const lazyWithReload = (importFn) =>
    lazy(() =>
        importFn().catch(() => {
            window.location.reload();
            return new Promise(() => {});
        })
    );

const Home = lazyWithReload(() => import('./pages/Dashboard/Home.jsx'));
const AttendencePage = lazyWithReload(() => import('./pages/Attendence/components/AttendencePage.jsx'));
const StudentData = lazyWithReload(() => import('./pages/Student/StudentData.jsx'));
const BatchPage = lazyWithReload(() => import('./pages/BatchPage/BatchPage.jsx'));
const Landing = lazyWithReload(() => import('./pages/LandingPage/Landing'));
const CompleteInformationDisplay = lazyWithReload(() => import('./pages/InfoCenter/CompleteInformationDisplay'));
const Login = lazyWithReload(() => import('@/pages/Auth/Login.jsx'));
const InstituteInfo = lazyWithReload(() => import('@/pages/InstiInfo/InstituteInfo.jsx'));
const Fees = lazyWithReload(() => import('@/pages/Fees Management/Fees.jsx'));
const TestManagementPage = lazyWithReload(() => import('@/pages/TestManagement/TestManagementPage.jsx'));
const TeacherPage = lazyWithReload(() => import('@/pages/TeacherManagement/TeacherPage.jsx'));
const StudentOnboardingPage = lazyWithReload(() => import('@/pages/StudentRegistration/StudentOnboardingPage.jsx'));
const PricingPage = lazyWithReload(() => import('@/pages/Pricing/Pricing.jsx'));
const BillingPage = lazyWithReload(() => import('@/pages/Billing/Billing.jsx'));
const TestSubmitPage = lazyWithReload(() => import('@/pages/TestSubmit/TestSubmitPage.jsx'));

// Parent portal pages
const ParentLogin = lazyWithReload(() => import('@/pages/ParentPortal/ParentLogin.jsx'));
const ParentSetup = lazyWithReload(() => import('@/pages/ParentPortal/ParentSetup.jsx'));
const ParentBody = lazyWithReload(() => import('@/pages/ParentPortal/ParentBody.jsx'));
const ParentLayout = lazyWithReload(() => import('@/pages/ParentPortal/ParentLayout.jsx'));
const ParentDashboard = lazyWithReload(() => import('@/pages/ParentPortal/ParentDashboard.jsx'));
const ParentAttendancePage = lazyWithReload(() => import('@/pages/ParentPortal/ParentAttendancePage.jsx'));
const ParentFeesPage = lazyWithReload(() => import('@/pages/ParentPortal/ParentFeesPage.jsx'));
const ParentTestsPage = lazyWithReload(() => import('@/pages/ParentPortal/ParentTestsPage.jsx'));
const ParentSchedulePage = lazyWithReload(() => import('@/pages/ParentPortal/ParentSchedulePage.jsx'));

const PageLoader = () => (
    <div className="fixed inset-0 bg-[#f8ede3] flex flex-col items-center justify-center z-50">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-[#e0c4a8] rounded-full blur-3xl opacity-20 pointer-events-none" />
        <div className="absolute bottom-1/4 -right-16 w-56 h-56 bg-[#d4b896] rounded-full blur-3xl opacity-15 pointer-events-none" />
        <div
            className="text-4xl font-bold text-[#5a4a3c] tracking-wide mb-6"
            style={{ animation: "tutora-pulse 1.6s ease-in-out infinite" }}
        >
            Tutora
        </div>
        <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
                <div
                    key={i}
                    className="w-2 h-2 bg-[#8b5e3c] rounded-full"
                    style={{ animation: `tutora-bounce 1s ease-in-out ${i * 0.18}s infinite` }}
                />
            ))}
        </div>
        <style>{`
            @keyframes tutora-pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.55; }
            }
            @keyframes tutora-bounce {
                0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
                40% { transform: translateY(-8px); opacity: 1; }
            }
        `}</style>
    </div>
);
const appRouter = createBrowserRouter([
    {
        path: "/register/:adminId",
        element: <Suspense fallback={<PageLoader />}><StudentOnboardingPage /></Suspense>,
    },
    {
        path: "/test-submit/group/:groupId",
        element: <Suspense fallback={<PageLoader />}><TestSubmitPage /></Suspense>,
    },
    {
        path: "/test-submit/:testId",
        element: <Suspense fallback={<PageLoader />}><TestSubmitPage /></Suspense>,
    },
    {
        path: "/parent/login",
        element: <Suspense fallback={<PageLoader />}><ParentLogin /></Suspense>,
    },
    {
        path: "/parent/setup/:token",
        element: <Suspense fallback={<PageLoader />}><ParentSetup /></Suspense>,
    },
    {
        path: "/parent",
        element: <Suspense fallback={<PageLoader />}><ParentBody /></Suspense>,
        children: [
            {
                element: <Suspense fallback={<PageLoader />}><ParentLayout /></Suspense>,
                children: [
                    {
                        index: true,
                        element: <Suspense fallback={<PageLoader />}><ParentDashboard /></Suspense>,
                    },
                    {
                        path: "attendance",
                        element: <Suspense fallback={<PageLoader />}><ParentAttendancePage /></Suspense>,
                    },
                    {
                        path: "fees",
                        element: <Suspense fallback={<PageLoader />}><ParentFeesPage /></Suspense>,
                    },
                    {
                        path: "tests",
                        element: <Suspense fallback={<PageLoader />}><ParentTestsPage /></Suspense>,
                    },
                    {
                        path: "schedule",
                        element: <Suspense fallback={<PageLoader />}><ParentSchedulePage /></Suspense>,
                    },
                ],
            },
        ],
    },
    {
        path: "/",
        element: <Body />,
        children: [
            {
                index: true,
                element: <Suspense fallback={<PageLoader />}><Landing /></Suspense>,
            },
            {
                path: "pricing",
                element: <Suspense fallback={<PageLoader />}><PricingPage /></Suspense>,
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
                    {
                        path: "billing",
                        element: <Suspense fallback={<PageLoader />}><BillingPage /></Suspense>,
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
