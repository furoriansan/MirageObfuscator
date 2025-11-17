import loadingGif from '../../public/gifs/loading.gif'

import Image from "next/image";

export default function Loading() {
    return (
        <div
            className="opacity-100 absolute top-0 left-0 w-full h-full bg-black flex items-center justify-center z-50">
            <Image unoptimized className="object-cover h-48 w-48" src={loadingGif} alt="loadingAnimation"/>
        </div>
    );
}