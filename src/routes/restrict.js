/**
 * Copyright 2017 OpenStack Foundation
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

import React from 'react';
import { connect } from 'react-redux';
import UnAuthorizedPage from '../pages/unauthorized-page'
import Member from '../models/member'

const Restrict = (WrappedComponent, route) => {

    const mapStateToProps = ({ loggedUserState }) => ({
        member: loggedUserState.member
    })

    class WithAuthorization extends React.Component {


        render() {
            let {member} = this.props;
            let memberObj = new Member(member);
            let hasAccess = memberObj.hasAccess(route);

            if (hasAccess) {
                return <WrappedComponent {...this.props} />
            } else {
                return <UnAuthorizedPage />
            }
        }
    }

    return connect(mapStateToProps, {})(WithAuthorization)
}


export default Restrict

