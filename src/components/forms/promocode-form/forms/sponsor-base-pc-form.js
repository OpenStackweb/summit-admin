import React from "react";
import T from "i18n-react";
import {CompanyInput} from "openstack-uicore-foundation/lib/components";
import MemberBasePCForm from "./member-base-pc-form";

const SponsorBasePCForm = (props) => (
  <>
    <div className="row form-group">
      <div className="col-md-6">
        <label> {T.translate("edit_promocode.company")} </label>
        <CompanyInput
          id="sponsor"
          value={props.entity.sponsor}
          onChange={props.handleChange}
          summitId={props.summit.id}
          allowCreate
          onCreate={props.onCreateCompany}
          error={props.hasErrors('sponsor_id')}
        />
      </div>
    </div>
    <MemberBasePCForm {...props} />
  </>
);

export default SponsorBasePCForm;