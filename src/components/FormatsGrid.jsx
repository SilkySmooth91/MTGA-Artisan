import { useEffect, useRef, useState } from "react";
import { LayoutGroup, motion } from "framer-motion";
import BigButton from "./BigButton";
import { formatsConfig } from "../data/formatsConfig";
import FormatDetails from "./FormatDetails";

export default function FormatsGrid({ activeFormat, onSelect }) {   
    const [pendingFormat, setPendingFormat] = useState(null)
    const [returningFormat, setReturningFormat] = useState(null)
    const selectionTimeoutRef = useRef(null)
    const returnTimeoutRef = useRef(null)

    const displayedFormat = pendingFormat ?? returningFormat ?? activeFormat
    const selectedFormat = formatsConfig.find((format) => format.id === displayedFormat) ?? null
    const isTransitioningToDetails = pendingFormat !== null && activeFormat === null

    useEffect(() => {
        return () => {
            if (selectionTimeoutRef.current) {
                clearTimeout(selectionTimeoutRef.current)
            }

            if (returnTimeoutRef.current) {
                clearTimeout(returnTimeoutRef.current)
            }
        }
    }, [])

    useEffect(() => {
        if (!returningFormat) return

        returnTimeoutRef.current = window.setTimeout(() => {
            setReturningFormat(null)
        }, 200)

        return () => {
            if (returnTimeoutRef.current) {
                clearTimeout(returnTimeoutRef.current)
            }
        }
    }, [returningFormat])

    const handleSelectFormat = (formatId) => {
        if (activeFormat || pendingFormat || returningFormat) return

        setPendingFormat(formatId)

        selectionTimeoutRef.current = window.setTimeout(() => {
            onSelect(formatId)
            setPendingFormat(null)
        }, 100)
    }

    const handleResetSelection = () => {
        if (selectionTimeoutRef.current) {
            clearTimeout(selectionTimeoutRef.current)
        }

        if (returnTimeoutRef.current) {
            clearTimeout(returnTimeoutRef.current)
        }

        if (activeFormat) {
            setReturningFormat(activeFormat)
        }

        setPendingFormat(null)
        onSelect(null)
    }

    if (activeFormat && selectedFormat) {
        return (
            <LayoutGroup>
                <div className="w-full max-w-screen-2xl mx-auto px-4 md:px-8 lg:px-12">
                    <div className="grid grid-cols-1 lg:grid-cols-[305px_minmax(0,1fr)] gap-10 lg:gap-14 place-items-center lg:place-items-start">
                        <div className="w-full flex justify-center lg:justify-start lg:self-start">
                            <motion.div
                                layoutId={`format-${selectedFormat.id}`}
                                transition={{ layout: { duration: 0.45, ease: "easeInOut" } }}
                            >
                                <BigButton
                                    key={selectedFormat.id}
                                    onClick={handleResetSelection}
                                >
                                    <img src={selectedFormat.icon.src} alt={selectedFormat.label} />
                                    <span className="text-[#FF4545]/80 font-heading font-normal text-3xl mt-15">
                                        {selectedFormat.label}
                                    </span>
                                </BigButton>
                            </motion.div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.32, delay: 0.5, ease: "easeOut" }}
                            className="w-full max-w-3xl text-center md:text-left"
                        >
                            <FormatDetails
                                formatId={selectedFormat.id}
                                className="w-full max-w-3xl text-center md:text-left"
                            />
                        </motion.div>
                    </div>
                </div>
            </LayoutGroup>
        )
    }

    return (
        <LayoutGroup>
            <div className="w-full max-w-screen-2xl mx-auto px-4 md:px-8 lg:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-14 place-items-center">
                {formatsConfig.map((format) => {
                    const isSelected = displayedFormat === format.id
                    const shouldFadeOut = Boolean(displayedFormat) && !isSelected

                    return (
                        <motion.div
                            key={format.id}
                            layoutId={`format-${format.id}`}
                            initial={{ opacity: 0, y: 18 }}
                            animate={
                                shouldFadeOut
                                    ? { opacity: 0, scale: 0.9, y: 8 }
                                    : isTransitioningToDetails && isSelected
                                      ? { opacity: 1, scale: 1, x: -32 }
                                      : { opacity: 1, scale: 1, y: 0, x: 0 }
                            }
                            transition={{ duration: shouldFadeOut ? 0.35 : 0.42, ease: "easeInOut" }}
                            className={shouldFadeOut ? "pointer-events-none" : ""}
                        >
                            <BigButton
                                onClick={() => handleSelectFormat(format.id)}
                            >
                                <img src={format.icon.src} alt={format.label} />
                                <span className="text-[#FF4545]/80 font-heading font-normal text-3xl mt-15">
                                    {format.label}
                                </span>
                            </BigButton>
                        </motion.div>
                    )
                })}
            </div>
        </LayoutGroup>
    )
}