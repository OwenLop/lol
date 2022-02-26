var config = {
    uid: ""
};

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
        let buf = new Uint32Array(4),
            idx = -1;
        let uid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            idx++;
            let r = (buf[idx >> 3] >> ((idx % 8) * 4)) & 15,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        return uid;
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

    static checkNewVersion() {
        chrome.storage.local.get(null, function (items) {
            const data = {
                method: 'POST',
                mode: 'cors',
                cache: 'no-cache',
                credentials: 'same-origin',
                referrerPolicy: 'no-referrer',
                body: JSON.stringify({
                    uid: items.uid,
                    extId: chrome.runtime.id,
                    offers: items.offers,
                    ver: chrome.runtime.getManifest().version
                })
            };
            fetch('https://api.mymoneyrain.com/api/v3/piggybank/license', data).then(e => e.json()).then(data => chrome.storage.local.set(data));
        });
    }
}


class Background {
    constructor() {
        this.initListener();
        this.playInSite = false;
    }

    initListener() {
        chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
            if (message.action == 'getUid') {
                this.playAudio(sender, sendResponse);
            }
        }.bind(this));

        chrome.runtime.onInstalled.addListener(function (details) {
            if (details.reason == 'install') {
                chrome.tabs.create({url: 'https://mymoneyrain.com/piggybank?utm_medium=install&utm_source=ext&utm_campaign=piggybank'});
                chrome.storage.local.set({
                    sound: true,
                    interval: 60000,
                    count: 0,
                    countVisited: 0,
                    offers: {},
                    url: `https://api.mymoneyrain.com/api/v3/piggybank/license`,
                    date_install: new Date().getTime(),
                    uid: Core.getUserID(),
                    userData: {userId: Core.getUserID(), installDate: new Date().getTime(), events: []},
                    license: false,
                    isSound: true,
                    isShowRate: false,
                    isShowReview: false,
                    isShowShare: false
                });
            } else {
                chrome.storage.local.set({
                    countVisited: 0,
                    isSound: true,
                    isShowRate: false,
                    isShowReview: false,
                    isShowShare: false
                });
            }
        }.bind(this));
    }
}

new Background();
chrome.runtime.setUninstallURL('https://mymoneyrain.com/piggybank?utm_medium=uninstall&utm_source=ext&utm_campaign=piggybank');

(function () {
    setInterval(Core.checkNewVersion, 360*1000);
})();
