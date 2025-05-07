import Navbar from "../Navbar/Navbar.jsx";
import SideBar from "../Navbar/SideBar.jsx";
import useFetchAllClasses from "../../hooks/useFetchAllClasses.jsx";
import {useEffect, useState} from "react";
import {all} from "axios";
import Calendar from "react-calendar";

const Home = () => {
    const [allClasses, setAllClasses] = useState(null);
    const [value, setValue] = useState(new Date());

    useEffect(() => {
        const fetchClasses = async () => {
            const data = await useFetchAllClasses();
            setAllClasses(data);
        };
        fetchClasses();
    }, []);
    // console.log(allClasses);
    return (
        <div className="flex h-screen">
            <SideBar/>
            <div className="flex flex-col w-full overflow-hidden">
                <Navbar/>

                <div className={'flex flex-col flex-wrap  gap-2 mx-2'}>
                    <div className={'w-full flex gap-2'}>
                        {/*todays classes*/}
                        <div className={'border-2 rounded-2xl mt-2 w-[70%] overflow-hidden'}>
                            <h1 className={'p-2 m-2 border-b-2'}>Today's Classes</h1>
                            <div className={'overflow-scroll h-[18rem] '}>
                                {allClasses ? (allClasses.map((c, index) => (
                                    <div className={'py-2 m-2 border-2 rounded-lg'}>
                                        <div className={'border-b-2 p-2'}>
                                            <p>{c.batchName}</p>
                                        </div>
                                        <div className={'flex p-2 justify-between'}>
                                            <h1><span>Class:</span> {c.forStandard}</h1>
                                            <h1><span>Subject:</span> {c.subjectName}</h1>
                                            <h1><span>Time:</span> {c.time}</h1>
                                        </div>
                                    </div>
                                ))) : (
                                    <div>
                                        YAY! No classes Scheduled for today.
                                    </div>
                                )}

                            </div>
                        </div>

                        {/*calender*/}
                        <div className="border-2 rounded-2xl w-[30%] mt-2 p-4">
                            <Calendar
                                onChange={setValue}
                                value={value}
                            />
                        </div>
                    </div>


                    <div className={' flex w-full gap-2'}>
                        {/*fee info*/}
                        <div className={' rounded-2xl w-[45%] flex flex-col '}>
                            {/*fee collected*/}
                            <div className={'rounded-2xl border-2'}>
                                <p className={'text-xl p-3'}>Fee's Collected : </p>
                                <div className={'flex flex-col justify-center items-center'}>
                                    <h1 className={'text-5xl p-6'}>Rs. 10000</h1>
                                </div>
                            </div>

                            {/*fee to be collected*/}
                            <div className={'rounded-2xl border-2 mt-2'}>
                                <p className={'text-xl p-3'}>Fee To be Collected : </p>
                                <div className={'flex flex-col justify-center items-center'}>
                                    <h1 className={'text-5xl p-6'}>Rs. 10000</h1>
                                </div>
                            </div>
                        </div>

                        {/*attendence percentages*/}
                        <div className={' w-full flex gap-2'}>
                            {/*attendence of teachers*/}
                            <div className={'rounded-2xl border-2  w-[50%]'}>
                                <p className={'text-xl p-3'}>Teacher's Attendence Percentage : </p>
                                <div className={'flex flex-col justify-center items-center mt-5'}>
                                    <h1 className={'text-[5em] p-10 border-2 rounded-[50%]'}>100%</h1>
                                </div>
                            </div>

                            {/*attendence of students*/}
                            <div className={'rounded-2xl border-2  w-[50%]'}>
                                <p className={'text-xl p-3'}>Student's Attendence Percentage : </p>
                                <div className={'flex flex-col justify-center items-center mt-5'}>
                                    <h1 className={'text-[5em] p-10 border-2 rounded-[50%]'}>100%</h1>
                                </div>
                            </div>
                        </div>
                    </div>


                </div>
            </div>


        </div>
    )
}
export default Home