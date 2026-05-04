import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const Dropdown = ({
    value,
    onChange,
    options,
    placeholder = "Select an option",
    className = "",
    disabled = false,
    name,
    align = "left",
    compact = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [menuStyle, setMenuStyle] = useState({});
    const triggerRef = useRef(null);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                triggerRef.current && !triggerRef.current.contains(event.target) &&
                menuRef.current && !menuRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const openMenu = () => {
        if (disabled) return;
        const rect = triggerRef.current.getBoundingClientRect();
        setMenuStyle({
            position: 'fixed',
            top: rect.bottom + 2,
            left: align === 'right' ? undefined : rect.left,
            right: align === 'right' ? window.innerWidth - rect.right : undefined,
            minWidth: rect.width,
            zIndex: 9999,
        });
        setIsOpen(v => !v);
    };

    const handleSelect = (val) => {
        if (onChange) onChange({ target: { name, value: val } });
        setIsOpen(false);
    };

    const currentOption = options.find(opt =>
        (typeof opt === 'object' ? opt.value : opt) === value
    );
    const displayLabel = currentOption
        ? (typeof currentOption === 'object' ? currentOption.label : currentOption)
        : placeholder;

    return (
        <div className={`relative w-full ${className}`} ref={triggerRef}>
            <button
                type="button"
                onClick={openMenu}
                disabled={disabled}
                className={`w-full ${compact ? 'px-2.5 py-1 text-xs' : 'p-2.5 text-sm'} rounded-full border border-[#e6c8a8] text-[#5a4a3c] bg-white shadow-sm outline-none transition-all text-left flex justify-between items-center ${
                    disabled ? "opacity-50 cursor-not-allowed" : "hover:border-[#e0c4a8] focus:ring-2 focus:ring-[#e0c4a8] focus:border-[#e0c4a8]"
                }`}
            >
                <span className="truncate">{displayLabel || placeholder || " "}</span>
                <ChevronDown className={`w-4 h-4 text-[#a08a78] transition-transform duration-200 shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            ref={menuRef}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 6 }}
                            transition={{ duration: 0.15 }}
                            style={menuStyle}
                            className="p-2 bg-white border border-[#e6c8a8] shadow-lg rounded-xl max-h-60 overflow-y-auto max-w-xs"
                        >
                            <div className="flex flex-col gap-1">
                                {options.map((opt, idx) => {
                                    const optValue = typeof opt === 'object' ? opt.value : opt;
                                    const optLabel = typeof opt === 'object' ? opt.label : opt;
                                    const isSelected = optValue === value;
                                    return (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => handleSelect(optValue)}
                                            className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                                                isSelected
                                                    ? "bg-[#e0c4a8] text-[#5a4a3c] shadow-sm"
                                                    : "bg-transparent text-[#7b5c4b] hover:bg-[#f0e8df]"
                                            }`}
                                        >
                                            {optLabel}
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};

export default Dropdown;
