import React from 'react';
import PropTypes from 'prop-types';


class OccupancyTableColumn extends React.Component {

	render () {
		throw new Error('<OccupancyTableColumn /> should never render');
	}
}

OccupancyTableColumn.defaultProps = {
	sortFunc: (a,b) => (a < b ? -1 : (a > b ? 1 : 0)),
	sortable: true,
	cell: (data) => data
};

OccupancyTableColumn.propTypes = {
	columnIndex: PropTypes.number,
	columnKey: PropTypes.any,
	sortable: PropTypes.bool,
	sortDir: PropTypes.oneOf([null, 1, -1]),
	cell: PropTypes.func.isRequired
}

export default OccupancyTableColumn;
