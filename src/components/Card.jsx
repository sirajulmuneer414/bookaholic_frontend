const Card = ({ children, className = '', hover = false, glass = false, onClick, ...rest }) => {
    const classes = [
        'card',
        glass && 'card-glass',
        hover && 'card-hover',
        className
    ].filter(Boolean).join(' ');

    return (
        <div
            className={classes}
            onClick={onClick}
            {...rest}
        >
            {children}
        </div>
    );
};

export default Card;
