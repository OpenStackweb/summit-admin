import React from 'react';

class EditableTableHeading extends React.Component {

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

export default EditableTableHeading;