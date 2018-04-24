// Meteor Components
import { TAPi18n } from 'meteor/tap:i18n';
import { _ } from 'lodash';

// Template Components
import './quick-about.component.html';

Template.quickAboutComponent.helpers({

    getLine(line) {
        const mmbeLink = `<a href="https://metamask.io/" target="_new">${TAPi18n.__('component.quickInstructions.metamask')}</a>`;
        const ethLink = `<a href="https://ethereum.org/" target="_new">${TAPi18n.__('component.quickInstructions.ethereum')}</a>`;
        const coinbase = '<a href="https://www.coinbase.com/" target="_new">Coinbase.com</a>';
        return TAPi18n.__(`component.quickInstructions.line${line}`, {mmbeLink, ethLink, coinbase});
    }

});

