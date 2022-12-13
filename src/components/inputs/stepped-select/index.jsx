import React from 'react';
import styles from './index.module.less';

export default ({value, options, onChange, ...rest}) => {

  const handleChange = (increment) => {
    const currentOptionKey = options.findIndex(op => op.value === value);
    if (currentOptionKey >= 0) {
      if (increment) {
        if (currentOptionKey < options.length -1) {
          onChange(options[currentOptionKey + 1].value);
        }
      } else {
        if (currentOptionKey > 0) {
          onChange(options[currentOptionKey - 1].value);
        }
      }
    }
  };

  const valueLabel = options.find(op => op.value === value).label;

  return (
    <div className={styles.wrapper} {...rest}>
      <button className="btn btn-default" onClick={() => handleChange(false)}>
        <i className="fa fa-minus"/>
      </button>
      <span className={styles.valueBox}>{valueLabel}</span>
      <button className="btn btn-default" onClick={() => handleChange(true)}>
        <i className="fa fa-plus"/>
      </button>
    </div>
  );
};
