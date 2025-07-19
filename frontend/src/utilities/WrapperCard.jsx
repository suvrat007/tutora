const WrapperCard = ({ children }) => (
    <div className="relative bg-[#f3d8b6] rounded-3xl shadow-lg p-2 flex flex-1 justify-center items-center h-full">
        <div className="w-full h-full">{children}</div>
    </div>
);
export default WrapperCard;