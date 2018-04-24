// Meteor Components
import { GoogleMaps } from 'meteor/dburles:google-maps';
import { Random } from 'meteor/random';
import { _ } from 'lodash';

// App Components
import { MeteorEthereum } from '/imports/utils/meteor-ethereum';
import { Contract } from '/imports/contract/contract-interface';
import { Helpers } from '/imports/utils/common';
import { Notify } from '/imports/utils/notify';
import { log } from '/imports/utils/logging';

// Player-Data
import {
    CurrentPlayer
} from '/imports/utils/current-player-data';

// Template Component
import '/imports/components/loading/loading.component';
import './map.component.html';

Template.mapComponent.onCreated(function Template_mapComponent_onCreated() {
    const instance = this;
    instance.eth = MeteorEthereum.instance();
    instance.contract = Contract.instance();

    instance.mapReady = new ReactiveVar(false);
    instance.markerMoved = new ReactiveVar(false);
    instance.newCoords = new ReactiveVar('');
    instance.saveStatus = new ReactiveVar('');

    let accountId = instance.data.accountId || '';
    instance.accountId = new ReactiveVar(accountId);

    instance.zoomOnCoords = (coords, zoom = 5) => {
        instance.mapMarker.setPosition(coords);
        instance.map.setCenter(coords);
        instance.map.setZoom(zoom);
    };

    instance.geoLocate = () => {
        if (!navigator.geolocation) { return; }
        navigator.geolocation.getCurrentPosition((position) => {
            const coords = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            instance.zoomOnCoords(coords);
            instance.newCoords.set(coords);
            instance.markerMoved.set(true);
        }, () => {
            instance.zoomOnCoords(instance.map.getCenter());
        });
    };

    instance.resetCoords = () => {
        const accountCoords = CurrentPlayer.coords;
        if (!instance.mapReady.get() || accountCoords === false) { return; }

        // Set Initial Position of Marker
        if (!_.isEmpty(accountCoords) && _.isString(accountCoords)) {
            const parts = accountCoords.split('|');
            if (parts.length !== 2) {
                instance.geoLocate();
                return;
            }
            instance.zoomOnCoords({
                lat: parseFloat(parts[0]),
                lng: parseFloat(parts[1])
            });
        } else {
            if (accountId === CurrentPlayer.address) {
                instance.geoLocate();
            } else {
                instance.zoomOnCoords(instance.map.getCenter(), 2);
            }
        }
        instance.markerMoved.set(false);
    };

    instance.saveCoords = () => {
        const newCoords = instance.newCoords.get();
        const coordsStr = `${newCoords.lat}|${newCoords.lng}`;
        instance.saveStatus.set('pending...');

        const tx = {
            from : CurrentPlayer.address
        };
        instance.contract.setCoords(coordsStr, tx)
            .then(hash => {
                instance.saveStatus.set('saving...');
                log.log('Transaction sent;', hash);
                instance.contract.waitForReceipt(hash, function (receipt) {
                    log.log('Transaction succeeded;', receipt);
                    instance.saveStatus.set('saved!');
                    CurrentPlayer.coords = coordsStr;
                    Notify.success('Your location has been saved!');
                });
            })
            .catch(err => {
                instance.resetCoords();
                instance.saveStatus.set('failed to save!');
                Helpers.displayFriendlyErrorAlert(err);
            });
    };

    instance.autorun(() => {
        if (!instance.eth.hasAccount) { return; }
        accountId = Template.currentData().accountId || '';
        instance.accountId.set(accountId);
        if (_.isEmpty(accountId)) { return; }

        instance.contract.getCoords(accountId)
            .then(coords => {
                if (/undefined/.test(coords)) { return; }
                CurrentPlayer.coords = coords;
            })
            .catch(log.error);
    });
});

Template.mapComponent.onRendered(function Template_mapComponent_onRendered() {
    const instance = this;

    GoogleMaps.ready('worldMap', function(map) {
        instance.map = map.instance;

        // Torch Location Marker
        instance.mapMarker = new google.maps.Marker({map: instance.map});

        // Watch for changes to Location of Torch Marker
        instance.map.addListener('click', function(event) {
            if (instance.accountId.get() !== CurrentPlayer.address) { return; }
            instance.newCoords.set({
                lat: event.latLng.lat(),
                lng: event.latLng.lng()
            });
            instance.mapMarker.setPosition(event.latLng);
            instance.saveStatus.set('');
            instance.markerMoved.set(true);
        });

        instance.mapReady.set(true);
    });

    instance.autorun(() => {
        if (!instance.mapReady.get() || CurrentPlayer.coords === false) { return; }
        instance.resetCoords();
    });
});

Template.mapComponent.helpers({

    mapOptions() {
        if (GoogleMaps.loaded()) {
            return {
                mapTypeId : google.maps.MapTypeId.ROADMAP,
                center    : new google.maps.LatLng(0, 0),
                zoom      : 2
            };
        }
    },

    hasChanges() {
        const instance = Template.instance();
        return instance.markerMoved.get() && _.isEmpty(instance.saveStatus.get());
    },

    saveStatus() {
        const instance = Template.instance();
        return instance.saveStatus.get();
    }

});

Template.mapComponent.events({

    'click [data-action="save"]' : (event, instance) => {
        instance.saveCoords();
    },

    'click [data-action="reset"]' : (event, instance) => {
        instance.resetCoords();
    }

});
