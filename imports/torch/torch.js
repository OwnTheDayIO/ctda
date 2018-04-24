// Meteor Components
import { FlowRouter } from 'meteor/kadira:flow-router';
import { TAPi18n } from 'meteor/tap:i18n';
import { _ } from 'lodash';

// App Components
import { MeteorEthereum } from '/imports/utils/meteor-ethereum';

// Template Components
import '/imports/components/quick-about/quick-about.component';
import '/imports/components/quick-instructions/quick-instructions.component';
import '/imports/components/highest-price/highest-price.component';
import '/imports/components/highest-mileage/highest-mileage.component';
import '/imports/components/claim/claim.component';
import '/imports/components/torch-runner/torch-runner.component';
import '/imports/components/own-the-day/own-the-day.component';
import '/imports/components/footer/footer.component';
import './torch.html';


Template.torch.onRendered(function Template_torch_onRendered() {
    // Set Page Title
    Meta.setSuffix(TAPi18n.__('torch.pageTitle'));
});

Template.torch.helpers({

    isFromProductHunt() {
        const urlRef = FlowRouter.getQueryParam('ref') || '';
        return /producthunt/i.test(urlRef);
    },

    showInfoComponent() {
        const eth = MeteorEthereum.instance();
        return !eth.isReady || !eth.hasNetwork || !eth.hasWeb3Browser;
    },

    showFakeModeData() {
        const eth = MeteorEthereum.instance();
        return !eth.isReady || !eth.hasNetwork || !eth.hasWeb3Browser;
    }

});
