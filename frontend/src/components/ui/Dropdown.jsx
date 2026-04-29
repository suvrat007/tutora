import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const Dropdown = ({ 
    value, 
    onChange, 
    options, 
    placeholder = "Select an option",
    className = "",
    disabled = false,
    name
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (val) => {
        if (onChange) onChange({ target: { name, value: val } }); // Simulate event object for easier drop-in replacement
        setIsOpen(false);
    };

    // Find current label
    const currentOption = options.find(opt => 
        (typeof opt === 'object' ? opt.value : opt) === value
    );
    const displayLabel = currentOption 
        ? (typeof currentOption === 'object' ? currentOption.label : currentOption) 
        : placeholder;

    return (
        <div className={`relative w-full ${className}`} ref={dropdownRef}>
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`w-full p-2.5 rounded-lg border border-[#e6c8a8] text-sm text-[#5a4a3c] bg-white shadow-sm outline-none transition-all text-left flex justify-between items-center ${
                    disabled ? "opacity-50 cursor-not-allowed" : "hover:border-[#e0c4a8] focus:ring-2 focus:ring-[#e0c4a8] focus:border-[#e0c4a8]"
                }`}
            >
                <span className="truncate">{displayLabel || placeholder || "\u00A0"}</span>
                <ChevronDown className={`w-4 h-4 text-[#a08a78] transition-transform duration-200 shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 min-w-full mt-2 p-2 bg-white border border-[#e6c8a8] shadow-lg rounded-xl z-[100] max-h-60 overflow-y-auto"
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
                                        className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors truncate ${
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
            </AnimatePresence>
        </div>
    );
};

export default Dropdown;
