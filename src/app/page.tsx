"use client";
import React from "react";
import {UploadForm} from "@/app/components/UploadForm";
import Link from "next/link";

export default function Home() {
  return (
      <div className="flex items-center justify-center min-h-screen  w-screen mirage-bg animate-fade-up">
          <main className="flex flex-col items-center w-full h-full">
              <div className="flex flex-col items-center w-full flex-grow ">
                  <div className="w-full flex justify-center flex-grow">
                      <div className="flex flex-col items-center max-w-[1000px] text-center px-6 animate-fade-up flex-grow">
                          <h1 className="text-3xl sm:text-5xl font-bold font-[minecraftBig] pt-10 pb-6 ">
                              TIRED OF GETTING YOUR PACK STOLEN?
                          </h1>
                          <h1 className="text-gray-200 text-lg sm:text-xl font-[minecraftSmall] text-center  max-w-[800px] leading-relaxed py-2 px-6 ">
                              The days of people easily dismantling your pack are over!<br />
                              This tool will waste their time AND make them go insane.<br/> Just upload your pack and we&#39;ll do the work for you.<br />
                          </h1>

                          <UploadForm/>

                          <h1 className="text-lg sm:text-lg font-[minecraftSmall] leading-snug pt-3 ">
                              Make sure to <Link href="/how-to-prepare"><span className="text-sky-300 underline hover:text-sky-200 transition-all">prepare</span></Link> your pack.
                          </h1>
                      </div>
                  </div>
              </div>
          </main>
      </div>

  );
}
