import React from 'react';
import Switch from "react-switch";
import styles from './index.module.less';

export default ({ flags, actionTypes, onChange, className, eventId, selectionPlanId }) => {

	return (
		<div className={`${styles.wrapper} ${className} row`}>
			{actionTypes.map(at => {
				const flag = flags.find(f => f.type_id === at.id && f.presentation_id === eventId);

				return (
					<label className="col-md-6" key={`flag-${at.id}`}>
						<Switch
							onChange={checked => onChange(checked, eventId, at.id, selectionPlanId)
							}
							checked={flag?.is_completed ?? false}
							checkedIcon={false}
							uncheckedIcon={false}
						/>
						<span>{at.label}</span>
					</label>
				)
			})}
		</div>
	);
};