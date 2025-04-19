import Navbar from "../Navbar/Navbar.jsx";
import SideBar from "../Navbar/SideBar.jsx";

const Home = () => {
    return (
        <div className="flex">
            <div className="flex flex-col w-[17.5em] border-2 h-screen py-10 px-5 rounded-xl">
                <SideBar/>
            </div>

            <div className={'w-full'}>

                <Navbar />

                <div className={'flex flex-col flex-wrap  gap-2 mx-2'}>
                    <div className={'w-full flex gap-2'}>
                        {/*todays classes*/}
                        <div className={'border-2 rounded-2xl mt-2 w-[70%] overflow-hidden'}>
                            <h1 className={'p-2 m-2 border-b-2'}>Today's Classes</h1>

                            <div className={'overflow-scroll h-[18rem] '}>
                                <div className={'py-2 m-2 border-2 rounded-lg'}>
                                    <p className={'border-b-2 p-1'}>Batch</p>
                                    <h1 className={'p-2'}>Clases and info</h1>
                                </div>
                                <div className={'py-2 m-2 border-2 rounded-lg'}>
                                    <p className={'border-b-2 p-1'}>Batch</p>
                                    <h1 className={'p-2'}>Clases and info</h1>
                                </div>
                                <div className={'py-2 m-2 border-2 rounded-lg'}>
                                    <p className={'border-b-2 p-1'}>Batch</p>
                                    <h1 className={'p-2'}>Clases and info</h1>
                                </div>
                                <div className={'py-2 m-2 border-2 rounded-lg'}>
                                    <p className={'border-b-2 p-1'}>Batch</p>
                                    <h1 className={'p-2'}>Clases and info</h1>
                                </div>
                            </div>
                        </div>

                        {/*calender*/}
                        <div className={'border-2 rounded-2xl w-[30%] mt-2'}>
                            h1
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