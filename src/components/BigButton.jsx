export default function BigButton({
    className = "",
    href,
    type = "button",
    disabled = false,
    onClick,
    icon,
    children,
    label,
    ...rest
}) {
    const content = children ?? label
    const classes = `big-button text-primary font-body w-[305px] h-[305px] p-4 bg-background rounded-full font-light text-xs md:text-base cursor-pointer flex flex-col items-center justify-center gap-3 text-center ${className}`

    if (typeof href === "string" && href.length > 0) {
        return (
            <a
                href={href}
                className={classes}
                aria-disabled={disabled ? "true" : undefined}
                onClick={onClick}
                {...rest}
            >
                {icon}
                {content}
            </a>
        )
    }

    return (
        <button
            type={type}
            disabled={disabled}
            className={classes}
            onClick={onClick}
            {...rest}
        >
            {icon}
            {content}
        </button>
    )
}
