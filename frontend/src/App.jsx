import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {createBrowserRouter, Outlet, RouterProvider} from "react-router-dom";
import Home from "./pages/Dashboard/Home.jsx";
import AttendencePage from "./pages/Attendence/AttendencePage.jsx";
import StudentData from "./pages/Student/StudentData.jsx";
import BatchPage from "./pages/BatchPage/BatchPage.jsx";
import CompleteInformationDisplay from './pages/InfoCenter/CompleteInformationDisplay.jsx';

const appRouter = createBrowserRouter([
    {
        path: '/',
        element: <Home />,
    },{
        path: '/attendence',
        element: <AttendencePage/>
    },{
        path: '/student-data',
        element: <StudentData/>
    },{
        path: '/batches',
        element: <BatchPage/>
    },{
        path: '/info-center',
        element: <CompleteInformationDisplay/>
    }
    ]
)

function App() {

  return (

      <RouterProvider router={appRouter}>
          <Outlet/>
      </RouterProvider>
  )
}

export default App
