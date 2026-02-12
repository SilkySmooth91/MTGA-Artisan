import { useState } from "react"
import FormatsGrid from "./FormatsGrid"

export default function PlayArtisan() {
    const [activeFormat, setActiveFormat] = useState(null)
     console.log(activeFormat)
    return (
        <section>
            <FormatsGrid 
            activeFormat={activeFormat}
            onSelect={setActiveFormat}/>
        </section>
    )
   
}

