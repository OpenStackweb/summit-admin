import React from 'react';

class EditableTableColumn extends React.Component {
	
	render () {
		throw new Error('<EditableTableColumn /> should never render');
	}
}

EditableTableColumn.defaultProps = {
	cell: (data) => data
};

EditableTableColumn.propTypes = {
	cell: React.PropTypes.func.isRequired,
    columnKey: React.PropTypes.any
}

export default EditableTableColumn;