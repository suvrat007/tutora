const WrapperCard = ({ children }) => (
    <div className="relative bg-background rounded-2xl shadow-soft p-2 flex flex-1 justify-center items-center h-full border border-border">
        <div className="w-full h-full">{children}</div>
    </div>
);
export default WrapperCard;