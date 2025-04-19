const Navbar = () => {
    return (
        <div className="flex justify-between items-center border-2 p-2 rounded-lg">
            <div>
                logo
            </div>
            
            <div>
                Name of user Organization
            </div>
            
            <div>
                <img src="https://www.svgrepo.com/show/527961/user.svg"
                     className="w-10 rounded-full border-1 border-black" />
            </div>
        </div>
    )
}
export default Navbar