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
        // add event listener to receive messages from idp through OP frame
        window.addEventListener("message", this.receiveMessage, false);
        // set up op frame
        this.onSetupCheckSessionRP();
    }

    rpCheckSessionStateFrameOnLoad(event){
        // this is called bc we set the RP frame to check the session state with promp=none
        console.log("OPSessionChecker::rpCheckSessionStateFrameOnLoad");
        this.props.onFinishSessionStateCheck();
        let resultUrl = new URI(event.target.contentDocument.URL);
        // test the result Url
        console.log("OPSessionChecker::rpCheckSessionStateFrameOnLoad - resultUrl "+resultUrl);
        if(resultUrl.hasQuery("error")){
            let error = resultUrl.query(true).error;
            console.log("OPSessionChecker::rpCheckSessionStateFrameOnLoad - error "+error);
            // check session state with prompt none failed do logout
            let backUrl = new URI(window.location);
            this.props.doLogout(backUrl.pathname());
            return;
        }
        // no error we still logged so re init the checking
        // set up op frame
        this.onSetupCheckSessionRP();
    }

    checkSession()
    {
        console.log("OPSessionChecker::checkSession");

        if(this.opFrame == null ){
            console.log("OPSessionChecker::checkSession - this.opFrame == null ");
            return;
        }

        if(this.props.sessionState == null){
            console.log("OPSessionChecker::checkSession - this.props.sessionState == null ");
            return;
        }

        if(this.props.clientId == null){
            console.log("OPSessionChecker::checkSession - this.props.clientId == null ");
            return;
        }
        let targetOrigin = this.props.idpBaseUrl;
        let frame = this.opFrame.contentWindow;
        let message = this.props.clientId + " " + this.props.sessionState;
        console.log("OPSessionChecker::checkSession - message" + message);
        // postMessage to the OP iframe
        frame.postMessage(message, targetOrigin);
    }

    setTimer()
    {
        console.log("OPSessionChecker::setTimer");

        if(!this.props.isLoggedUser){
            console.log("OPSessionChecker::setTimer - !this.props.isLoggedUser");
            return;
        }

        if(this.props.checkingSessionState){
            console.log("OPSessionChecker::setTimer - this.props.checkingSessionState");
            return;
        }

        this.checkSession();
        this.interval = window.setInterval(this.checkSession, CHECK_SESSION_INTERVAL);
    }

    onSetupCheckSessionRP(){
        // https://openid.net/specs/openid-connect-session-1_0.html#OPiframe
        console.log("OPSessionChecker::onSetupCheckSessionRP");
        if(this.opFrame == null){
            console.log("OPSessionChecker::onSetupCheckSessionRP - opFrame is null");
            return;
        }
        const sessionCheckEndpoint = `${this.props.idpBaseUrl}/oauth2/check-session`;
        console.log("OPSessionChecker::onSetupCheckSessionRP - sessionCheckEndpoint "+ sessionCheckEndpoint);
        this.opFrame.src = sessionCheckEndpoint;
    }

    receiveMessage(e)
    {
        console.log("OPSessionChecker::receiveMessage");
        console.log("OPSessionChecker::receiveMessage - e.origin "+e.origin);
        if (e.origin !== this.props.idpBaseUrl ) {
            console.log("OPSessionChecker::receiveMessage - e.origin !== this.props.idpBaseUrl");
            return;
        }
        let status = e.data;
        console.log("OPSessionChecker::receiveMessage - status "+ status);
        console.log("OPSessionChecker::receiveMessage - this.props.checkingSessionState "+ this.props.checkingSessionState);
        console.log("OPSessionChecker::receiveMessage - this.props.isLoggedUser "+ this.props.isLoggedUser);
        if(status == "changed" && !this.props.checkingSessionState && this.props.isLoggedUser){
            console.log("OPSessionChecker::receiveMessage - session state has changed on OP");
            // signal session start check
            this.props.onStartSessionStateCheck();
            // kill timer
            window.clearInterval(this.interval);
            this.interval = null;

            let url =  getAuthUrl(null, 'none', this.props.idToken);
            // https://openid.net/specs/openid-connect-session-1_0.html#RPiframe
            // set the frame to idp
            // doing a promt to check if session is still alive, if so
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
