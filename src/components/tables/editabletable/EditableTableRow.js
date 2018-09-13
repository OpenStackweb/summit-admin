import React from 'react';

export default class EditableTableRow extends React.Component {

    render() {
        const { children, even, id } = this.props;

        return (
            <tr id={id} role="row" className={even ? 'even' : 'odd'}>
                {children}
            </tr>
        );
    }
}
