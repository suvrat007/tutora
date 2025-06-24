import './index.css'
import './App.css'
import {createBrowserRouter, Outlet, RouterProvider} from "react-router-dom";
import store from "../src/utilities/redux/store.jsx";
import Home from "./pages/Dashboard/Home.jsx";
import AttendencePage from "./pages/Attendence/AttendencePage.jsx";
import StudentData from "./pages/Student/StudentData.jsx";
import BatchPage from "./pages/BatchPage/BatchPage.jsx";
import {Provider} from "react-redux";
import LandingPage from "@/pages/LandingPage.jsx";
import Body from "@/pages/Body.jsx";
import Login from "@/pages/Auth/Login.jsx";
import ProtectedRoute from "@/ProtectedRoute.jsx";
import {ThemeProvider} from "./components/ui/ThemeProvider.jsx";

const appRouter = createBrowserRouter([
    {
        path: "/",
        element: <Body />,
        children: [
            {
                index: true,
                element: <LandingPage />,
            },
            {
                path: "login",
                element: <Login />,
            },
            {
                path: "main",
                children: [
                    {
                        index: true,
                        element: (
                            <ProtectedRoute >
                                <Home />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: "attendance",
                        element: (
                            <ProtectedRoute>
                                <AttendencePage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: "student-data",
                        element: (
                            <ProtectedRoute>
                                <StudentData />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: "batches",
                        element: (
                            <ProtectedRoute>
                                <BatchPage />
                            </ProtectedRoute>
                        ),
                    },
                ],
            },
        ],
    },
])

function App() {

  return (
      <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
      >
          <Provider store={store}>
              <RouterProvider router={appRouter}>
                  <Outlet/>
              </RouterProvider>
          </Provider>
      </ThemeProvider>

  )
}

export default App
