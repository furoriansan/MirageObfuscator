"use client";

import React from "react";

export const UploadForm = () => {

    const modalRef = React.useRef<HTMLDialogElement>(null);
    const [modalMessage, setModalMessage] = React.useState("");

    const showModal = (message: string) => {
        setModalMessage(message);
        modalRef.current?.showModal();
    };
    return (
        <>
            <label
                className={"inline md:hidden confirmButton-mobile items-center mt-4 mb-5 "}
                htmlFor={"upload_input"}>Upload your resource-pack
            </label>

            <label
                className={"hidden md:inline confirmButton items-center mt-4 mb-5 "}
                htmlFor={"upload_input"}>Upload your resource-pack
            </label>

            <input
                className={"hidden "}
                id="upload_input"
                type="file"
                name="file"
                onChange={async (event) => {
                    if (event.target.files) {
                        const formData = new FormData();
                        Object.values(event.target.files).forEach((file) => {
                            formData.append("file", file);
                        });
                        const response = await fetch("/api/upload/", {
                            method: "POST",
                            body: formData,
                        });
                        const contentType = response.headers.get("Content-Type");
                        if (response.ok && contentType && contentType.includes("application/zip")) {
                            const blob = await response.blob();
                            const contentDisposition = response.headers.get("Content-Disposition");
                            const fileNameMatch = contentDisposition?.match(/filename="(.+)"/);
                            const fileName = fileNameMatch ? fileNameMatch[1] : "obfuscated.zip";

                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = fileName;
                            a.click();
                            URL.revokeObjectURL(url);
                            showModal("Your resource-pack has been successfully obfuscated.");
                        } else {
                            const error = await response.json().catch(() => ({}));
                            showModal(error.status || "An internal error occurred while obfuscating.");
                        }
                    }
                }}
            />
            <dialog ref={modalRef} id="info_mordal"  className="modal z-10 scale-100 sm:scale-150 flex items-center justify-center ">
                <div
                    className="relative mx-auto w-11/12 sm:w-3/4 lg:w-1/2 max-w-lg bg-neutral- border-b-2 border-neutral-600">
                    <h3 className="font-[minecraftBig] text-lg bg-neutral-800 border-2 border-neutral-600 text-center p-3">
                        INFORMATION
                    </h3>
                    <div className="bg-neutral-900 p-4 border-l-2 border-r-2 border-neutral-600">
                        <p className="py-2 text-xs ">
                            {modalMessage}
                        </p>
                    </div>
                    <form method="dialog"
                          className="flex bg-neutral-800  border-l-2 border-r-2 border-t-2 -2 border-neutral-600 justify-center">
                        <button
                            className="modalButton text-white ">
                            Close
                        </button>
                    </form>
                </div>
            </dialog>
    </>
    );
};