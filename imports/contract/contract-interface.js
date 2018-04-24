// Meteor Components
import { _ } from 'lodash';

// App components
import { MeteorEthereum } from '/imports/utils/meteor-ethereum';
import { Helpers } from '/imports/utils/common';
import { log } from '/imports/utils/logging';

// Globals
import {
    CONTRACT_ADDRESS,
    RECEIPT_WATCH_INTERVAL
} from '/imports/utils/global-constants';

// Contract Application-Binary-Interface
const _ABI = [{"constant":true,"inputs":[{"name":"_playerAddress","type":"address"}],"name":"profitsOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_etherToSpend","type":"uint256"}],"name":"calculateTokensReceived","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getTodayIndex","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"isHolidayToday","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"unpause","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_index","type":"uint256"}],"name":"getHighestMilesAt","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"sellPrice","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_nickname","type":"string"}],"name":"setAccountNickname","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_note","type":"string"}],"name":"setAccountNote","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"paused","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_playerAddress","type":"address"}],"name":"isChampionAccount","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getTodayOwnerName","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_index","type":"uint256"}],"name":"getHighestMilesOwnerAt","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_playerAddress","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_dayIndex","type":"uint256"}],"name":"isHoliday","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"torchContractBalance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_referredBy","type":"address"}],"name":"takeTheTorch","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"getMaxPrice","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"cashout","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"pause","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"buyPrice","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getTodayOwnerAddress","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_limit","type":"uint256"}],"name":"setWhaleIncreaseLimit","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_listIndex","type":"uint8"},{"name":"_holidayMap","type":"string"}],"name":"updateHolidayState","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"maxLeaders","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_receiver","type":"address"}],"name":"setDonationsReceiver","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_index","type":"uint256"}],"name":"getHighestPriceOwnerAt","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_playerAddress","type":"address"}],"name":"getAccountCoords","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"whaleMax","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_tokenAddress","type":"address"}],"name":"setTokenContract","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_dateTimeAddress","type":"address"},{"name":"_tokenAddress","type":"address"},{"name":"_otdAddress","type":"address"}],"name":"initialize","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_tokensToSell","type":"uint256"}],"name":"calculateEtherReceived","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_max","type":"uint256"}],"name":"setWhaleMax","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_playerAddress","type":"address"}],"name":"referralDividendsOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_dateTimeAddress","type":"address"}],"name":"setDateTimeLib","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_index","type":"uint256"}],"name":"getHighestPriceAt","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_playerAddress","type":"address"}],"name":"getAccountNickname","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"tokenContractBalance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_amountOfTokens","type":"uint256"}],"name":"sell","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_playerAddress","type":"address"}],"name":"torchDividendsOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"exit","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_otdAddress","type":"address"}],"name":"setOwnTheDayContract","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"torchRunners","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"whaleIncreaseLimit","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_playerAddress","type":"address"}],"name":"getAccountNote","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_coords","type":"string"}],"name":"setAccountCoords","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_playerAddress","type":"address"}],"name":"tokenDividendsOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"pricePaid","type":"uint256"}],"name":"onTorchPassed","type":"event"},{"anonymous":false,"inputs":[],"name":"OnPause","type":"event"},{"anonymous":false,"inputs":[],"name":"OnUnpause","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"},{"indexed":true,"name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"}];


export class Contract {
    constructor() {
        this.eth = MeteorEthereum.instance();
        this.contract = null;
        this.referralAddress = '0xd1394FbA6644cc1a12dDa617fa448B0182A637d0';
    }

    static instance() {
        if (!Contract._instance) {
            Contract._instance = new Contract();
        }
        return Contract._instance;
    }

    connectToContract(networkVersion = '1') {
        const address = CONTRACT_ADDRESS.TORCH[networkVersion];
        this.contract = this.eth.web3.eth.contract(_ABI, address).at(address);
    }

    getNickname(playerAddress) {
        if (!this.eth.hasNetwork) { return Promise.reject('Provider not ready'); }
        const _accountName = Helpers.denodeify(this.contract.getAccountNickname);
        return _accountName(playerAddress);
    }

    setNickname(nickname, tx) {
        if (!this.eth.hasNetwork) { return Promise.reject('Provider not ready'); }
        const _setAccountNickname = Helpers.denodeify(this.contract.setAccountNickname);
        let promise;
        try {
            promise = _setAccountNickname(nickname, tx);
        } catch (err) {
            log.error(err);
            promise = Promise.reject(err);
        }
        return promise;
    }

    getNote(playerAddress) {
        if (!this.eth.hasNetwork) { return Promise.reject('Provider not ready'); }
        const _accountNote = Helpers.denodeify(this.contract.getAccountNote);
        return _accountNote(playerAddress);
    }

    setNote(note, tx) {
        if (!this.eth.hasNetwork) { return Promise.reject('Provider not ready'); }
        const _setAccountNote = Helpers.denodeify(this.contract.setAccountNote);
        let promise;
        try {
            promise = _setAccountNote(note, tx);
        } catch (err) {
            log.error(err);
            promise = Promise.reject(err);
        }
        return promise;
    }

    getCoords(playerAddress) {
        if (!this.eth.hasNetwork) { return Promise.reject('Provider not ready'); }
        const _accountCoords = Helpers.denodeify(this.contract.getAccountCoords);
        return _accountCoords(playerAddress);
    }

    setCoords(coords, tx) {
        if (!this.eth.hasNetwork) { return Promise.reject('Provider not ready'); }
        const _setAccountCoords = Helpers.denodeify(this.contract.setAccountCoords);
        let promise;
        try {
            promise = _setAccountCoords(coords, tx);
        } catch (err) {
            log.error(err);
            promise = Promise.reject(err);
        }
        return promise;
    }

    isHolidayToday() {
        if (!this.eth.hasNetwork) { return Promise.reject('Provider not ready'); }
        const _isHolidayToday = Helpers.denodeify(this.contract.isHolidayToday);
        return _isHolidayToday();
    }

    getTodayIndex() {
        if (!this.eth.hasNetwork) { return Promise.reject('Provider not ready'); }
        const _getTodayIndex = Helpers.denodeify(this.contract.getTodayIndex);
        return _getTodayIndex();
    }

    getTodayOwnerName() {
        if (!this.eth.hasNetwork) { return Promise.reject('Provider not ready'); }
        const _getTodayOwnerName = Helpers.denodeify(this.contract.getTodayOwnerName);
        return _getTodayOwnerName();
    }

    getTodayOwnerAddress() {
        if (!this.eth.hasNetwork) { return Promise.reject('Provider not ready'); }
        const _getTodayOwnerAddress = Helpers.denodeify(this.contract.getTodayOwnerAddress);
        return _getTodayOwnerAddress();
    }

    tokenBuyPrice() {
        if (!this.eth.hasNetwork) { return Promise.reject('Provider not ready'); }
        const _buyPrice = Helpers.denodeify(this.contract.buyPrice);
        return _buyPrice();
    }

    tokenSellPrice() {
        if (!this.eth.hasNetwork) { return Promise.reject('Provider not ready'); }
        const _sellPrice = Helpers.denodeify(this.contract.sellPrice);
        return _sellPrice();
    }

    etherToTokens(ether) {
        if (!this.eth.hasNetwork) { return Promise.reject('Provider not ready'); }
        const _etherToTokens = Helpers.denodeify(this.contract.calculateTokensReceived);
        return _etherToTokens(ether);
    }

    tokensToEther(tokens) {
        if (!this.eth.hasNetwork) { return Promise.reject('Provider not ready'); }
        const _tokensToEther = Helpers.denodeify(this.contract.calculateEtherReceived);
        return _tokensToEther(tokens);
    }

    getMaxPrice() {
        if (!this.eth.hasNetwork) { return Promise.reject('Provider not ready'); }
        const _maxPrice = Helpers.denodeify(this.contract.getMaxPrice);
        return _maxPrice();
    }

    getHighestPriceAt(index) {
        if (!this.eth.hasNetwork) { return Promise.reject('Provider not ready'); }
        const _getHighestPriceAt = Helpers.denodeify(this.contract.getHighestPriceAt);
        return _getHighestPriceAt(index);
    }

    getHighestPriceOwnerAt(index) {
        if (!this.eth.hasNetwork) { return Promise.reject('Provider not ready'); }
        const _getHighestPriceOwnerAt = Helpers.denodeify(this.contract.getHighestPriceOwnerAt);
        return _getHighestPriceOwnerAt(index);
    }

    getHighestMilesAt(index) {
        if (!this.eth.hasNetwork) { return Promise.reject('Provider not ready'); }
        const _getHighestMilesAt = Helpers.denodeify(this.contract.getHighestMilesAt);
        return _getHighestMilesAt(index);
    }

    getHighestMilesOwnerAt(index) {
        if (!this.eth.hasNetwork) { return Promise.reject('Provider not ready'); }
        const _getHighestMilesOwnerAt = Helpers.denodeify(this.contract.getHighestMilesOwnerAt);
        return _getHighestMilesOwnerAt(index);
    }

    getTorchHolder() {
        if (!this.eth.hasNetwork) { return Promise.reject('Provider not ready'); }
        const _getTorchHolder = Helpers.denodeify(this.contract.torchRunners);
        return _getTorchHolder(0);
    }

    getTokenBalance(playerAddress) {
        if (!this.eth.hasNetwork) { return Promise.reject('Provider not ready'); }
        const _getTokenBalance = Helpers.denodeify(this.contract.balanceOf);
        return _getTokenBalance(playerAddress);
    }

    getTokenDividends(playerAddress) {
        if (!this.eth.hasNetwork) { return Promise.reject('Provider not ready'); }
        const _getPlayerDividends = Helpers.denodeify(this.contract.tokenDividendsOf);
        return _getPlayerDividends(playerAddress);
    }

    getReferralDividends(playerAddress) {
        if (!this.eth.hasNetwork) { return Promise.reject('Provider not ready'); }
        const _getReferralDividends = Helpers.denodeify(this.contract.referralDividendsOf);
        return _getReferralDividends(playerAddress);
    }

    getTorchDividends(playerAddress) {
        if (!this.eth.hasNetwork) { return Promise.reject('Provider not ready'); }
        const _getPlayerDividends = Helpers.denodeify(this.contract.torchDividendsOf);
        return _getPlayerDividends(playerAddress);
    }

    getPlayerProfits(playerAddress) {
        if (!this.eth.hasNetwork) { return Promise.reject('Provider not ready'); }
        const _getPlayerProfits = Helpers.denodeify(this.contract.profitsOf);
        return _getPlayerProfits(playerAddress);
    }

    takeTheTorch(tx) {
        if (!this.eth.hasNetwork) { return Promise.reject('Provider not ready'); }
        const _takeTheTorch = Helpers.denodeify(this.contract.takeTheTorch);
        let promise;
        try {
            console.log('torch referrer:', this.referralAddress);
            promise = _takeTheTorch(this.referralAddress, tx);
        } catch (err) {
            promise = Promise.reject(err);
        }
        return promise;
    }

    withdraw(tx) {
        if (!this.eth.hasNetwork) { return Promise.reject('Provider not ready'); }
        const _withdraw = Helpers.denodeify(this.contract.cashout);
        let promise;
        try {
            promise = _withdraw(tx);
        } catch (err) {
            promise = Promise.reject(err);
        }
        return promise;
    }

    sell(amount, tx) {
        if (!this.eth.hasNetwork) { return Promise.reject('Provider not ready'); }
        const _sell = Helpers.denodeify(this.contract.sell);
        let promise;
        try {
            promise = _sell(amount, tx);
        } catch (err) {
            promise = Promise.reject(err);
        }
        return promise;
    }

    waitForReceipt(hash, cb) {
        const self = this;
        const _getTransactionReceipt = Helpers.denodeify(this.eth.web3.eth.getTransactionReceipt);
        _getTransactionReceipt(hash)
            .then(receipt => {
                if (receipt !== null) {
                    // Transaction went through
                    if (cb) {
                        cb(receipt);
                    }
                } else {
                    // Try again in 1 second
                    window.setTimeout(function () {
                        self.waitForReceipt(hash, cb);
                    }, RECEIPT_WATCH_INTERVAL);
                }
            })
            .catch(log.error);
    }
}
//
// Static Member Variables
//
Contract._instance = null; // Static Instance Member for Singleton Pattern
