import React from 'react'
import {doLogout, doLogin} from "../actions/auth-actions";
import {connect} from "react-redux";

const CHECK_SESSION_INTERVAL = 1000 * 5;

class OPSessionChecker extends React.Component {

    constructor(props) {
        super(props);
        this.receiveMessage = this.receiveMessage.bind(this);
        this.setTimer = this.setTimer.bind(this);
        this.checkSession = this.checkSession.bind(this);
        this.onSetupCheckSessionRP = this.onSetupCheckSessionRP.bind(this);
        this.reLoginDone = false;
        this.opFrame = null;
        this.setOPFrameRef = element => {
            this.opFrame = element;
        };
     }

    componentDidMount() {
        window.addEventListener("message", this.receiveMessage, false);
        this.onSetupCheckSessionRP();
    }

    checkSession()
    {
        if(this.opFrame == null ) return;
        console.log("checkSession");
        if(this.props.sessionState == null) return;
        if(this.props.clientId == null) return;
        var targetOrigin = this.props.idpBaseUrl;
        var frame = this.opFrame.contentWindow;
        var message = this.props.clientId + " " + this.props.sessionState;
        console.log("message " + message);
        frame.postMessage( message, targetOrigin);
    }

    setTimer()
    {
        console.log("setTimer");
        this.checkSession();
        window.setInterval(this.checkSession, CHECK_SESSION_INTERVAL);
    }

    onSetupCheckSessionRP(){
        if(this.opFrame == null) return;
        var sessionCheckEndpoint = this.props.idpBaseUrl + "/oauth2/check-session";
        console.log("onSetupCheckSessionRP sessionCheckEndpoint "+ sessionCheckEndpoint)
        this.opFrame.src = sessionCheckEndpoint;
    }

    receiveMessage(e)
    {
        if (e.origin !== this.props.idpBaseUrl ) {return;}
        var status = e.data;
        console.log("receiveMessage status "+ status);
        if(status == "changed" && !this.reLoginDone){
            this.reLoginDone = true;
            console.log("receiveMessage session state has changed on OP");
            this.props.doLogin()
        }
    }

    render() {
       return(
         <div>
             <iframe
                 ref={this.setOPFrameRef}
                 frameBorder="0" width="0" height="0" id="OPFrame" onLoad={this.setTimer}></iframe>
         </div>
       );
    }
}

const mapStateToProps = ({ loggedUserState }) => ({
    sessionState: loggedUserState.sessionState,
})

export default connect(mapStateToProps, {
    doLogout,
    doLogin,
})(OPSessionChecker)
