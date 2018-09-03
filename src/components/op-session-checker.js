import React from 'react'
import {doLogout, doLogin, onStartSessionStateCheck, onFinishSessionStateCheck, getAuthUrl} from "../actions/auth-actions";
import {connect} from "react-redux";
import URI from "urijs"
const CHECK_SESSION_INTERVAL = 1000 * 10;

class OPSessionChecker extends React.Component {

    constructor(props) {
        super(props);
        this.receiveMessage = this.receiveMessage.bind(this);
        this.setTimer = this.setTimer.bind(this);
        this.checkSession = this.checkSession.bind(this);
        this.onSetupCheckSessionRP = this.onSetupCheckSessionRP.bind(this);
        this.rpCheckSessionStateFrameOnLoad = this.rpCheckSessionStateFrameOnLoad.bind(this);

        this.opFrame = null;
        this.rpCheckSessionStateFrame = null;

        this.setOPFrameRef = element => {
            this.opFrame = element;
        };

        this.setCheckSessionStateFrameRef = element => {
            this.rpCheckSessionStateFrame = element;
        };

        this.interval = null;
     }

    componentDidMount() {
        window.addEventListener("message", this.receiveMessage, false);
        this.onSetupCheckSessionRP();
    }

    rpCheckSessionStateFrameOnLoad(event){
        let resultUrl = new URI(event.target.contentDocument.URL);
        if(resultUrl.hasQuery("error")){
            // failed renew
            let backUrl = new URI(window.location);
            this.props.doLogout(backUrl.pathname());
            return;
        }
        this.props.onFinishSessionStateCheck();
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
        if(!this.props.isLoggedUser) return;
        if(this.props.checkingSessionState) return;
        console.log("setTimer");
        this.checkSession();
        this.interval = window.setInterval(this.checkSession, CHECK_SESSION_INTERVAL);
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
        if(status == "changed" && !this.props.checkingSessionState && this.props.isLoggedUser){
            this.props.onStartSessionStateCheck();
            window.clearInterval(this.interval);
            this.interval = null;
            console.log("receiveMessage session state has changed on OP");
            let url =  getAuthUrl(null, 'none', this.props.idToken);
            this.rpCheckSessionStateFrame.src = url.toString();
        }
    }

    render() {
       return(
         <div style={{height: '0px'}}>
             <iframe
                 ref={this.setOPFrameRef}
                 frameBorder="0" width="0" height="0" id="OPFrame" onLoad={this.setTimer}></iframe>
             <iframe ref={this.setCheckSessionStateFrameRef} frameBorder="0" width="0" height="0"
                     id="RPCHeckSessionStateFrame" onLoad={this.rpCheckSessionStateFrameOnLoad}></iframe>
         </div>
       );
    }
}

const mapStateToProps = ({ loggedUserState }) => ({
    sessionState: loggedUserState.sessionState,
    isLoggedUser: loggedUserState.isLoggedUser,
    idToken: loggedUserState.idToken,
    checkingSessionState: loggedUserState.checkingSessionState,
})

export default connect(mapStateToProps, {
    doLogout,
    doLogin,
    onStartSessionStateCheck,
    onFinishSessionStateCheck,
})(OPSessionChecker)
