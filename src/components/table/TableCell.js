import React from 'react';
import RawHTML from '../raw-html';

const TableCell = (props) => {

	let value = (props.children) ? props.children.toString() : '';

	return (
		<td {...props}>
			<RawHTML>{value}</RawHTML>
		</td>
	);
};

export default TableCell;