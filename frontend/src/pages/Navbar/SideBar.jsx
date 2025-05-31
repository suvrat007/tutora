import {Link} from "react-router-dom";

const Sidebar = () => {
    return (
        <div className="w-[17.5em] border-2 rounded-r-xl flex flex-col h-screen py-10 px-5">
            <div className="flex flex-col w-[80%] text-lg">
                <h1 className={'p-2'}><Link to={'/'}>Home</Link></h1>
                <h1 className={'p-2'}><Link to={'/attendence'}> Attendence </Link></h1>
                <h1 className={'p-2'}><Link to={'/student-data'}>Students</Link></h1>
                <h1 className={'p-2'}><Link to={'/batches'}>Batches</Link></h1>
                <h1 className={'p-2'}><Link to={'/info-center'}>Info Center</Link></h1>
                
            </div>
        </div>

    )
}
export default Sidebar