import React from "react";
import T from "i18n-react";

const EmailRedeemForm = (props) => (
  <>
    <div className="row form-group checkboxes-div">
      <div className="col-md-3">
        <div className="form-check abc-checkbox">
          <input disabled type="checkbox" id="email_sent" checked={props.entity.email_sent}
                 onChange={props.handleChange} className="form-check-input"/>
          <label className="form-check-label" htmlFor="email_sent">
            {T.translate("edit_promocode.email_sent")}
          </label>
        </div>
      </div>
      <div className="col-md-3">
        <div className="form-check abc-checkbox">
          <input disabled type="checkbox" id="redeemed" checked={props.entity.redeemed}
                 onChange={props.handleChange} className="form-check-input"/>
          <label className="form-check-label" htmlFor="redeemed">
            {T.translate("edit_promocode.redeemed")}
          </label>
        </div>
      </div>
      {props.entity.id !== 0 &&
        <div className="col-md-3">
          <input type="button" onClick={props.handleSendEmail}
                 className="btn btn-default pull-right" value={T.translate("edit_promocode.send_email")}/>
        </div>
      }
    </div>
  </>
);

export default EmailRedeemForm;