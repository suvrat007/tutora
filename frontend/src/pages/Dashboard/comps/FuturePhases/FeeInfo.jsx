const FeeInfo = () => {
    return (
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

    )
}
export default FeeInfo