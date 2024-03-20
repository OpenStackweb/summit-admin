import React from "react";
import T from "i18n-react";
import BasePCForm from "./base-pc-form";
import {Input} from "openstack-uicore-foundation/lib/components";
import {DiscountTicketTable} from "../../../tables/dicount-ticket-table";

const DiscountBasePCForm = (props) => (
  <>
    <BasePCForm {...props} />

    <div className="row form-group">
      <div className="col-md-4">
        <label>
          {T.translate("edit_promocode.apply_to_all_tix_discounts")}
        </label>
        <div className="form-check abc-checkbox">
          <input type="checkbox" id="apply_to_all_tix" checked={props.entity.apply_to_all_tix}
                 onChange={props.handleChange} className="form-check-input"/>
          <label className="form-check-label" htmlFor="apply_to_all_tix">
            {T.translate("edit_promocode.apply_to_all_tix")}
          </label>
        </div>
      </div>
    </div>
    {props.entity.apply_to_all_tix &&
      <div className="row form-group">
        <div className="col-md-4">
          <label> {T.translate("edit_promocode.amount")} ($) *</label>
          <Input
            id="amount"
            type="number"
            min="0"
            value={props.entity.amount}
            onChange={props.handleChange}
            className="form-control"
            disabled={props.entity.rate > 0}
          />
        </div>
        <div className="col-md-2 text-center">
          <label> {T.translate("edit_promocode.or")} </label>
        </div>
        <div className="col-md-4">
          <label> {T.translate("edit_promocode.rate")} (% discount) *</label>
          <Input
            id="rate"
            type="number"
            min="0"
            max="100"
            value={props.entity.rate}
            onChange={props.handleChange}
            className="form-control"
            disabled={props.entity.amount > 0}
          />
        </div>
      </div>
    }
    {!props.entity.apply_to_all_tix &&
      <>
        {props.entity.id !== 0 &&
          <DiscountTicketTable
            ownerId={props.entity.id}
            data={props.entity.ticket_types_rules}
            ticketTypes={props.summit.ticket_types}
          />
        }
        {props.entity.id === 0 &&
          <p>Please save the promocode before adding rates to different ticket types</p>
        }
      </>
    }
  </>
);

export default DiscountBasePCForm;
