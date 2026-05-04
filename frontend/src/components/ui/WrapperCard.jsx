const WrapperCard = ({ children }) => (
    <div className="relative flex flex-1 justify-center items-center h-full">
        <div className="w-full h-full">{children}</div>
    </div>
);
export default WrapperCard;