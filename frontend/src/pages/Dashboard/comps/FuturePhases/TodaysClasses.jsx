import Calendar from "react-calendar";
import {useEffect, useState} from "react";
import useFetchAllClasses from "../DashboardHooks/useFetchAllClasses.jsx";

const TodaysClasses = () => {
    const [allClasses, setAllClasses] = useState(null);

    useEffect(() => {
        const fetchClasses = async () => {
            const data = await useFetchAllClasses();
            setAllClasses(data);
        };
        fetchClasses();
    }, []);

    return (
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

    )
}
export default TodaysClasses