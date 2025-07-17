import { useState } from "react";
import LoadingPage from "../LoadingPage.jsx";
import TodaysClasses from "./comps/FuturePhases/TodaysClasses.jsx";
import Callendar from "./comps/P1/Callendar.jsx";
import ClassStatusUpdates from "./comps/P1/ClassStatusUpdates.jsx";
import Reminders from "./comps/P1/Reminders.jsx";
import { motion } from "framer-motion";

const Home = () => {
  const [loaded, setLoaded] = useState(false);

  if (!loaded) return <LoadingPage onDone={() => setLoaded(true)} />;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
      <motion.div
          className="flex flex-col min-h-screen p-4 gap-4 lg:gap-6 lg:p-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
      >
        {/* Top Row - TodaysClasses & Calendar */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 flex-1 min-h-0">
          <motion.div
              variants={itemVariants}
              className="flex-1 bg-[#f4e3d0]/80 backdrop-blur-sm p-4 lg:p-6 rounded-2xl shadow-lg border border-[#ddb892] overflow-hidden min-h-[200px] lg:min-h-[300px]"
          >
            <TodaysClasses />
          </motion.div>

          <motion.div
              variants={itemVariants}
              className="w-full lg:w-1/3 bg-[#f4e3d0]/80 backdrop-blur-sm p-4 lg:p-6 rounded-2xl shadow-lg border border-[#ddb892] overflow-hidden min-h-[200px] lg:min-h-[300px]"
          >
            <Callendar />
          </motion.div>
        </div>

        {/* Bottom Row - Class Status & Reminders */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 flex-1 min-h-0">
          <motion.div
              variants={itemVariants}
              className="flex-1 bg-[#f4e3d0]/80 backdrop-blur-sm p-4 lg:p-6 rounded-2xl shadow-lg border border-[#ddb892] overflow-hidden min-h-[200px] lg:min-h-[300px]"
          >
            <ClassStatusUpdates />
          </motion.div>

          <motion.div
              variants={itemVariants}
              className="w-full lg:w-1/2 bg-[#f4e3d0]/80 backdrop-blur-sm p-4 lg:p-6 rounded-2xl shadow-lg border border-[#ddb892] overflow-hidden min-h-[200px] lg:min-h-[300px]"
          >
            <Reminders />
          </motion.div>
        </div>
      </motion.div>
  );
};

export default Home;