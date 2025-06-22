import './index.css'
import './App.css'
import {createBrowserRouter, Outlet, RouterProvider} from "react-router-dom";
import store from "../src/utilities/redux/store.jsx";
import Home from "./pages/Dashboard/Home.jsx";
import AttendencePage from "./pages/Attendence/AttendencePage.jsx";
import StudentData from "./pages/Student/StudentData.jsx";
import BatchPage from "./pages/BatchPage/BatchPage.jsx";
import Landing from './pages/LandingPage/Landing';
import {Provider} from "react-redux";

const appRouter = createBrowserRouter([
    {
        path: '/',
        element: <Landing />,
    },{
        path: '/Home',
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
    }
    ]
)

function App() {

  return (
      <Provider store={store}>
          <RouterProvider router={appRouter}>
              <Outlet/>
          </RouterProvider>
      </Provider>
  )
}

export default App
