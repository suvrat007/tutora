import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";

const words = ["nalytics", "ttendance", "ssistance"];
const maxLoops = 3;

const TypingHeader = () => {
  const [displayText, setDisplayText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopCount, setLoopCount] = useState(0);
  const [done, setDone] = useState(false);

  const typingSpeed = 100;
  const deletingSpeed = 50;
  const pauseDuration = 1000;

  useEffect(() => {
    if (done) return;

    const currentWord = words[wordIndex];
    let timeout;

    if (!isDeleting && charIndex <= currentWord.length) {
      setDisplayText(currentWord.substring(0, charIndex));
      timeout = setTimeout(() => setCharIndex(charIndex + 1), typingSpeed);
    } else if (isDeleting && charIndex >= 0) {
      setDisplayText(currentWord.substring(0, charIndex));
      timeout = setTimeout(() => setCharIndex(charIndex - 1), deletingSpeed);
    } else {
      if (!isDeleting) {
        timeout = setTimeout(() => setIsDeleting(true), pauseDuration);
      } else {
        if (loopCount + 1 === maxLoops) {
          setDone(true);
        } else {
          setIsDeleting(false);
          setCharIndex(0);
          setWordIndex((prev) => (prev + 1) % words.length);
          setLoopCount((prev) => prev + 1);
        }
      }
    }

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, wordIndex, loopCount, done]);

  return (
    <h1 className="text-4xl font-bold text-blue-600 uppercase tracking-tight">
      TUTORA
      <span className="text-gray-900 normal-case tracking-normal">
        {displayText}
      </span>
      {done ? <span className="text-gray-900">.</span> : <span className="animate-blink">|</span>}
    </h1>
  );
};


const LandingPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-100 px-4">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 bg-white shadow-2xl rounded-2xl overflow-hidden">

         {/* Right: Decorative Image */}
        <div className="flex w-full items-center justify-center">
          <img
            src="https://images.unsplash.com/photo-1564609116494-380be7238d7d?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Books"
            className="rounded-2xl shadow-md w-[90%] max-h-[550px] object-cover"
          />
        </div>

        {/* Left: Login Form */}
        <div className="p-10">
          <TypingHeader />
          <p className="text-gray-600 mt-2 mb-6">
            A brand new day is here. It's your day to shape.
            Sign in and get started on your projects.
          </p>

          <form className="space-y-4">
            <div>
              <label className="text-sm text-gray-700">Email</label>
              <input
                type="email"
                placeholder="abc123@gmail.com"
                className="w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="text-sm text-gray-700">Password</label>
              <input
                type="password"
                placeholder="Enter your Password"
                className="w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <div className="text-right mt-1 text-sm text-blue-500 hover:underline cursor-pointer">
                Forgot password
              </div>
            </div>

            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg">
              Sign in
            </Button>
          </form>

          <div className="flex items-center my-6">
            <hr className="flex-grow border-t" />
            <span className="px-3 text-gray-400 text-sm">or</span>
            <hr className="flex-grow border-t" />
          </div>

          <div className="space-y-3">
            <button className="w-full flex items-center justify-center gap-3 border border-gray-300 py-2 rounded-md hover:bg-gray-100">
              <FcGoogle className="text-xl" />
              Sign in with Google
            </button>

            <button className="w-full flex items-center justify-center gap-3 border border-gray-300 py-2 rounded-md hover:bg-gray-100">
              <FaFacebook className="text-blue-600 text-xl" />
              Sign in with Facebook
            </button>
          </div>
        </div>

       

      </div>
    </div>
  );
};

export default LandingPage;
