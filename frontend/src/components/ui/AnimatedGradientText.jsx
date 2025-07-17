import { motion } from "framer-motion";
import React from "react";

export const AnimatedGradientText = ({ children, className }) => {
    return (
        <motion.span
            className={`inline-block bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent ${className}`}
            initial={{ backgroundPosition: "0%" }}
            animate={{ backgroundPosition: "200%" }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            style={{
                backgroundSize: "200% auto",
            }}
        >
            {children}
        </motion.span>
    );
};