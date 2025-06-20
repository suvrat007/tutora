const Navbar = () => {
    return (
        <div className="mx-4 mt-4 mb-2 px-6 py-3 bg-gradient-to-r from-[#f9fafb] to-[#e5e7eb] rounded-2xl shadow-md flex justify-between items-center">
            {/* Logo or App Name */}
            <div className="text-xl font-semibold text-gray-700">
                LOGO
            </div>

            {/* Organization Name */}
            <div className="text-base font-medium text-gray-600">
                Name of User Organization
            </div>

            {/* Profile Image */}
            <div>
                <img
                    src="https://www.svgrepo.com/show/527961/user.svg"
                    alt="User Avatar"
                    className="w-10 h-10 rounded-full border border-gray-400 shadow-sm"
                />
            </div>
        </div>
    );
};

export default Navbar;
