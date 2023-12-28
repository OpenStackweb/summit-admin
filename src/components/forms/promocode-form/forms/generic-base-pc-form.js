import React from "react";
import T from "i18n-react";
import BasePCForm from "./base-pc-form";
import {Dropdown} from "openstack-uicore-foundation/lib/components";

const GenericBasePCForm = (props) => {

  let ticket_types_ddl = props.summit.ticket_types.map(f => ({label:f.name, value:f.id}));

  return (
    <>
      <BasePCForm {...props} />
      <div className="row form-group">
        <div className="col-md-6">
          <label> {T.translate("edit_promocode.allowed_ticket_types")}</label>
          <Dropdown
            id="allowed_ticket_types"
            value={props.entity.allowed_ticket_types}
            onChange={props.handleChange}
            placeholder={T.translate("edit_promocode.placeholders.select_ticket_types")}
            options={ticket_types_ddl}
            isMulti
          />
        </div>
      </div>
    </>
  );
};

export default GenericBasePCForm;