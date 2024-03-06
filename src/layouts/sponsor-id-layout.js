import React from "react";
import { connect } from 'react-redux';
import T from "i18n-react/dist/i18n-react";
import { Switch, Route } from 'react-router-dom';
import EditSponsorPage from "../pages/sponsors/edit-sponsor-page";
import {
    getSponsor,
    resetSponsorForm,
} from "../actions/sponsor-actions";
import { Breadcrumb } from 'react-breadcrumbs';
import EditAdSponsorPage from "../pages/sponsors/edit-advertisement-sponsor-page";
import EditMaterialSponsorPage from "../pages/sponsors/edit-material-sponsor-page";
import EditSocialNetworkSponsorPage from "../pages/sponsors/edit-social-network-sponsor-page";
import EditSponsorExtraQuestion from "../pages/sponsors/edit-sponsor-extra-question-page";
import NoMatchPage from "../pages/no-match-page";

class SponsorIdLayout extends React.Component {

    constructor(props) {
        const sponsorId = props.match.params.sponsor_id;
        super(props);

        if (!sponsorId) {
            props.resetSponsorForm();
        } else {
            props.getSponsor(sponsorId);
        }

    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const oldId = prevProps.match.params.sponsor_id;
        const newId = this.props.match.params.sponsor_id;

        if (oldId !== newId) {
            if (!newId) {
                this.props.resetSponsorForm();
            } else {
                this.props.getSponsor(newId);
            }
        }
    }

    render() {
        const { match, currentSponsor } = this.props;
        let sponsorId = this.props.match.params.sponsor_id;
        const breadcrumb = (currentSponsor.id) ? currentSponsor.company.name : T.translate("general.new");

        if (sponsorId && !currentSponsor.id) return (<div />);

        return (
            <div>
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} />
                <Switch>
                    <Route path={`${match.url}/ads`} render={
                        props => (
                            <div>
                                <Breadcrumb data={{ title: 'Advertisements', pathname: match.url }} />
                                <Switch>
                                    <Route exact strict path={`${props.match.url}/new`} component={EditAdSponsorPage} />
                                    <Route path={`${props.match.url}/:advertisement_id(\\d+)`} component={EditAdSponsorPage} />
                                    <Route component={NoMatchPage} />
                                </Switch>
                            </div>
                        )}
                    />
                    <Route path={`${match.url}/materials`} render={
                        props => (
                            <div>
                                <Breadcrumb data={{ title: 'Materials', pathname: match.url }} />
                                <Switch>
                                    <Route exact strict path={`${props.match.url}/new`} component={EditMaterialSponsorPage} />
                                    <Route path={`${props.match.url}/:material_id(\\d+)`} component={EditMaterialSponsorPage} />
                                    <Route component={NoMatchPage} />
                                </Switch>
                            </div>
                        )}
                    />
                    <Route path={`${match.url}/social-networks`} render={
                        props => (
                            <div>
                                <Breadcrumb data={{ title: 'Social Networks', pathname: match.url }} />
                                <Switch>
                                    <Route exact strict path={`${props.match.url}/new`} component={EditSocialNetworkSponsorPage} />
                                    <Route path={`${props.match.url}/:social_network_id(\\d+)`} component={EditSocialNetworkSponsorPage} />
                                    <Route component={NoMatchPage} />
                                </Switch>
                            </div>
                        )}
                    />
                    <Route path={`${match.url}/extra-questions`} render={
                        props => (
                          <div>
                              <Breadcrumb data={{ title: 'Extra Questions', pathname: match.url }} />
                              <Switch>
                                  <Route exact strict path={`${props.match.url}/new`} component={EditSponsorExtraQuestion} />
                                  <Route path={`${props.match.url}/:extra_question_id(\\d+)`} component={EditSponsorExtraQuestion} />
                                  <Route component={NoMatchPage} />
                              </Switch>
                          </div>
                        )}
                    />
                    <Route strict exact path={match.url} component={EditSponsorPage} />
                    <Route component={NoMatchPage} />
                </Switch>
            </div>
        );
    }
}

const mapStateToProps = ({ currentSponsorState, currentSummitState }) => ({
    currentSponsor: currentSponsorState.entity,
    ...currentSummitState
})

export default connect(
    mapStateToProps,
    {
        getSponsor,        
        resetSponsorForm,
    }
)(SponsorIdLayout);