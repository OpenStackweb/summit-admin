import React, { useState } from 'react'
import styles from './index.module.less';
import { ChromePicker } from 'react-color';

const HexColorInput = ({ onChange, id, className, value }) => {

    const [displayColorPicker, setDisplayColorPicker] = useState(false);

    const onColorChange = (color, ev) => {

        const newEvent = {
            target: {
                value: color.hex,
                id: id,
                type: 'hexcolorinput'
            }
        }

        onChange(newEvent);
    }



    return (
        <div className={`${styles.colorWrapper} ${className}`} onClick={() => !displayColorPicker && setDisplayColorPicker(true)}>
            {value}
            {value && <div className={styles.colorSquare} style={{ backgroundColor: value }} />}
            {displayColorPicker ?
                <div className={styles.popover}>
                    <div className={styles.cover} onClick={() => setDisplayColorPicker(false)} />
                    <ChromePicker
                        key={`color-picker-${value}`}
                        disableAlpha={true}
                        onChange={onColorChange}
                        id={id}
                        color={value}
                    />
                </div>
                :
                null
            }
        </div>
    );
}

export default HexColorInput;