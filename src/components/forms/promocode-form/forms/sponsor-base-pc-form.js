import React from "react";
import T from "i18n-react";
import {Input, SponsorInput} from "openstack-uicore-foundation/lib/components";
import MemberBasePCForm from "./member-base-pc-form";
import {hasErrors} from "../../../../utils/methods";

const SponsorBasePCForm = (props) => (
  <>
    <div className="row form-group">
      <div className="col-md-6">
        <label> {T.translate("edit_promocode.sponsor")} *</label>
        <SponsorInput
          id="sponsor"
          value={props.entity.sponsor}
          onChange={props.handleChange}
          summitId={props.summit.id}
          allowCreate
          onCreate={props.onCreateCompany}
          error={props.hasErrors('sponsor_id')}
        />
      </div>
      <div className="col-md-6">
        <label> {T.translate("edit_promocode.contact_email")} *</label>
        <Input
          id="contact_email"
          className="form-control"
          error={props.hasErrors('contact_email')}
          onChange={props.handleChange}
          value={props.entity.contact_email}
        />
      </div>
    </div>
  </>
);

export default SponsorBasePCForm;
