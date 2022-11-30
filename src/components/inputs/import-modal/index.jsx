import React, {useState} from 'react';
import {Modal} from "react-bootstrap";
import T from "i18n-react";
import {UploadInput} from "openstack-uicore-foundation/lib/components";


export default ({title, children, show, wrapperClass, onHide, onIngest}) => {
  const [importFile, setImportFile] = useState(null);

  const handleImport = () => {
    onIngest(importFile);
    setImportFile(null);
  }

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="row">
          <div className="col-md-12" style={{marginBottom: 20}}>
            Format must be the following: (Minimal data required)<br/>
            {children}
          </div>
          <div className={`col-md-12 ${wrapperClass}`}>
            <UploadInput
              value={importFile?.name}
              handleUpload={(file) => setImportFile(file)}
              handleRemove={() => setImportFile(null)}
              className="dropzone col-md-6"
              multiple={false}
              accept=".csv"
            />
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button disabled={!importFile} className="btn btn-primary" onClick={handleImport}>
          {T.translate("general.ingest")}
        </button>
      </Modal.Footer>
    </Modal>
  );
}