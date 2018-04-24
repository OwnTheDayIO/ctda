// Meteor Components
import { Random } from 'meteor/random';
import { TAPi18n } from 'meteor/tap:i18n';
import { _ } from 'lodash';

// App Components
import { Contract } from '/imports/contract/contract-interface';
import { Helpers } from '/imports/utils/common';
import { log } from '/imports/utils/logging';

// Globals
import {
    LEADERBOARD_LIMIT
} from '/imports/utils/global-constants';


class LeaderBoard {
    constructor() {
        this._leaders = _.times(LEADERBOARD_LIMIT, _.constant(false));
        this._dep = new Tracker.Dependency;
        this._contract = Contract.instance();
    }

    setLeaderAt(index, leader) {
        const context = this;
        if (index < 0 || index >= LEADERBOARD_LIMIT) { return; }
        if (!context._leaders[index]) { context._leaders[index] = {value: '', address: '', nickname: '', index: 0}; }
        if (context._leaders[index].address === leader.address) { return; }

        context._leaders[index].address = leader.address;
        context._leaders[index].value = leader.value;
        context._leaders[index].index = index;

        Helpers.getFriendlyOwnerName(context._contract, leader.address)
            .then(function (leaderName) {
                context._leaders[index].nickname = leaderName;
                context._dep.changed();
            })
            .catch(log.error);
    }

    getLeaders() {
        this._dep.depend();
        return this._leaders;
    }

    getLeaderAt(index) {
        if (index < 0 || index >= LEADERBOARD_LIMIT) { return; }
        this._dep.depend();
        return this._leaders[index];
    }

    getLeaderByOwner(address) {
        this._dep.depend();
        return _.find(this._leaders, {address});
    }
}


export const HighestPriceLeaders = new LeaderBoard();
export const HighestMilesLeaders = new LeaderBoard();
