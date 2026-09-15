import axios from "axios";
import toast from "react-hot-toast";
import { isGuest } from "./guestSession.js";
import { decorate, fulfil, shouldAnnounceWrite } from "./guestSandbox.js";

/**
 * Makes guest writes look like they worked without letting them leave the
 * browser.
 *
 * This is an axios *adapter* rather than a request interceptor on purpose. An
 * interceptor can only mutate the config or throw; swapping the adapter means
 * the request never reaches fetch/XHR at all, so it also never reaches the
 * service worker and can never be captured by the PWA's background-sync queue
 * and replayed later under a real login.
 *
 * This is a UX device, not a security boundary - the backend independently
 * rejects every write carrying a guest token (see middleware/guestGuard.js).
 */

// Requests that must still go to the server during a guest session: signing up
// or logging in for real, and ending the demo.
const PASS_THROUGH = [/^auth\//, /^parent\/login$/, /^parent\/logout$/];

const shouldPassThrough = (url = "") => PASS_THROUGH.some((re) => re.test(url.replace(/^\/+/, "")));

const parseBody = (data) => {
    if (!data) return {};
    if (typeof data === "string") {
        try {
            return JSON.parse(data);
        } catch {
            return {};
        }
    }
    return typeof data === "object" ? data : {};
};

export const isDemoResponse = (response) => Boolean(response?.data?.__demo);

// Said once per session, on the first change the guest actually makes. Their
// edits do stick while they browse, so without this they'd have no way to know
// nothing is being saved - and repeating it on every click would be nagging.
const announceDemoWrite = () => {
    if (!shouldAnnounceWrite()) return;
    toast("Demo mode - your changes show here but aren't saved.", {
        id: "guest-demo-write",
        duration: 5000,
    });
};

export const installGuestAdapter = (instance) => {
    const realAdapter = axios.getAdapter(instance.defaults.adapter);

    instance.defaults.adapter = async (config) => {
        const method = (config.method || "get").toLowerCase();
        const isRead = method === "get" || method === "head" || method === "options";

        if (!isGuest() || shouldPassThrough(config.url)) {
            return realAdapter(config);
        }

        if (isRead) {
            // Real data from the real API, with the guest's own changes from
            // this session replayed on top so they don't vanish on a refetch.
            const response = await realAdapter(config);
            return { ...response, data: decorate(config.url, response.data) };
        }

        announceDemoWrite();

        return {
            data: fulfil(method, config.url, parseBody(config.data)),
            status: 200,
            statusText: "OK",
            headers: {},
            config,
            request: null,
        };
    };

    return instance;
};
