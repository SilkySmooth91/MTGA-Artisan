import { formatDetails } from "../data/formatDetails"
import { formatsConfig } from "../data/formatsConfig"

function renderInlineStrong(text, keyPrefix) {
    if (typeof text !== "string" || text.length === 0) return text

    const parts = text.split(/(<strong>.*?<\/strong>)/g)
    if (parts.length === 1) return text

    return parts.map((part, index) => {
        const strongMatch = part.match(/^<strong>(.*?)<\/strong>$/)

        if (strongMatch) {
            return <strong key={`${keyPrefix}-strong-${index}`}>{strongMatch[1]}</strong>
        }

        return <span key={`${keyPrefix}-text-${index}`}>{part}</span>
    })
}

export default function FormatDetails({ formatId, className = "" }) {
    if (!formatId) return null

    const selectedFormat = formatsConfig.find((format) => format.id === formatId)
    const details = selectedFormat ? formatDetails[selectedFormat.dataKey] : null
    const sectionClassName = `px-10 ${className}`.trim()

    if (!details) {
        return (
            <section className={sectionClassName}>
                <h2 className="font-heading text-3xl text-white">{selectedFormat?.label ?? formatId}</h2>
                <p className="font-body text-base text-white mt-4">Descrizione in arrivo.</p>
            </section>
        )
    }

    return (
        <section className={sectionClassName}>
            <h1 className="font-heading text-3xl text-white">{details.title}</h1>

            <div className="mt-6 space-y-4">
                {details.intro?.map((paragraph, index) => (
                    <p key={`intro-${index}`} className="font-body text-base text-white leading-relaxed">
                        {renderInlineStrong(paragraph, `intro-${index}`)}
                    </p>
                ))}
            </div>

            <div className="mt-8 space-y-8">
                {details.sections?.map((section, sectionIndex) => (
                    <div key={`section-${sectionIndex}`} className="space-y-3">
                        {section.title && <h2 className="font-heading text-2xl text-white">{section.title}</h2>}

                        {section.paragraphs?.map((paragraph, paragraphIndex) => (
                            <p
                                key={`p-${sectionIndex}-${paragraphIndex}`}
                                className="font-body text-base text-white leading-relaxed"
                            >
                                {renderInlineStrong(paragraph, `p-${sectionIndex}-${paragraphIndex}`)}
                            </p>
                        ))}

                        {section.bullets?.length > 0 && (
                            <ul className="list-disc list-inside text-center md:list-outside md:pl-6 md:text-left space-y-1 font-body text-base text-white">
                                {section.bullets.map((bullet, bulletIndex) => (
                                    <li key={`b-${sectionIndex}-${bulletIndex}`}>
                                        {renderInlineStrong(bullet, `b-${sectionIndex}-${bulletIndex}`)}
                                    </li>
                                ))}
                            </ul>
                        )}

                        {section.paragraphsAfter?.map((paragraph, paragraphAfterIndex) => (
                            <p
                                key={`pa-${sectionIndex}-${paragraphAfterIndex}`}
                                className="font-body text-base text-white leading-relaxed"
                            >
                                {renderInlineStrong(paragraph, `pa-${sectionIndex}-${paragraphAfterIndex}`)}
                            </p>
                        ))}
                    </div>
                ))}
            </div>
        </section>
    )
}