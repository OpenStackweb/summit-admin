import React from "react";
import T from "i18n-react";
import {DateTimePicker, Dropdown, Input, TextArea} from "openstack-uicore-foundation/lib/components";
import {epochToMomentTimeZone} from "openstack-uicore-foundation/lib/utils/methods";

const BasePCForm = (props) => {

  let badge_features_ddl = props.summit.badge_features.map(f => ({label:f.name, value:f.id}));
  const qtyAvailableDisabled = ['SPEAKERS_PROMO_CODE', 'SPEAKERS_DISCOUNT_CODE', 'PRE_PAID_PROMO_CODE', 'PRE_PAID_DISCOUNT_CODE'].includes(props.entity.class_name);

  return (
    <>
      <div className="row form-group">
        <div className="col-md-4">
          <label> {T.translate("edit_promocode.quantity_available")} </label>
          <Input
            id="quantity_available"
            type="number"
            value={props.entity.quantity_available}
            onChange={props.handleChange}
            className="form-control"
            disabled={qtyAvailableDisabled}
          />
        </div>
        <div className="col-md-4">
          <label> {T.translate("edit_promocode.quantity_used")}</label>
          <Input
            id="quantity_used"
            type="number"
            value={props.entity.quantity_used || 0}
            onChange={props.handleChange}
            className="form-control"
            disabled
          />
        </div>
      </div>
      <div className="row form-group">
        <div className="col-md-4">
          <label> {T.translate("edit_promocode.valid_from_date")} (00:00 hrs)</label>
          <DateTimePicker
            id="valid_since_date"
            onChange={props.handleChange}
            format={{date: "YYYY-MM-DD", time: false}}
            timezone={props.summit.time_zone_id}
            value={epochToMomentTimeZone(props.entity.valid_since_date, props.summit.time_zone_id)}
          />
        </div>
        <div className="col-md-4">
          <label> {T.translate("edit_promocode.valid_until_date")} (00:00 hrs)</label>
          <DateTimePicker
            id="valid_until_date"
            onChange={props.handleChange}
            format={{date: "YYYY-MM-DD", time: false}}
            timezone={props.summit.time_zone_id}
            value={epochToMomentTimeZone(props.entity.valid_until_date, props.summit.time_zone_id)}
          />
        </div>
      </div>
      <div className="row form-group">
        <div className="col-md-12">
          <label> {T.translate("edit_promocode.badge_features")}</label>

          <div className="form-check abc-checkbox">
            <input type="checkbox" id="badge_features_apply_to_all_tix_retroactively" checked={props.entity.badge_features_apply_to_all_tix_retroactively}
                   onChange={props.handleChange} className="form-check-input"/>
            <label className="form-check-label" htmlFor="badge_features_apply_to_all_tix_retroactively">
              {T.translate("edit_promocode.badge_features_apply_to_all_tix_retroactively")}
            </label>
          </div>

          <Dropdown
            id="badge_features"
            value={props.entity.badge_features}
            onChange={props.handleChange}
            placeholder={T.translate("edit_promocode.placeholders.select_badge_features")}
            options={badge_features_ddl}
            isMulti
          />
        </div>
      </div>
      <div className="row form-group">
        <div className="col-md-12">
          <label> {T.translate("edit_promocode.notes")}</label>
          <TextArea
            id="notes"
            value={props.entity.notes}
            onChange={props.handleChange}
            className="form-control"
          />
        </div>
      </div>
    </>
  );
};

export default BasePCForm;