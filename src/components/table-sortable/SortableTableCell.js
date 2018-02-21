import React from 'react';

const SortableTableCell = (props) => (
	<td {...props}>{props.children}</td>
);

export default SortableTableCell;