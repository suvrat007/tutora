import { Button } from "@/components/ui/button.jsx";
import { ArrowRight } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

const Hero = ({ currentWord, rotatingWords, user }) => {
    const navigate = useNavigate();

    return (
        <section className="py-24 px-6 bg-[#f4e9d8] text-center">
            <h1 className="text-5xl sm:text-6xl font-bold text-[#3e2f23] mb-6 leading-tight">
                Your personal{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#a8855c] to-[#4a3a2c]">
          Tutor
        </span>{" "}
                <span className="ml-2 bg-clip-text text-transparent bg-gradient-to-r from-[#4a3a2c] to-[#cba175]">
          {rotatingWords[currentWord]}
        </span>
            </h1>
            <p className="text-lg text-[#6b594c] max-w-2xl mx-auto mt-4">
                All-in-one partner built for solo educators. Manage students, classes,
                and schedules with ease.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                <Button
                    size="lg"
                    className="bg-[#4a3a2c] text-white hover:bg-[#3a2a1d]"
                    onClick={() => navigate(user ? "/main" : "/login")}
                >
                    {user ? "Go to Dashboard" : "Try Now"}
                </Button>
                <Button variant="outline" size="lg" className="border-[#b49c80] text-[#4a3a2c]">
                    Learn More <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
            </div>
        </section>
    );
};

export default Hero;
