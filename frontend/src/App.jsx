import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import Home from "./pages/Dashboard/Home.jsx";
import AttendencePage from "./pages/Attendence/AttendencePage.jsx";
import StudentData from "./pages/Student/StudentData.jsx";
import BatchPage from "./pages/BatchPage/BatchPage.jsx";
import CompleteInformationDisplay from './pages/InfoCenter/CompleteInformationDisplay.jsx';
import LandingPage from './pages/LandingPage/LandingPage.jsx';

const appRouter = createBrowserRouter([
    {path: '/', element: <LandingPage /> },
    { path: '/dashboard', element: <Home /> },
    { path: '/attendence', element: <AttendencePage /> },
    { path: '/student-data', element: <StudentData /> },
    { path: '/batches', element: <BatchPage /> },
    { path: '/info-center', element: <CompleteInformationDisplay /> },
    { path: '/', element: <CompleteInformationDisplay /> }
])

function App() {
  return (
    // container with scroll and full viewport height
    <div style={{ height: '100vh', overflowY: 'auto' }}>
      <RouterProvider router={appRouter}>
        <Outlet />
      </RouterProvider>
    </div>
  )
}

export default App
