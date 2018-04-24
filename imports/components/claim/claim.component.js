// Meteor Components
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Random } from 'meteor/random';
import { _ } from 'lodash';

// App Components
import { MeteorEthereum } from '/imports/utils/meteor-ethereum';
import { Contract } from '/imports/contract/contract-interface';
import { Helpers } from '/imports/utils/common';
import { Notify } from '/imports/utils/notify';

import { MINIMUM_TORCH_PRICE } from '/imports/utils/global-constants';

// Player-Data
import {
    CurrentOffer,
    CurrentPlayer,
    CurrentRunner
} from '/imports/utils/current-player-data';

// Template Components
import './claim.component.html';


Template.claimComponent.onCreated(function Template_claimComponent_onCreated() {
    const instance = this;
    instance.eth = MeteorEthereum.instance();
    instance.contract = Contract.instance();

    instance.totalTokens = new ReactiveVar('');
    instance.autorun(() => {
        if (!instance.eth.hasAccount) { return; }
        if (!CurrentOffer.price) { return; }

        instance.contract.etherToTokens(instance.eth.web3.toWei(CurrentOffer.price))
            .then(result => {
                instance.totalTokens.set(instance.eth.web3.fromWei(result).toString(10));
            })
            .catch(log.error);
    });
});

Template.claimComponent.onRendered(function Template_claimComponent_onRendered() {
    const instance = this;

    $(instance.find('#torchOfferPrice')).InputSpinner({
        id: 'torchOfferPriceSpinner',
        decrementButton: '<i class="fas fa-minus"></i>',
        incrementButton: '<i class="fas fa-plus"></i>',
        groupClass: 'input-group-spinner input-group-lg',
        buttonsClass: 'btn-secondary'
        // locale: null
    });

    // Init Popover
    instance.autorun(() => {
        const address = CurrentRunner.address;
        Meteor.setTimeout(() => $('[data-toggle="claim-popover"]').popover({trigger: 'hover', placement: 'bottom', container: 'body'}), 1000);
    });
});

Template.claimComponent.helpers({

    getCurrentOffer() {
        return CurrentOffer.price.toString(10);
    },

    canTakeTorch() {
        const instance = Template.instance();
        if (!instance.eth.hasAccount || !CurrentPlayer.address) { return false; }
        return (CurrentRunner.address !== CurrentPlayer.address);
    },

    isHoldingTorch() {
        return (CurrentRunner.address === CurrentPlayer.address);
    },

    getPriceToTokens() {
        const instance = Template.instance();
        return instance.totalTokens.get();
    }

});

Template.claimComponent.events({

    'change #torchOfferPrice' : (event, instance) => {
        const $target = $(event.currentTarget);
        if (event.keyCode === 13) {
            // Enter Key
        }

        // Update internal storage
        CurrentOffer.price = parseFloat($target.val());
    },

    'click [data-action]' : (event, instance) => {
        const $spinner = $('#torchOfferPriceSpinner');
        const $target = $(event.currentTarget);
        const action = $target.attr('data-action');
        if (action === 'min-price') {
            const min = MINIMUM_TORCH_PRICE.toString(10);
            $spinner.val(min).trigger('change');
        }
        if (action === 'max-price') {
            let max = CurrentOffer.maxPrice.toString(10);
            if (max === '0') { max = '9999999999'; }
            $spinner.val(max).trigger('change');
        }
    },

    'click [data-action="take-torch"]' : (event, instance) => {
        const runnerAddress = CurrentPlayer.address;
        const tx = {
            value : instance.eth.web3.toWei(CurrentOffer.price),
            from  : runnerAddress
        };
        log.info('tx', tx);

        instance.contract.takeTheTorch(tx)
            .then(hash => {
                log.info('success', hash);
                CurrentRunner.address = runnerAddress;
                Notify.success('Congratulations! You have taken the Torch!');
            })
            .catch(Helpers.displayFriendlyErrorAlert);

        // Close Modal
        $('#takeTorchModal').modal('hide');
    }

});
