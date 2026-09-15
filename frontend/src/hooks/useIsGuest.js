import { useSelector } from "react-redux";

/**
 * True while the user is exploring the demo.
 *
 * Use it to hide the handful of controls that can't simply be faked - anything
 * that leaves the browser by a route other than axiosInstance (direct Cloudinary
 * uploads), asks for hardware permission (webcam face enrolment), or hands out a
 * credential that wouldn't work (the public registration link, parent invites).
 */
const useIsGuest = () => useSelector((state) => Boolean(state.guest));

export default useIsGuest;
