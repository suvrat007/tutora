const Card = ({ children, className = "" }) => {
  return (
    <div
      className={`bg-[#e7c6a5] border border-[#e0b890] rounded-2xl p-5 shadow-md ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
