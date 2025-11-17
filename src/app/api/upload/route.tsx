import { NextRequest, NextResponse } from "next/server";
import {ObfuscationHandler} from "@/app/obfuscator/handlers/ObfuscationHandler";
import path from 'path';

const zipTypes: string[] = [
    "application/zip",
    "application/x-zip-compressed",
    "application/x-zip",
];

export const POST = async (req: NextRequest) => {

    console.info("Receiving decryption request..");

    const formData = await req.formData();
    const body = Object.fromEntries(formData);
    const uploadedFile = (body.file as File) || null;

    if (!uploadedFile) {
        return NextResponse.json({
            status: "Failed to receive file, try again.",
            success: false
        });
    }
    if(!zipTypes.includes(uploadedFile.type)){
        console.error("Invalid file type uploaded: " + uploadedFile.type);
        return NextResponse.json({
            status: "Wrong file type, you can only upload Zip archives.",
            success: false,
        });
    }
    const obfuscatedFile = await ObfuscationHandler.initiateObfuscation(uploadedFile);
    if(obfuscatedFile.statusCode !== 0x00){
        return NextResponse.json({status: obfuscatedFile.message, success: false});
    }else{
        const fileName =  `${path.parse(uploadedFile.name).name}_obfuscated.zip`;
        return new NextResponse(obfuscatedFile.message, {
            status: 200,
            headers: {'Content-Type': 'application/zip', 'Content-Disposition': `attachment; filename="${fileName}"`}
        });
    }
};