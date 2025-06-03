import { NavLink } from "react-router-dom";
import { Home, CalendarCheck, Users, Layers, Info } from "lucide-react";

const Sidebar = () => {
  const linkStyle =
    "flex items-center gap-3 p-3 rounded-lg text-base font-medium transition-colors hover:bg-blue-100";

  const activeStyle = "bg-blue-500 text-white font-semibold";

  return (
    <div className="w-[17.5em] border-r-2 bg-white shadow-sm flex flex-col h-screen py-10 px-6">
      <h2 className="text-2xl font-bold mb-8 text-gray-800">Dashboard</h2>

      <nav className="flex flex-col gap-2">
        <NavLink
          to="/"
          className={({ isActive }) => `${linkStyle} ${isActive ? activeStyle : ""}`}
        >
          <Home className="w-5 h-5" />
          Home
        </NavLink>

        <NavLink
          to="/attendence"
          className={({ isActive }) => `${linkStyle} ${isActive ? activeStyle : ""}`}
        >
          <CalendarCheck className="w-5 h-5" />
          Attendance
        </NavLink>

        <NavLink
          to="/student-data"
          className={({ isActive }) => `${linkStyle} ${isActive ? activeStyle : ""}`}
        >
          <Users className="w-5 h-5" />
          Students
        </NavLink>

        <NavLink
          to="/batches"
          className={({ isActive }) => `${linkStyle} ${isActive ? activeStyle : ""}`}
        >
          <Layers className="w-5 h-5" />
          Batches
        </NavLink>

        <NavLink
          to="/info-center"
          className={({ isActive }) => `${linkStyle} ${isActive ? activeStyle : ""}`}
        >
          <Info className="w-5 h-5" />
          Info Center
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;
