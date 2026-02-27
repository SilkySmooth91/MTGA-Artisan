import { formatDetails } from "../data/formatDetails"
import { formatsConfig } from "../data/formatsConfig"

export default function FormatDetails({ formatId, className = "" }) {
    if (!formatId) return null

    const selectedFormat = formatsConfig.find((format) => format.id === formatId)
    const details = selectedFormat ? formatDetails[selectedFormat.dataKey] : null

    if (!details) {
        return (
            <section className={className}>
                <h2 className="font-heading text-3xl text-white">{selectedFormat?.label ?? formatId}</h2>
                <p className="font-body text-base text-white mt-4">Descrizione in arrivo.</p>
            </section>
        )
    }

    return (
        <section className={className}>
            <h2 className="font-heading text-3xl text-white">{details.title}</h2>

            <div className="mt-6 space-y-4">
                {details.intro?.map((paragraph, index) => (
                    <p key={`intro-${index}`} className="font-body text-base text-white leading-relaxed">
                        {paragraph}
                    </p>
                ))}
            </div>

            <div className="mt-8 space-y-8">
                {details.sections?.map((section, sectionIndex) => (
                    <div key={`section-${sectionIndex}`} className="space-y-3">
                        {section.title && <h3 className="font-heading text-2xl text-white">{section.title}</h3>}

                        {section.paragraphs?.map((paragraph, paragraphIndex) => (
                            <p
                                key={`p-${sectionIndex}-${paragraphIndex}`}
                                className="font-body text-base text-white leading-relaxed"
                            >
                                {paragraph}
                            </p>
                        ))}

                        {section.bullets?.length > 0 && (
                            <ul className="list-disc pl-6 space-y-1 font-body text-base text-white">
                                {section.bullets.map((bullet, bulletIndex) => (
                                    <li key={`b-${sectionIndex}-${bulletIndex}`}>{bullet}</li>
                                ))}
                            </ul>
                        )}

                        {section.paragraphsAfter?.map((paragraph, paragraphAfterIndex) => (
                            <p
                                key={`pa-${sectionIndex}-${paragraphAfterIndex}`}
                                className="font-body text-base text-white leading-relaxed"
                            >
                                {paragraph}
                            </p>
                        ))}
                    </div>
                ))}
            </div>
        </section>
    )
}