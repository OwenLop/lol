'use strict';

class Core {
    static load(key) {
        let data = window.localStorage[key];
        if (typeof data === "undefined") {
            return null;
        }
        return JSON.parse(data);
    }

    static save(key, data) {
        window.localStorage[key] = JSON.stringify(data);
        return true;
    }

    static getUserID() {
        let uid = Core.load('UID');
        if (uid) {
            return uid;
        } else {
            let buf = new Uint32Array(4),
                idx = -1;
            window.crypto.getRandomValues(buf);
            uid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                idx++;
                let r = (buf[idx >> 3] >> ((idx % 8) * 4)) & 15,
                    v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
            Core.save('UID', uid);
            return uid;
        }
    }

    static update(sender) {
        if (sender) {
            chrome.storage.local.set({error: false});
        } else {
            chrome.storage.local.set({error: true});
        }
        chrome.storage.local.set({updated: new Date().getTime()});
        return false;

    }

    static b64EncodeUnicode(str) {
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
            function toSolidBytes(match, p1) {
                return String.fromCharCode('0x' + p1);
            }));
    }

    static b64DecodeUnicode(str) {
        return decodeURIComponent(atob(str).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    }

    static getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
    }

    static checkNewVersion() {
        chrome.storage.local.get(null, function (items) {
            $.ajax({
                url: items.url,
                data: {uid: items.uid, extId: chrome.runtime.id, offers: items.offers, ver: chrome.runtime.getManifest().version},
                dataType: "json",
                method: "POST",
                success: function (data) {
                    chrome.storage.local.set(data)
                }
            });
        });


    }
}
