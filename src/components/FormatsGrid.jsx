import BigButton from "./BigButton";
import standardIcon from "../assets/icons/championship 1.webp"
import historicIcon from "../assets/icons/cup 1.webp"
import timelessIcon from "../assets/icons/hourglass 1.webp"
import artisawlIcon from "../assets/icons/blades 1.webp"
import cubartisanIcon from "../assets/icons/cube 1.webp"
import realmsIcon from "../assets/icons/castel 1.webp"

export default function FormatsGrid({ activeFormat, onSelect }) {
    const formats = [
        { id: "Standard", icon: standardIcon },
        { id: "Historic", icon: historicIcon },
        { id: "Timeless", icon: timelessIcon},
        { id: "Artisawl", icon: artisawlIcon},
        { id: "Cubartisan", icon: cubartisanIcon},
        { id: "Realms", icon: realmsIcon}];
   

    return (
        <div className={`w-full max-w-screen-2xl mx-auto grid gap-28 ${activeFormat ? "grid-cols-1 place-items-start" : "grid-cols-3 grid-rows-2 place-items-center"}`}>
            {formats.map((format) => {
                const isHidden = activeFormat && activeFormat !== format.id

                if (isHidden) return null

                return (
                    <BigButton
                        key={format.id}
                        onClick={() =>
                            onSelect(
                                activeFormat === format.id ? null : format.id
                            )
                        }
                    >
                        <img src={format.icon.src} alt={format.id}/>
                        <span className="text-[#FF4545]/80 font-heading font-normal text-3xl mt-15">      
                            {format.id}
                        </span>
                    </BigButton>
                )
            })}
        </div>
    )
}