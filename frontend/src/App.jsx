import './index.css'
import './App.css'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import store from "./utilities/redux/store.jsx";
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
                        path: "student-data",
                        element: <StudentData />,
                    },
                    {
                        path: "batches",
                        element: <BatchPage />,
                    },
                    {
                        path: "info",
                        element: <CompleteInformationDisplay />,
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
