// Meteor Components
import { _ } from 'lodash';

// App Components
import { MeteorEthereum } from '/imports/utils/meteor-ethereum';
import { Contract } from '/imports/contract/contract-interface';
import { Helpers } from '/imports/utils/common';

// Player-Data
import {
    CurrentRunner
} from '/imports/utils/current-player-data';

// Template Components
import '/imports/components/loading/loading.component';
import './torch-runner.component.html';



Template.torchRunnerComponent.onCreated(function Template_torchRunnerComponent_onCreated() {
    const instance = this;
    instance.eth = MeteorEthereum.instance();
    instance.contract = Contract.instance();

});

Template.torchRunnerComponent.helpers({

    isLoaded() {
        return true;
    },

    showLoading() {
        const tplData = Template.currentData();
        return tplData.showLoading || false;
    },

    getTorchRunner() {
        return CurrentRunner.nickname;
    },

    getTorchRunnerAddress() {
        return CurrentRunner.address;
    },

    getColorFromAddress() {
        const address = CurrentRunner.address;
        if (_.isEmpty(address)) { return ''; }
        return Helpers.getStylesForAddress(address);
    }

});
