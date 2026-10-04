"use client";

import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t-2 border-[#0A0A0A] bg-[#0A0A0A] text-white py-10 mt-20">
      <div className="max-w-[1240px] w-full mx-auto px-6 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Brand & Trademark */}
        <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-4 text-center sm:text-left">
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 bg-[#15B054] inline-block tt-pulse-dot" />
            <span className="font-serif text-2xl font-normal text-white tracking-wide">
              Think Twice™
            </span>
          </div>
          <span className="hidden sm:inline text-gray-500">|</span>
          <span className="font-plex text-xs font-semibold text-gray-300 uppercase tracking-wider">
            Decision Reflection &amp; Interrogation System
          </span>
        </div>

        {/* Minimal Copyright & Telemetry Status */}
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-xs font-plex text-gray-400">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-[#15B054] rounded-full inline-block" />
            <span className="text-gray-300 font-medium">GROQ 120B // SUPABASE LIVE</span>
          </div>
          <span className="text-gray-400 font-medium">
            © 2026 THINK TWICE™. ALL RIGHTS RESERVED.
          </span>
        </div>
      </div>
    </footer>
  );
}
