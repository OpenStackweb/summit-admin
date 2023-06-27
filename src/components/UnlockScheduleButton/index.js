import React, {useRef, useState} from 'react';
import PropTypes from 'prop-types';
import styles from './index.module.less';
import {Modal} from "react-bootstrap";
import ReactTooltip from "react-tooltip";
import {epochToMoment} from "openstack-uicore-foundation/lib/utils/methods";

const UnlockScheduleButton = ({track = null, onSubmit, lock = null, disabled, className = ''}) => {
    const note = useRef('');
    const [show, setShow] = useState(false);
    const createdBy = lock && `${lock.created_by?.member?.first_name} ${lock.created_by?.member?.last_name}`;
    const createdDate = lock && epochToMoment(lock.created).format('M/D h:mm a');
    
    const lockCopy = lock ? <p>This track has been locked by {createdBy} on {createdDate} UTC</p> : null;

    const onSubmitClick = () => {
        const noteValue = note.current.value;
        setShow(false);
        onSubmit(noteValue);
    };

    const onClick = (ev) => {
        ev.preventDefault();
        setShow(true);
    };
    
    return (
        <>
            <button
              className={`btn ${lock ? 'btn-primary' : 'btn-default'} ${className}`}
              onClick={onClick}
              disabled={disabled || !lock}
            >
                {lock ?  'Unlock' : 'Not locked'}
            </button>
            <Modal show={show} onHide={() => setShow(false)} dialogClassName={styles.modalWrapper}>
                <Modal.Header closeButton>
                    <Modal.Title>Unlock Track Chair edition</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {lockCopy}
                    <p>
                        By clicking "Unlock", the proposed schedule for track <b>{track?.name}</b> will be unlocked for edition.
                    </p>
                    <textarea ref={note} placeholder="Note for track chairs (optional)" />
                </Modal.Body>
                <Modal.Footer>
                    <button type="button" className="btn btn-success" onClick={() => onSubmitClick()}>
                        Unlock
                    </button>
                </Modal.Footer>
            </Modal>
            <ReactTooltip />
        </>
    );
}


UnlockScheduleButton.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    track: PropTypes.object,
    lock: PropTypes.object,
    disabled: PropTypes.bool.isRequired,
    className: PropTypes.string,
};

export default UnlockScheduleButton;