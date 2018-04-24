// Meteor Components
import { _ } from 'lodash';

// App Components
import { MeteorEthereum } from '/imports/utils/meteor-ethereum';
import { Contract } from '/imports/contract/contract-interface';

// Leader-board Data
import {
    HighestPriceLeaders
} from '/imports/utils/leader-boards';

// Globals
import {
    MEDAL_CLASSNAME_XS
} from '/imports/utils/global-constants';

// Template Components
import '/imports/components/loading/loading.component';
import './highest-price.component.html';


Template.highestPriceComponent.onCreated(function Template_highestPriceComponent_onCreated() {
    const instance = this;
    instance.eth = MeteorEthereum.instance();
    instance.contract = Contract.instance();

});

Template.highestPriceComponent.helpers({

    isLoaded() {
        return true;
    },

    showLoading() {
        const tplData = Template.currentData();
        return tplData.showLoading || false;
    },

    fakeModeClass() {
        const tplData = Template.currentData();
        return (_.get(tplData, 'fakeMode', false)) ? 'fake-mode' : '';
    },

    getLeaders() {
        const tplData = Template.currentData();
        if (_.get(tplData, 'fakeMode', false)) {
            return [
                {nickname: 'Your Name Here', value: '123.4567890', address: '0000000000000000000000000000000000000000'},
                {nickname: 'Your Name Here', value: '12.34567890', address: '0000000000000000000000000000000000000000'},
                {nickname: 'Your Name Here', value: '1.234567890', address: '0000000000000000000000000000000000000000'}
            ];
        }
        return HighestPriceLeaders.getLeaders();
    },

    getLeaderMedal(leaderIdx) {
        return MEDAL_CLASSNAME_XS[leaderIdx];
    },

    getLeaderName(leader) {
        return leader.nickname || 'Could be You!';
    },

    getLeaderAddress(leader) {
        return leader.address;
    },

    getLeaderPrice(leader) {
        return leader.value || '0.00';
    }

});
