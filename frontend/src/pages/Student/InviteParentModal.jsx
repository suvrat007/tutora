import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AiOutlineClose } from "react-icons/ai";
import { Copy, Check, Share2, Loader2 } from "lucide-react";

const InviteParentModal = ({ studentName, relation, email, inviteToken, onClose }) => {
    const [copied, setCopied] = useState(false);

    const baseUrl = window.location.origin;
    const inviteLink = `${baseUrl}/parent/setup/${inviteToken}`;
    const relationLabel = relation === 'mom' ? 'Mother' : 'Father';

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(inviteLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (_) {}
    };

    const handleWhatsApp = () => {
        const text = `Hi! You've been invited to view ${studentName}'s progress on Tutora. Click this link to set up your account: ${inviteLink}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    onClick={onClose}
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 16 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="relative z-10 bg-white border border-[#e8d5c0] rounded-3xl shadow-2xl p-6 w-full max-w-md"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-[#b0998a] hover:text-[#7b5c4b] transition-colors cursor-pointer"
                    >
                        <AiOutlineClose className="w-5 h-5" />
                    </button>

                    <h3 className="text-base font-bold text-[#2c1a0e] mb-1">
                        Invite {relationLabel}
                    </h3>
                    <p className="text-sm text-[#9b8778] mb-4">
                        Share this link with <span className="font-medium text-[#5a4a3c]">{email}</span>
                    </p>

                    <div className="bg-[#f5ede3] rounded-xl px-3 py-2.5 mb-4 flex items-center gap-2">
                        <span className="text-xs text-[#5a4a3c] flex-1 truncate font-mono">{inviteLink}</span>
                        <button
                            onClick={handleCopy}
                            className="shrink-0 p-1.5 rounded-lg hover:bg-[#e8d5c0] transition-colors cursor-pointer"
                            title="Copy link"
                        >
                            {copied
                                ? <Check className="w-4 h-4 text-green-600" />
                                : <Copy className="w-4 h-4 text-[#7b5c4b]" />
                            }
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleCopy}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#e8d5c0] text-sm font-semibold text-[#5a4a3c] hover:bg-[#f5ede3] transition-colors cursor-pointer"
                        >
                            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                            {copied ? "Copied!" : "Copy Link"}
                        </button>
                        <button
                            onClick={handleWhatsApp}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#25D366] text-white text-sm font-semibold hover:bg-[#20BC5A] transition-colors cursor-pointer"
                        >
                            <Share2 className="w-4 h-4" />
                            WhatsApp
                        </button>
                    </div>

                    <p className="text-xs text-[#b0998a] text-center mt-4">
                        Link expires in 7 days. You can always generate a new one.
                    </p>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default InviteParentModal;
