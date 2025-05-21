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
import InventoryItemMetaFieldForm from "./inventory-item-meta-field-form";
import { scrollToError, shallowEqual, hasErrors } from "../../utils/methods";
import {
  MAX_INVENTORY_IMAGE_UPLOAD_SIZE,
  MAX_INVENTORY_IMAGES_UPLOAD_QTY,
  ALLOWED_INVENTORY_IMAGE_FORMATS
} from "../../utils/constants";

const InventoryItemForm = ({
  entity: initialEntity,
  errors: initialErrors,
  onMetaFieldTypeDeleted,
  onMetaFieldTypeValueDeleted,
  onImageDeleted,
  onSubmit
}) => {
  const repeaterRef = useRef(null);
  const [entity, setEntity] = useState({ ...initialEntity });
  const [errors, setErrors] = useState(initialErrors);

  const mediaType = {
    max_size: MAX_INVENTORY_IMAGE_UPLOAD_SIZE,
    max_uploads_qty: MAX_INVENTORY_IMAGES_UPLOAD_QTY,
    type: {
      allowed_extensions: ALLOWED_INVENTORY_IMAGE_FORMATS
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

  const handleImageUploadComplete = (response) => {
    if (response) {
      const image = {
        file_path: `${response.path}${response.name}`,
        filename: response.name
      };
      setEntity((prevEntity) => ({
        ...prevEntity,
        meta_fields: getNormalizedMetaFields(),
        images: [...prevEntity.images, image]
      }));
    }
  };

  const handleRemoveImage = (imageFile) => {
    const images = entity.images.filter(
      (image) => image.filename != imageFile.name
    );
    setEntity((prevEntity) => ({
      ...prevEntity,
      meta_fields: getNormalizedMetaFields(),
      images
    }));

    if (onImageDeleted && entity.id && imageFile.id) {
      onImageDeleted(entity.id, imageFile.id);
    }
  };

  const getMediaInputValue = () =>
    entity.images.length > 0
      ? entity.images.map((img) => ({
          ...img,
          filename: img.filename ?? img.file_path ?? img.file_url
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
      text: `${T.translate("edit_inventory_item.delete_meta_field_warning")} ${
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
    <InventoryItemMetaFieldForm
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
          <label>{T.translate("edit_inventory_item.code")} *</label>
          <Input
            id="code"
            className="form-control"
            error={hasErrors("code", errors)}
            onChange={handleChange}
            value={entity.code}
          />
        </div>
        <div className="col-md-8">
          <label>{T.translate("edit_inventory_item.name")} *</label>
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
          <label>{T.translate("edit_inventory_item.description")} *</label>
          <TextEditorV3
            id="description"
            value={entity.description}
            onChange={handleChange}
            error={hasErrors("description", errors)}
            license={process.env.JODIT_LICENSE_KEY}
          />
        </div>
      </div>

      <div className="row form-group">
        <div className="col-md-4">
          <label>{T.translate("edit_inventory_item.default_quantity")}</label>
          <Input
            id="default_quantity"
            className="form-control"
            type="number"
            error={hasErrors("default_quantity", errors)}
            onChange={handleChange}
            value={entity.default_quantity}
          />
        </div>
        <div className="col-md-4">
          <label>
            {T.translate("edit_inventory_item.quantity_limit_per_show")}
          </label>
          <Input
            id="quantity_limit_per_show"
            className="form-control"
            type="number"
            error={hasErrors("quantity_limit_per_show", errors)}
            onChange={handleChange}
            value={entity.quantity_limit_per_show}
          />
        </div>
        <div className="col-md-4">
          <label>
            {T.translate("edit_inventory_item.quantity_limit_per_sponsor")}
          </label>
          <Input
            id="quantity_limit_per_sponsor"
            className="form-control"
            type="number"
            error={hasErrors("quantity_limit_per_sponsor", errors)}
            onChange={handleChange}
            value={entity.quantity_limit_per_sponsor}
          />
        </div>
      </div>

      <div className="row form-group">
        <div className="col-md-4">
          <label>{T.translate("edit_inventory_item.early_bird_rate")}</label>
          <Input
            id="early_bird_rate"
            className="form-control"
            type="number"
            error={hasErrors("early_bird_rate", errors)}
            onChange={handleChange}
            value={entity.early_bird_rate}
          />
        </div>
        <div className="col-md-4">
          <label>{T.translate("edit_inventory_item.standard_rate")}</label>
          <Input
            id="standard_rate"
            className="form-control"
            type="number"
            error={hasErrors("standard_rate", errors)}
            onChange={handleChange}
            value={entity.standard_rate}
          />
        </div>
        <div className="col-md-4">
          <label>{T.translate("edit_inventory_item.onsite_rate")}</label>
          <Input
            id="onsite_rate"
            className="form-control"
            type="number"
            error={hasErrors("onsite_rate", errors)}
            onChange={handleChange}
            value={entity.onsite_rate}
          />
        </div>
      </div>

      <hr />

      <div className="row form-group">
        <div className="col-md-12">
          <label>{T.translate("edit_inventory_item.meta_fields")}</label>
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
          <label> {T.translate("edit_inventory_item.images")}</label>
          <UploadInputV2
            id="image"
            onUploadComplete={handleImageUploadComplete}
            value={getMediaInputValue()}
            mediaType={mediaType}
            onRemove={handleRemoveImage}
            postUrl={`${window.FILE_UPLOAD_API_BASE_URL}/api/v1/files/upload`}
            error={hasErrors("image", errors)}
            djsConfig={{ withCredentials: true }}
            maxFiles={mediaType.max_uploads_qty}
            canAdd={
              mediaType.is_editable ||
              entity.images.length < mediaType.max_uploads_qty
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

export default InventoryItemForm;
