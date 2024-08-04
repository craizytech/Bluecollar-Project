import React from 'react';

function Day({ day, className, ariaDisabled, disabled }) {
    return (
        <div
            className={`day ${className} ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
            aria-disabled={ariaDisabled}
            role="button"
            tabIndex={disabled ? -1 : 0}
        >
            {day.getDate()}
        </div>
    );
}

export default Day;
