// Meteor Components
import { FlowRouter } from 'meteor/kadira:flow-router';
import { TAPi18n } from 'meteor/tap:i18n';
import { Random } from 'meteor/random';
import { _ } from 'lodash';

// App Components
import { MeteorEthereum } from '/imports/utils/meteor-ethereum';
import { Contract } from '/imports/contract/contract-interface';
import { LocaleHelpers } from '/imports/utils/i18n-helpers';
import { Helpers } from '/imports/utils/common';
import { log } from '/imports/utils/logging';

// Player-Data
import {
    CurrentOffer,
    CurrentPlayer,
    CurrentRunner
} from '/imports/utils/current-player-data';

// Leader-Boards
import {
    HighestPriceLeaders,
    HighestMilesLeaders
} from '/imports/utils/leader-boards';

// Globals
import {
    LEADERBOARD_LIMIT,
    ACCOUNT_WATCH_INTERVAL,
    CONTRACT_WATCH_INTERVAL
} from '/imports/utils/global-constants';

// Template Components
import '/imports/modals/about/about.modal';
import '/imports/modals/faq/faq.modal';
import '/imports/modals/tos/tos.modal';
import '/imports/modals/error/error.modal';
import '/imports/modals/nickname/nickname.modal';
import './body.html';

let _contractMonitorId;
let _accountMonitorId;

Template.bodyLayout.onCreated(function Template_bodyLayout_onCreated() {
    const instance = this;
    instance.eth = MeteorEthereum.instance();
    instance.contract = Contract.instance();

    // Get Referral Link
    const referralAddress = FlowRouter.getQueryParam('r');
    if (referralAddress && referralAddress.length) {
        log.info('using referral address:', referralAddress);
        instance.contract.referralAddress = referralAddress;
        FlowRouter.setQueryParams({r: null});
    }

    instance.autorun(computation => {
        if (!instance.eth.hasNetwork) { return; }
        computation.stop();

        // Let's watch the Coinbase Account of the User
        _accountMonitorId = Meteor.setInterval(function () {
            const coinbase = instance.eth.web3.eth.coinbase;

            // Check if the Coinbase Account has changed
            if (CurrentPlayer.address === coinbase) { return; }
            CurrentPlayer.address = coinbase;

            // Reactively update the Coinbase Account
            instance.eth.coinbase = coinbase;
            instance.eth.hasAccount = !_.isEmpty(coinbase);

            // Get Account Nickname (if any)
            _getAccountNickname(instance);
        }, ACCOUNT_WATCH_INTERVAL);
    });

    // Begin Monitoring Contract
    instance.autorun(() => {
        if (!instance.eth.hasNetwork) { return; }
        _monitorContract(instance);
    });
});

Template.bodyLayout.onRendered(function Template_bodyLayout_onRendered() {
    // Set Page Desc
    Meta.set('description', TAPi18n.__('page.desc'));

    // Meteor.defer(() => {
    //     $('.dropdown-toggle').dropdown();
    //     $('[data-toggle="tooltip"]').tooltip();
    // });
});

Template.bodyLayout.onDestroyed(function Template_bodyLayout_onDestroyed() {
    if (_contractMonitorId) {
        Meteor.clearInterval(_contractMonitorId);
    }
    if (_accountMonitorId) {
        Meteor.clearInterval(_accountMonitorId);
    }
});

Template.bodyLayout.helpers({

    getAccountRoute() {
        return FlowRouter.path('account');
    },

    getActiveClass(route) {
        return (_.endsWith(FlowRouter.getRouteName(), route)) ? 'active' : '';
    },

    getAccountAddress() {
        return CurrentPlayer.address;
    },

    getAccountNickname() {
        return CurrentPlayer.nickname;
    },

    getColorFromAddress() {
        if (_.isEmpty(CurrentPlayer.address)) { return ''; }
        return Helpers.getStylesForAddress(CurrentPlayer.address);
    }

});

Template.bodyLayout.events({

    'click .dropdown-toggle': event => { event.preventDefault(); },

    'click [href="#"]': event => { event.preventDefault(); },

    'click [data-action="change-lang"]' : event => {
        const $target = $(event.currentTarget);
        LocaleHelpers.setLanguage($target.attr('data-lang') || 'en');
    },

    'click [data-goto]': (event, instance) => {
        event.stopPropagation();
        event.preventDefault();
        Helpers.gotoAccount($(event.currentTarget).attr('data-goto'));
    }

});

/**
 * @summary
 * @param instance
 * @private
 */
function _monitorContract(instance) {
    if (!instance.eth.hasNetwork || instance.view.isDestroyed) { return; }
    if (_contractMonitorId) { Meteor.clearTimeout(_contractMonitorId); }

    const start = (new Date).getTime();
    const _rerunMonitor = () => {
        const timeTaken = (new Date).getTime() - start;
        if (timeTaken < CONTRACT_WATCH_INTERVAL) {
            _contractMonitorId = Meteor.setTimeout(() => _monitorContract(instance), CONTRACT_WATCH_INTERVAL - timeTaken);
        } else {
            _monitorContract(instance);
        }
    };

    instance.contract.getTorchHolder()
        .then(torchHolderAddress => {
            // Update Current Torch Runner
            const lastKnownRunner = CurrentRunner.address;
            if (torchHolderAddress !== lastKnownRunner) {
                CurrentRunner.address = torchHolderAddress;
            }

            // Update Prices Leader-board
            return Promise.all(_updateHighestPrices(instance));
        })
        .then(results => {
            const promises = _updateHighestMileage(instance);

            // Update LeaderBoard for Highest Prices
            const prices = _.reject(results, _.isString);
            const addresses = _.filter(results, _.isString);
            for (let i = 0; i < LEADERBOARD_LIMIT; i++) {
                HighestPriceLeaders.setLeaderAt(i, {
                    value   : instance.eth.web3.fromWei(prices[i], 'ether').toString(10),
                    address : addresses[i]
                });
            }

            // Update Mileage Leader-board
            return Promise.all(promises);
        })
        .then(results => {
            // Update LeaderBoard for Highest Mileage
            const miles = _.reject(results, _.isString);
            const addresses = _.filter(results, _.isString);
            for (let i = 0; i < LEADERBOARD_LIMIT; i++) {
                HighestMilesLeaders.setLeaderAt(i, {
                    value   : instance.eth.web3.fromWei(miles[i], 'ether').toString(10),
                    address : addresses[i]
                });
            }

            // Get Max-Price
            return instance.contract.getMaxPrice();
        })
        .then(results => {
            // Store Current Max Price
            CurrentOffer.maxPrice = instance.eth.web3.fromWei(results, 'ether');

            _rerunMonitor();
        })
        .catch(err => {
            log.error(err);
            _rerunMonitor();
        });
}

/**
 * @summary
 * @param instance
 * @private
 */
function _getAccountNickname(instance) {
    if (instance.view.isDestroyed || _.isEmpty(instance.eth.coinbase)) { return; }

    // Use Address as Nickname
    CurrentPlayer.nickname = Helpers.shortAddress(instance.eth.coinbase);

    // Get Nickname from Contract
    Helpers.getFriendlyOwnerName(instance.contract, instance.eth.coinbase)
        .then(name => { CurrentPlayer.nickname = name; })
        .catch(log.error);
}

/**
 * @summary
 * @param instance
 * @private
 */
function _updateHighestPrices(instance) {
    if (instance.view.isDestroyed) { return; }

    const promises = [];
    for (let i = 0; i < LEADERBOARD_LIMIT; i++) {
        promises.push(instance.contract.getHighestPriceAt(i));
        promises.push(instance.contract.getHighestPriceOwnerAt(i));
    }
    return promises;
}

/**
 * @summary
 * @param instance
 * @private
 */
function _updateHighestMileage(instance) {
    if (instance.view.isDestroyed) { return; }

    const promises = [];
    for (let i = 0; i < LEADERBOARD_LIMIT; i++) {
        promises.push(instance.contract.getHighestMilesAt(i));
        promises.push(instance.contract.getHighestMilesOwnerAt(i));
    }
    return promises;
}
