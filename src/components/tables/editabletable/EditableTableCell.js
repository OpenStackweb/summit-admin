import React from 'react';

const EditableTableCell = (props) => {
    if (props.is_edit) {
        return (
            <td>
                <input className="form-control" defaultValue={props.children} name={props.name} id={props.id} onChange={props.handleChange}/>
            </td>
        );
    } else {
        return (
            <td>{props.children}</td>
        );
    }

};

export default EditableTableCell;