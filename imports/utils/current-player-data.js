// Meteor Components
import { Random } from 'meteor/random';
import { TAPi18n } from 'meteor/tap:i18n';
import { _ } from 'lodash';

// App Components
import { Contract } from '/imports/contract/contract-interface';
import { Helpers } from '/imports/utils/common';
import { log } from '/imports/utils/logging';

import { DEFAULT_TORCH_PRICE } from '/imports/utils/global-constants';

class TorchOffer {
    constructor() {
        this._price = DEFAULT_TORCH_PRICE;
        this._maxPrice = DEFAULT_TORCH_PRICE;
        this._priceDep = new Tracker.Dependency;
        this._maxDep = new Tracker.Dependency;
    }

    set price(price) {
        if (!(price instanceof BigNumber)) {
            price = new BigNumber(price);
        }
        this._price = price;
        this._priceDep.changed();
    }

    get price() {
        this._priceDep.depend();
        return this._price;
    }

    set maxPrice(price) {
        if (!(price instanceof BigNumber)) {
            price = new BigNumber(price);
        }
        this._maxPrice = price;
        this._maxDep.changed();
    }

    get maxPrice() {
        this._maxDep.depend();
        return this._maxPrice;
    }
}

class Player {
    constructor() {
        this._address = '';
        this._nickname = '';
        this._notes = '';
        this._coords = false;
        this._addrDep = new Tracker.Dependency;
        this._nickDep = new Tracker.Dependency;
        this._notesDep = new Tracker.Dependency;
        this._coordsDep = new Tracker.Dependency;
        this._contract = Contract.instance();
    }

    set address(address) {
        const context = this;
        if (context._address === address) { return; }
        context._address = address;
        context._addrDep.changed();

        Helpers.getFriendlyOwnerName(context._contract, address)
            .then(torchHolderName => {
                context.nickname = torchHolderName;
            })
            .catch(log.error);
    }

    get address() {
        this._addrDep.depend();
        return this._address;
    }

    set nickname(nickname) {
        this._nickname = nickname;
        this._nickDep.changed();
    }

    get nickname() {
        this._nickDep.depend();
        return this._nickname;
    }

    set notes(notes) {
        this._notes = notes;
        this._notesDep.changed();
    }

    get notes() {
        this._notesDep.depend();
        return this._notes;
    }

    set coords(coords) {
        this._coords = coords;
        this._coordsDep.changed();
    }

    get coords() {
        this._coordsDep.depend();
        return this._coords;
    }
}


export const CurrentOffer = new TorchOffer();
export const CurrentPlayer = new Player();
export const CurrentRunner = new Player();
