// Meteor Components
import { _ } from 'lodash';

// App Components
import { MeteorEthereum } from '/imports/utils/meteor-ethereum';
import { Contract } from '/imports/contract/contract-interface';
import { LocaleHelpers } from '/imports/utils/i18n-helpers';
import { Helpers } from '/imports/utils/common';

// Global Constants
import { OWNTHEDAY_WATCH_INTERVAL } from '/imports/utils/global-constants';

// Template Components
import '/imports/components/loading/loading.component';
import './own-the-day.component.html';

let _ownTheDayMonitorId;

Template.ownTheDayComponent.onCreated(function Template_ownTheDayComponent_onCreated() {
    const instance = this;
    instance.eth = MeteorEthereum.instance();
    instance.contract = Contract.instance();

    instance.dayIndex = new ReactiveVar('0');
    instance.dayOwner = new ReactiveVar('');
    instance.dayOwnerAddress = new ReactiveVar('');

    // Begin Monitoring Contract
    instance.autorun(() => {
        if (!instance.eth.hasNetwork) { return; }
        _monitorOwnTheDay(instance);
    });
});

Template.ownTheDayComponent.onRendered(function Template_ownTheDayComponent_onRendered() {
    // Init Popover
    Meteor.defer(() => $('[data-toggle="day-popover"]').popover({trigger: 'hover', placement: 'left', container: 'body'}));
});

Template.ownTheDayComponent.onDestroyed(function Template_ownTheDayComponent_onDestroyed() {
    if (_ownTheDayMonitorId) {
        Meteor.clearInterval(_ownTheDayMonitorId);
    }
});

Template.ownTheDayComponent.helpers({

    isLoaded() {
        return true;
    },

    getPopoverTitle() {
        return 'Only at owntheday.io';
    },

    getPopoverContent() {
        return 'Own the Day and earn profit from every torch runner on that day!  Earn even more on holidays!';
    },

    getMonth() {
        const instance = Template.instance();
        const dayIndex = instance.dayIndex.get();
        const {month} = Helpers.getMonthDayFromIndex(dayIndex);
        return LocaleHelpers.formatDate('MMMM', month, 1);
    },

    getDay() {
        const instance = Template.instance();
        const dayIndex = instance.dayIndex.get();
        const {month, day} = Helpers.getMonthDayFromIndex(dayIndex);
        return LocaleHelpers.formatDate('D', month, day);
    },

    ownerName() {
        const instance = Template.instance();
        return instance.dayOwner.get();
    },

    ownerAddress() {
        const instance = Template.instance();
        return instance.dayOwnerAddress.get();
    },

    getColorFromAddress() {
        const instance = Template.instance();
        const address = instance.dayOwnerAddress.get();
        if (_.isEmpty(address)) { return ''; }
        return Helpers.getStylesForAddress(address);
    }

});


/**
 * @summary
 * @param instance
 * @private
 */
function _monitorOwnTheDay(instance) {
    if (!instance.eth.hasNetwork || instance.view.isDestroyed) { return; }
    if (_ownTheDayMonitorId) { Meteor.clearTimeout(_ownTheDayMonitorId); }

    const start = (new Date).getTime();
    const _rerunMonitor = () => {
        const timeTaken = (new Date).getTime() - start;
        if (timeTaken < OWNTHEDAY_WATCH_INTERVAL) {
            _ownTheDayMonitorId = Meteor.setTimeout(() => _monitorOwnTheDay(instance), OWNTHEDAY_WATCH_INTERVAL - timeTaken);
        } else {
            _monitorOwnTheDay(instance);
        }
    };

    const promises = [];
    promises.push(instance.contract.getTodayIndex());
    promises.push(instance.contract.getTodayOwnerName());
    promises.push(instance.contract.getTodayOwnerAddress());

    Promise.all(promises)
        .then(results => {
            const dayOwnerAddress = results[2];
            let dayOwner = Helpers.shortAddress(dayOwnerAddress);
            if (!_.isEmpty(results[1])) { dayOwner = results[1]; }

            instance.dayIndex.set(_.parseInt(results[0].toString(10), 10));
            instance.dayOwner.set(dayOwner);
            instance.dayOwnerAddress.set(dayOwnerAddress);

            _rerunMonitor();
        })
        .catch(err => {
            log.error(err);
            _rerunMonitor();
        });
}
