import { useRef, useEffect } from 'react';
import './OtpInput.css';

const OtpInput = ({ length = 6, value, onChange, error }) => {
    const inputRefs = useRef([]);

    useEffect(() => {
        // Focus first input on mount
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleChange = (index, e) => {
        const val = e.target.value;

        // Only allow numbers
        if (val && !/^\d$/.test(val)) {
            return;
        }

        const newValue = value.split('');
        newValue[index] = val;
        onChange(newValue.join(''));

        // Auto-focus next input
        if (val && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === 'Backspace') {
            if (!value[index] && index > 0) {
                // If current box is empty, move to previous and clear it
                inputRefs.current[index - 1]?.focus();
                const newValue = value.split('');
                newValue[index - 1] = '';
                onChange(newValue.join(''));
            } else {
                // Clear current box
                const newValue = value.split('');
                newValue[index] = '';
                onChange(newValue.join(''));
            }
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').trim();

        // Check if pasted data is all digits and matches length
        if (/^\d+$/.test(pastedData) && pastedData.length === length) {
            onChange(pastedData);
            // Focus last input
            inputRefs.current[length - 1]?.focus();
        }
    };

    return (
        <div className="otp-input-container">
            <div className="otp-input-boxes">
                {Array.from({ length }).map((_, index) => (
                    <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={value[index] || ''}
                        onChange={(e) => handleChange(index, e)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        className={`otp-input-box ${error ? 'error' : ''}`}
                        aria-label={`OTP digit ${index + 1}`}
                    />
                ))}
            </div>
            {error && <p className="otp-error">{error}</p>}
        </div>
    );
};

export default OtpInput;
