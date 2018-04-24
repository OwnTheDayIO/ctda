/**
 * Application-Wide Configurations
 */
/** @namespace process.env.NODE_ENV */
/** @namespace process.env.CONTRACT_ADDRESS */
/** @namespace Meteor.defer */
/** @namespace Meteor.isTest */

// Meteor Components
import { FlowRouter } from 'meteor/kadira:flow-router';
import { GoogleMaps } from 'meteor/dburles:google-maps';

// Twitter Bootstrap - Custom JS
import '/imports/startup/client/bootstrap/src';
import '/imports/startup/client/bootstrap/InputSpinner';

// App Components
import './meta';
import './i18n';
import './cdn-assets';
import '/imports/utils/template-helpers';
import './routes';
import './ethereum';
import './spinner';
import { log } from '/imports/utils/logging';

import {
    APP_NAME,
    APP_VERSION,
    CONTRACT_ADDRESS
} from '/imports/utils/global-constants';


// Disconnect any Meteor Server
if (location.host !== 'localhost:3000' && location.host !== '127.0.0.1:3000' && typeof MochaWeb === 'undefined') {
    Meteor.disconnect();
}

//
// Client Startup - Equivalent to DOMReady event
//
Meteor.startup(function clientIndexStartup() {
    log.log(`${APP_NAME} - version ${APP_VERSION}`);
    log.log(`Check out our Ethereum Contract here: https://etherscan.io/address/${CONTRACT_ADDRESS.TORCH['1']}#code`);
    log.log('We hope you have a great day!');

    window.GoogleMaps = GoogleMaps;
    GoogleMaps.load({v: '3.exp', key: 'AIzaSyDU4gIdm5co28Py_qlXVnZBY2JylfGIw80', libraries: 'drawing,geometry'});
});
