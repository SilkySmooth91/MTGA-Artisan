import BigButton from "./BigButton";
import { formatsConfig } from "../data/formatsConfig";
import FormatDetails from "./FormatDetails";

export default function FormatsGrid({ activeFormat, onSelect }) {   
    const selectedFormat = formatsConfig.find((format) => format.id === activeFormat) ?? null

    if (activeFormat && selectedFormat) {
        return (
            <div className="w-full max-w-screen-2xl mx-auto px-4 md:px-8 lg:px-12">
                <div className="grid grid-cols-1 lg:grid-cols-[305px_minmax(0,1fr)] gap-10 lg:gap-14 place-items-center lg:place-items-start">
                    <div className="w-full flex justify-center lg:justify-start lg:self-start">
                        <BigButton
                            key={selectedFormat.id}
                            onClick={() => onSelect(null)}
                        >
                            <img src={selectedFormat.icon.src} alt={selectedFormat.label} />
                            <span className="text-[#FF4545]/80 font-heading font-normal text-3xl mt-15">
                                {selectedFormat.label}
                            </span>
                        </BigButton>
                    </div>

                    <FormatDetails
                        formatId={selectedFormat.id}
                        className="w-full max-w-3xl text-left"
                    />
                </div>
            </div>
        )
    }

    return (
        <div className="w-full max-w-screen-2xl mx-auto px-4 md:px-8 lg:px-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-14 place-items-center">
            {formatsConfig.map((format) => (
                <BigButton
                    key={format.id}
                    onClick={() => onSelect(format.id)}
                >
                    <img src={format.icon.src} alt={format.label} />
                    <span className="text-[#FF4545]/80 font-heading font-normal text-3xl mt-15">
                        {format.label}
                    </span>
                </BigButton>
            ))}
        </div>
    )
}