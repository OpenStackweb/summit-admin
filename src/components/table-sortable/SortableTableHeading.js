import React from 'react';

class SortableTableHeading extends React.Component {

	constructor (props) {
		super(props);
	}

	render () {
		return (
			<th width={this.props.width}>
				{this.props.children}
			</th>
		);	
	}
	
}

export default SortableTableHeading;