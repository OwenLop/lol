"use strict";
(function () {
    const wallet = 0,
        cashPerClick = 1,
        xp = 1,
        cloudLevel = 1;
    $("#back").on("click", function () {
        chrome.storage.local.set({"wallet": wallet, "cashPerClick": cashPerClick, "xp": xp, "cloudLevel": cloudLevel, "cloudLevelMax": 12});
        window.location = 'popup.html';
    });
})();
