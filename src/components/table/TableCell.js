import React from 'react';
import RawHTML from '../raw-html';

const TableCell = (props) => (
	<td {...props}>
		<RawHTML>{props.children.toString()}</RawHTML>
	</td>
);

export default TableCell;