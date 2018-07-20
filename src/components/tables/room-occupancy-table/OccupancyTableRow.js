import React from 'react';

const OccupancyTableRow = (props) => (
	<tr role="row" className={props.even ? 'even' : 'odd'}>
		{props.children}
	</tr>
);

export default OccupancyTableRow;
