import React from 'react';

class SortableTableColumn extends React.Component {
	
	render () {
		throw new Error('<SortableTableColumn /> should never render');
	}
}

SortableTableColumn.defaultProps = {
	cell: (data) => data
};

SortableTableColumn.propTypes = {
	columnIndex: React.PropTypes.number,
	columnKey: React.PropTypes.any,
	cell: React.PropTypes.func.isRequired
}

export default SortableTableColumn;