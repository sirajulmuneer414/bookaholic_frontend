const Input = ({
    label,
    type = 'text',
    name,
    value,
    onChange,
    placeholder = '',
    error = '',
    required = false,
    disabled = false,
    className = '',
    ...props
}) => {
    return (
        <div className="input-group">
            {label && (
                <label htmlFor={name} className="input-label">
                    {label} {required && <span className="text-error">*</span>}
                </label>
            )}
            <input
                id={name}
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                required={required}
                className={`input-field ${error ? 'error' : ''} ${className}`}
                {...props}
            />
            {error && <span className="input-error">{error}</span>}
        </div>
    );
};

export default Input;
