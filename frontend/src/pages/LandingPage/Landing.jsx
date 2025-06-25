"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaGithub } from "react-icons/fa";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { FlipWords } from "@/components/ui/flip-words";

const Landing = () => {
  const words = ["mazing", "wesome", "mbitious", "daptive", "dvanced"];
  const [role, setRole] = useState("student");

  return (
    <div className="relative min-h-screen bg-gray-600 flex items-center justify-center px-4 overflow-hidden">
      <BackgroundBeams />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-md w-full"
      >
        <Card className="rounded-2xl shadow-2xl bg-white/10 backdrop-blur-md border-white/10 text-white">
          <CardContent className="p-8">
            {/* ✨ Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">
              <span className="text-white inline">TUTORA</span>
              <FlipWords className="text-[#e7c6a5]" words={words} />
            </h1>


            <p className="text-center text-neutral-400 text-sm mb-4">
              Your smart, modern tutoring platform.
            </p>

            {/* 🔁 Role Selection */}
            <div className="flex justify-center mb-4 gap-2">
              {["Parent", "Student", "Tutor"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r.toLowerCase())}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
                    role === r.toLowerCase()
                      ? "bg-[#e7c6a5] text-black border-[#e7c6a5]"
                      : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* 🔐 Login Form */}
            <form className="space-y-4">
              <Input
                type="email"
                placeholder="Email"
                className="bg-white/20 border-white/20 placeholder-white"
              />
              <Input
                type="password"
                placeholder="Password"
                className="bg-white/20 border-white/20 placeholder-white"
              />
              <Button
                type="submit"
                className="w-full bg-[#e7c6a5] text-black hover:bg-[#dbb892]"
              >
                Login as {role.charAt(0).toUpperCase() + role.slice(1)}
              </Button>
            </form>

            {/* ➖ Divider */}
            <div className="my-6 flex items-center">
              <div className="flex-grow h-px bg-white/20" />
              <span className="px-4 text-sm text-white/70">
                or continue with
              </span>
              <div className="flex-grow h-px bg-white/20" />
            </div>

            {/* 🌐 Social Auth */}
            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 bg-white/10 border-white/20 hover:bg-white/20 text-white"
              >
                <FcGoogle className="text-xl" />
                Sign in with Google
              </Button>
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 bg-white/10 border-white/20 hover:bg-white/20 text-white"
              >
                <FaFacebook className="text-xl text-blue-500" />
                Sign in with Facebook
              </Button>
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 bg-white/10 border-white/20 hover:bg-white/20 text-white"
              >
                <FaGithub className="text-xl" />
                Sign in with GitHub
              </Button>
            </div>

            {/* 📝 Signup */}
            <p className="mt-6 text-sm text-center text-white/80">
              Don’t have an account?{" "}
              <Link to="/signup" className="text-[#e7c6a5] hover:underline">
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Landing;
