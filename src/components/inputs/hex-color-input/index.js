import React, { useState } from 'react'
import styles from './index.module.less';
import Sketch from '@uiw/react-color-sketch';

const HexColorInput = ({ onChange, id, className, value }) => {

    const [displayColorPicker, setDisplayColorPicker] = useState(false);
    const [hexColor, setHexColor] = useState(value);

    const handlePopupClose = () => {

        const newEvent = {
            target: {
                value: hexColor,
                id: id,
                type: 'hexcolorinput'
            }
        }

        onChange(newEvent);
        setDisplayColorPicker(false);
    }

    return (
        <div className={`${styles.colorWrapper} ${className}`} onClick={() => !displayColorPicker && setDisplayColorPicker(true)}>
            {value}
            {value && <div className={styles.colorSquare} style={{ backgroundColor: value }} />}
            {displayColorPicker ?
                <div className={styles.popover}>
                    <div className={styles.cover} onClick={() => handlePopupClose()} />
                    <Sketch
                        key={`color-picker-${value}`}
                        style={{padding: 5}}
                        disableAlpha={true}
                        presetColors={false}
                        onChange={(color) => {
                            setHexColor(color.hex);
                        }}
                        id={id}
                        color={hexColor}
                    />
                </div>
                :
                null
            }
        </div>
    );
}

export default HexColorInput;