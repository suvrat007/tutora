const Navbar = () => {
  return (
    <div className="flex justify-between items-center border-b px-6 py-3 shadow-sm bg-white">
      {/* Left: Logo */}
      <div className="flex items-center gap-2 text-xl font-semibold text-gray-800">
        <img
          src="https://www.svgrepo.com/show/521135/menu.svg"
          alt="logo"
          className="w-6 h-6"
        />
        <span>Tutora</span>
      </div>

      {/* Center: Organization name */}
      <div className="text-lg font-medium text-gray-700 hidden sm:block">
        Name of User Organization
      </div>

      {/* Right: Profile image (can become a dropdown later) */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600 hidden sm:inline">Hi, User</span>
        <img
          src="https://www.svgrepo.com/show/527961/user.svg"
          alt="User Avatar"
          className="w-10 h-10 rounded-full border border-gray-400"
        />
      </div>
    </div>
  );
};

export default Navbar;
