    const AttendancePercentages = () => {
        return (
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
        )
    }
    export default AttendancePercentages