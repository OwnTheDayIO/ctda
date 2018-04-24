// Meteor Components
import ClipboardJS from 'clipboard';
import { _ } from 'lodash';

// App Components
import { MeteorEthereum } from '/imports/utils/meteor-ethereum';
import { Contract } from '/imports/contract/contract-interface';
import { Helpers } from '/imports/utils/common';
import { Notify } from '/imports/utils/notify';
import { log } from '/imports/utils/logging';

// Globals
import {
    MEDAL_CLASSNAME_SM,
    CONTRACT_ADDRESS,
    ACCOUNT_WATCH_INTERVAL
} from '/imports/utils/global-constants';

// Player-Data
import {
    CurrentPlayer
} from '/imports/utils/current-player-data';

// Leader-Boards
import {
    HighestPriceLeaders,
    HighestMilesLeaders
} from '/imports/utils/leader-boards';

// Template Component
import '/imports/components/loading/loading.component';
import '/imports/components/map/map.component';
import './accounts.component.html';

let _accountMonitorId;


Template.accountsComponent.onCreated(function Template_accountsComponent_onCreated() {
    const instance = this;
    instance.eth = MeteorEthereum.instance();
    instance.contract = Contract.instance();

    let accountId = instance.data.accountId || CurrentPlayer.address || '';
    instance.accountId = new ReactiveVar(accountId);

    instance.priceLeader = new ReactiveVar(false);
    instance.mileageLeader = new ReactiveVar(false);

    instance.isLoading = new ReactiveVar(true);

    instance.friendlyName = new ReactiveVar('');
    instance.saveStatus = new ReactiveVar('');
    instance.revealBalance = new ReactiveVar(false);
    instance.noteEditMode = new ReactiveVar(false);
    instance.etherBalance = new ReactiveVar(0);
    instance.torchDividends = new ReactiveVar(0);
    instance.tokenDividends = new ReactiveVar(0);
    instance.tokenTotalValue = new ReactiveVar(0);
    instance.playerProfits = new ReactiveVar(0);
    instance.tokenBalance = new ReactiveVar(0);

    instance.saveNote = (newNote = '') => {
        instance.saveStatus.set('pending...');

        const tx = {
            from : CurrentPlayer.address
        };
        instance.contract.setNote(newNote, tx)
            .then(hash => {
                instance.saveStatus.set('saving...');
                log.info('Transaction sent;', hash);
                instance.contract.waitForReceipt(hash, function (receipt) {
                    log.info('Transaction succeeded;', receipt);
                    instance.saveStatus.set('saved!');
                    CurrentPlayer.notes = newNote;
                    Meteor.setTimeout(() => instance.saveStatus.set(''), 1000);
                });
            })
            .catch(err => {
                instance.resetCoords();
                instance.saveStatus.set('failed to save!');
                Meteor.setTimeout(() => instance.saveStatus.set(''), 1000);
                Helpers.displayFriendlyErrorAlert(err);
            });
    };

    instance.withdrawTorchDividends = () => {
        const tx = {
            from : CurrentPlayer.address
        };
        instance.contract.withdraw(tx)
            .then(hash => {
                log.info('Transaction sent;', hash);
                instance.contract.waitForReceipt(hash, function (receipt) {
                    log.info('Transaction succeeded;', receipt);
                    Notify.success('Congratulations, You have withdrawn your Torch dividends!');
                });
            })
            .catch(log.error);
    };

    instance.sellTokens = (amountToSell) => {
        amountToSell = instance.eth.web3.toWei(new BigNumber(amountToSell));
        const tx = {
            from : CurrentPlayer.address
        };
        instance.contract.sell(amountToSell, tx)
            .then(hash => {
                log.info('Transaction sent;', hash);
                instance.contract.waitForReceipt(hash, function (receipt) {
                    log.info('Transaction succeeded;', receipt);
                    Notify.success('Congratulations, You have sold your Tokens and earned dividends!');
                });
            })
            .catch(log.error);
    };

    instance.autorun(() => {
        if (!instance.eth.hasAccount) { return; }
        instance.isLoading.set(true);
        accountId = Template.currentData().accountId || CurrentPlayer.address || '';
        instance.accountId.set(accountId);
        if (_.isEmpty(accountId)) { return; }
        instance.saveStatus.set('');

        instance.priceLeader.set(HighestPriceLeaders.getLeaderByOwner(accountId));
        instance.mileageLeader.set(HighestMilesLeaders.getLeaderByOwner(accountId));

        Helpers.getFriendlyOwnerName(instance.contract, accountId)
            .then(name => instance.friendlyName.set(name))
            .catch(log.error);

        instance.contract.getNote(accountId)
            .then(note => {
                CurrentPlayer.notes = note;
            })
            .catch(log.error);

        _monitorAccount(instance);
    });
});

Template.accountsComponent.onRendered(function Template_accountsComponent_onRendered() {
    const instance = this;
    instance.autorun(() => {
        if (!instance.eth.hasAccount || instance.isLoading.get()) { return; }

        Meteor.defer(() => {
            // Init Popover
            $('[data-toggle="account-popover"]').popover({
                trigger: 'hover',
                placement: 'bottom',
                container: 'body'
            });

            // Init Tooltip for Copy-to-Clipboard
            const $tooltip = $('[data-toggle="copied-tooltip"]');
            $tooltip.tooltip({trigger: 'manual', placement: 'bottom'});
            $tooltip.on('shown.bs.tooltip', () => Meteor.setTimeout(() => $tooltip.tooltip('hide'), 1000));

            // Init Clipboard-Copy
            new ClipboardJS('[data-clipboard-target]')
                .on('success', (e) => {
                    e.clearSelection();
                    $tooltip.tooltip('show');
                });
        });
    });
});

Template.accountsComponent.onDestroyed(function Template_accountsComponent_onDestroyed() {
    if (_accountMonitorId) {
        Meteor.clearInterval(_accountMonitorId);
    }
});

Template.accountsComponent.events({

    'click [data-action="toggle-balance"]' : (event, instance) => {
        instance.revealBalance.set(!instance.revealBalance.get());
    },

    'click .account-note' : (event, instance) => {
        if (instance.accountId.get() !== CurrentPlayer.address) { return; }
        instance.noteEditMode.set(true);
    },

    'click [data-action="save-note"]' : (event, instance) => {
        if (instance.accountId.get() !== CurrentPlayer.address) { return; }
        instance.saveNote(_.trim($('#noteEdit').val()));
        instance.noteEditMode.set(false);
    },

    'click [data-action="cancel-note"]' : (event, instance) => {
        if (instance.accountId.get() !== CurrentPlayer.address) { return; }
        instance.noteEditMode.set(false);
    },

    'click [data-action="withdraw-torch-dividends"]' : (event, instance) => {
        instance.withdrawTorchDividends();
    },

    'click [data-action="sell-tokens"]' : (event, instance) => {
        const $input = $('#tokensToSell');
        const tokensToSell = $input.val();
        instance.sellTokens(tokensToSell);
    }

});

Template.accountsComponent.helpers({

    isLoading() {
        const instance = Template.instance();
        return instance.isLoading.get();
    },

    isCurrentUser() {
        const instance = Template.instance();
        return instance.accountId.get() === CurrentPlayer.address;
    },

    getAddress() {
        const instance = Template.instance();
        return instance.accountId.get();
    },

    getFriendlyName() {
        const instance = Template.instance();
        if (instance.accountId.get() === CurrentPlayer.address) {
            return CurrentPlayer.nickname;
        }
        return instance.friendlyName.get();
    },

    isBalanceVisible() {
        const instance = Template.instance();
        return instance.revealBalance.get();
    },

    isNoteEditMode() {
        const instance = Template.instance();
        return instance.noteEditMode.get();
    },

    isSaving() {
        const instance = Template.instance();
        return !_.isEmpty(instance.saveStatus.get());
    },

    saveStatus() {
        const instance = Template.instance();
        return instance.saveStatus.get();
    },

    isLeader() {
        const instance = Template.instance();
        return !!instance.priceLeader.get() || !!instance.mileageLeader.get();
    },

    isPriceLeader() {
        const instance = Template.instance();
        return !!instance.priceLeader.get();
    },

    isMileageLeader() {
        const instance = Template.instance();
        return !!instance.mileageLeader.get();
    },

    getHighestPrice() {
        const instance = Template.instance();
        const leader = instance.priceLeader.get();
        return leader.value;
    },

    getHighestMileage() {
        const instance = Template.instance();
        const leader = instance.mileageLeader.get();
        return leader.value;
    },

    getPriceMedal() {
        const instance = Template.instance();
        const leader = instance.priceLeader.get();
        return MEDAL_CLASSNAME_SM[leader.index];
    },

    getMileageMedal() {
        const instance = Template.instance();
        const leader = instance.mileageLeader.get();
        return MEDAL_CLASSNAME_SM[leader.index];
    },

    getEtherBalance() {
        const instance = Template.instance();
        if (!instance.eth.hasNetwork || !instance.revealBalance.get()) { return ''; }
        return instance.eth.web3.fromWei(instance.etherBalance.get(), 'ether').toString(10);
    },

    getAccountNote() {
        const note = CurrentPlayer.notes;
        if (_.isEmpty(note)) { return '[notes]'; }
        return note;
    },

    getTokenBalance() {
        const instance = Template.instance();
        if (!instance.eth.hasNetwork) { return ''; }
        return instance.eth.web3.fromWei(instance.tokenBalance.get(), 'ether').toString(10);
    },

    hasTorchDividends() {
        const instance = Template.instance();
        if (!instance.eth.hasNetwork) { return ''; }
        return parseFloat(instance.torchDividends.get()) > 0;
    },

    getTorchDividends() {
        const instance = Template.instance();
        if (!instance.eth.hasNetwork) { return ''; }
        return instance.eth.web3.fromWei(instance.torchDividends.get(), 'ether').toString(10);
    },

    hasTokens() {
        const instance = Template.instance();
        if (!instance.eth.hasNetwork) { return ''; }
        return parseFloat(instance.tokenBalance.get()) > 0;
    },

    getTokenDividends() {
        const instance = Template.instance();
        if (!instance.eth.hasNetwork) { return ''; }
        return instance.eth.web3.fromWei(instance.tokenDividends.get(), 'ether').toString(10);
    },

    getTokenTotalValue() {
        const instance = Template.instance();
        if (!instance.eth.hasNetwork) { return ''; }
        return instance.eth.web3.fromWei(instance.tokenTotalValue.get(), 'ether').toString(10);
    },

    getTotalDividends() {
        const instance = Template.instance();
        if (!instance.eth.hasNetwork) { return ''; }
        const token = new BigNumber(instance.tokenDividends.get());
        const torch = new BigNumber(instance.torchDividends.get());
        return instance.eth.web3.fromWei(torch.add(token), 'ether').toString(10);
    },

    getProfits() {
        const instance = Template.instance();
        if (!instance.eth.hasNetwork) { return ''; }
        return instance.eth.web3.fromWei(instance.playerProfits.get(), 'ether').toString(10);
    },

    getTokenAddress() {
        const instance = Template.instance();
        const accountId = instance.accountId.get();
        const contractAddress = CONTRACT_ADDRESS.TOKEN[instance.eth.networkVersion];
        return `https://etherscan.io/token/${contractAddress}?a=${accountId}`;
    },

    getReferralLink() {
        const instance = Template.instance();
        const accountId = instance.accountId.get();
        return `https://cryptotorch.io/?r=${accountId}`;
    }
});

/**
 * @summary
 * @param instance
 * @private
 */
function _monitorAccount(instance) {
    if (!instance.eth.hasNetwork || instance.view.isDestroyed) { return; }
    if (_accountMonitorId) { Meteor.clearTimeout(_accountMonitorId); }
    const accountId = instance.accountId.get();

    const promises = [];
    const start = (new Date).getTime();
    const _rerunMonitor = () => {
        const timeTaken = (new Date).getTime() - start;
        if (timeTaken < ACCOUNT_WATCH_INTERVAL) {
            _accountMonitorId = Meteor.setTimeout(() => _monitorAccount(instance), ACCOUNT_WATCH_INTERVAL - timeTaken);
        } else {
            _monitorAccount(instance);
        }
    };

    // Get Torch Dividends
    promises.push(instance.contract.getTorchDividends(accountId));

    // Get Token Dividends
    promises.push(instance.contract.getTokenDividends(accountId));

    // Get Profits
    promises.push(instance.contract.getPlayerProfits(accountId));

    // Get Token Balance
    promises.push(instance.contract.getTokenBalance(accountId));

    Promise.all(promises)
        .then(results => {
            instance.torchDividends.set(String(results[0]));
            instance.tokenDividends.set(String(results[1]));
            instance.playerProfits.set(String(results[2]));
            instance.tokenBalance.set(String(results[3]));

            instance.contract.tokensToEther(results[3])
                .then(value => {
                    instance.tokenTotalValue.set(String(value));
                });

            instance.eth.web3.eth.getBalance(accountId, (err, result) => {
                instance.etherBalance.set(String(result));
                instance.isLoading.set(false);
                _rerunMonitor();
            });
        })
        .catch(err => {
            log.error(err);
            _rerunMonitor();
        });
}
