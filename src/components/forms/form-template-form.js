/**
 * Copyright 2024 OpenStack Foundation
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * */

import React, { useState, useEffect, useRef } from "react";
import T from "i18n-react/dist/i18n-react";
import "awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css";
import {
  Input,
  UploadInputV2
} from "openstack-uicore-foundation/lib/components";
import { TextEditorV3 } from "openstack-uicore-foundation/lib/components/inputs/editor-input-v3";
import Swal from "sweetalert2";
import FormRepeater from "../form-repeater";
import FormTemplateMetaFieldForm from "./form-template-meta-field-form";
import { scrollToError, shallowEqual, hasErrors } from "../../utils/methods";
import {
  MAX_FORM_TEMPLATE_MATERIALS_UPLOAD_SIZE,
  MAX_FORM_TEMPLATE_MATERIALS_UPLOAD_QTY,
  ALLOWED_FORM_TEMPLATE_MATERIAL_FORMATS
} from "../../utils/constants";

const FormTemplateForm = ({
  entity: initialEntity,
  errors: initialErrors,
  onMetaFieldTypeDeleted,
  onMetaFieldTypeValueDeleted,
  onMaterialDeleted,
  onSubmit
}) => {
  const repeaterRef = useRef(null);
  const [entity, setEntity] = useState({ ...initialEntity });
  const [errors, setErrors] = useState(initialErrors);

  const mediaType = {
    max_size: MAX_FORM_TEMPLATE_MATERIALS_UPLOAD_SIZE,
    max_uploads_qty: MAX_FORM_TEMPLATE_MATERIALS_UPLOAD_QTY,
    type: {
      allowed_extensions: ALLOWED_FORM_TEMPLATE_MATERIAL_FORMATS
    }
  };

  useEffect(() => {
    scrollToError(initialErrors);
    if (!shallowEqual(initialEntity, entity)) {
      setEntity({ ...initialEntity });
      setErrors({});
    }

    if (!shallowEqual(initialErrors, errors)) {
      setErrors({ ...initialErrors });
    }
  }, [initialEntity, initialErrors]);

  const handleChange = (ev) => {
    const { id, value, checked, type } = ev.target;
    setEntity((prevEntity) => ({
      ...prevEntity,
      meta_fields: getNormalizedMetaFields(),
      [id]: type === "checkbox" ? checked : value
    }));
    setErrors((prevErrors) => ({ ...prevErrors, [id]: "" }));
  };

  const handleMaterialUploadComplete = (response) => {
    if (response) {
      const material = {
        file_path: `${response.path}${response.name}`,
        filename: response.name
      };
      setEntity((prevEntity) => ({
        ...prevEntity,
        meta_fields: getNormalizedMetaFields(),
        materials: [...prevEntity.materials, material]
      }));
    }
  };

  const handleRemoveMaterial = (materialFile) => {
    const materials = entity.materials.filter(
      (material) => material.filename != materialFile.name
    );
    setEntity((prevEntity) => ({
      ...prevEntity,
      meta_fields: getNormalizedMetaFields(),
      materials
    }));

    if (onMaterialDeleted && entity.id && materialFile.id) {
      onMaterialDeleted(entity.id, materialFile.id);
    }
  };

  const getMediaInputValue = () =>
    entity.materials.length > 0
      ? entity.materials.map((material) => ({
          ...material,
          filename: material.filename ?? material.file_path ?? material.file_url
        }))
      : [];

  const handleSubmit = (ev) => {
    ev.preventDefault();
    entity.meta_fields = getNormalizedMetaFields();
    onSubmit(entity);
  };

  const getNormalizedMetaFields = () => {
    if (repeaterRef.current) {
      const content = repeaterRef.current.getContent();

      return content.map((item) => {
        const idSuffix = item.id;
        const newValue = Object.fromEntries(
          Object.entries(item.value).map(([key, value]) => {
            const newKey = key.replace(`_${idSuffix}`, "");
            return [newKey, value];
          })
        );
        return newValue;
      });
    }
    return [];
  };

  const initMetaFieldLines = (metaFields) => [
    ...metaFields
      .filter((metaField) => metaField.id)
      .sort((a, b) => a.id - b.id)
      .map((metaField) => ({
        id: metaField.id,
        value: { ...metaField }
      })),
    ...metaFields
      .filter((metaField) => !metaField.id)
      .map((metaField) => ({
        id: Date.now(),
        value: { ...metaField }
      }))
  ];

  const handleRemoveMetaFieldType = async (metaField) => {
    if (!onMetaFieldTypeDeleted || !metaField.value.id) {
      return true;
    }
    const result = await Swal.fire({
      title: T.translate("general.are_you_sure"),
      text: `${T.translate("edit_form_template.delete_meta_field_warning")} ${
        metaField.value.id
      }`,
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: T.translate("general.yes_delete")
    });
    if (result.value) {
      onMetaFieldTypeDeleted(entity.id, metaField.value.id);
      return true;
    }
    return false;
  };

  const handleRemoveMetaFieldTypeValue = (metaFieldId, metaFieldValueId) => {
    if (onMetaFieldTypeDeleted) {
      onMetaFieldTypeValueDeleted(entity.id, metaFieldId, metaFieldValueId);
    }
  };

  const renderMetaFieldForm = (line, updateValue) => (
    <FormTemplateMetaFieldForm
      entity={line.value}
      errors={errors}
      index={line.id}
      onChange={updateValue}
      onMetaFieldTypeValueDeleted={handleRemoveMetaFieldTypeValue}
    />
  );

  return (
    <form className="inventory-item-form">
      <input type="hidden" id="id" value={entity.id} />
      <input type="hidden" id="order" value={entity.order} />
      <div className="row form-group">
        <div className="col-md-4">
          <label>{T.translate("edit_form_template.code")} *</label>
          <Input
            id="code"
            className="form-control"
            error={hasErrors("code", errors)}
            onChange={handleChange}
            value={entity.code}
          />
        </div>
        <div className="col-md-8">
          <label>{T.translate("edit_form_template.name")} *</label>
          <Input
            id="name"
            className="form-control"
            error={hasErrors("name", errors)}
            onChange={handleChange}
            value={entity.name}
          />
        </div>
      </div>

      <div className="row form-group">
        <div className="col-md-12">
          <label>{T.translate("edit_form_template.instructions")} *</label>
          <TextEditorV3
            id="instructions"
            value={entity.instructions}
            onChange={handleChange}
            error={hasErrors("instructions", errors)}
            license={process.env.JODIT_LICENSE_KEY}
          />
        </div>
      </div>

      <hr />

      <div className="row form-group">
        <div className="col-md-12">
          <label>{T.translate("edit_form_template.meta_fields")}</label>
          <FormRepeater
            ref={repeaterRef}
            initialLines={initMetaFieldLines(entity.meta_fields)}
            renderContent={renderMetaFieldForm}
            onLineRemoveRequest={handleRemoveMetaFieldType}
          />
        </div>
      </div>

      <hr />

      <div className="row form-group">
        <div className="col-md-12">
          <label> {T.translate("edit_form_template.materials")}</label>
          <UploadInputV2
            id="material"
            onUploadComplete={handleMaterialUploadComplete}
            value={getMediaInputValue()}
            mediaType={mediaType}
            onRemove={handleRemoveMaterial}
            postUrl={`${window.FILE_UPLOAD_API_BASE_URL}/api/v1/files/upload`}
            error={hasErrors("material", errors)}
            djsConfig={{ withCredentials: true }}
            maxFiles={mediaType.max_uploads_qty}
            canAdd={
              mediaType.is_editable ||
              entity.materials.length < mediaType.max_uploads_qty
            }
            parallelChunkUploads
          />
        </div>
      </div>

      <hr />

      <div className="row">
        <div className="col-md-12 submit-buttons">
          <input
            type="button"
            onClick={handleSubmit}
            className="btn btn-primary pull-right"
            value={T.translate("general.save")}
          />
        </div>
      </div>
    </form>
  );
};

export default FormTemplateForm;
