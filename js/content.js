"use strict";
(function () {



    const soundElement = document.querySelector("#sound"),
        player = document.querySelector('body'),
        swin = document.querySelector('#swin'),
        banner = document.querySelector("#bannerimg"),
        updaCash = document.querySelector("#updaCash"),
        updaCloud = document.querySelector("#updaCloud");

    var played = false,
        cloudLevelMax = 12,
        bonus = 1,
        bonusCount = 0,
        wallet = 0,
        cashPerClick = 0.1,
        xp = 0,
        cloudLevel = 0,
        sad = true,
        started = false,
        clicked = false,
        sound = true,
        isShowRate = false,
        isShowReview = false,
        isShowShare = false;
    try {
        var actx = new (AudioContext || webkitAudioContext)(),
            src = "/sound/piggy_sound4.mp3",
            audioData, srcNode = null;
    } catch (e) {

    }


    function soundInit() {
        if (played == false) {
            played = true;

            fetch(src).then(function (resp) {
                return resp.arrayBuffer()
            }).then(decode);

        }

        function decode(buffer) {
            actx.decodeAudioData(buffer, playLoop);
        }

        function playLoop(abuffer) {
            if (!audioData) {
                audioData = abuffer;
            }
            srcNode = actx.createBufferSource();
            srcNode.buffer = abuffer;
            srcNode.connect(actx.destination);
            srcNode.loop = true;
            if (started == true) {
                srcNode.start(0);
            }
        }
    }

    function initMusic() {
        if (sound === true) {
            soundInit();
        }
    }

    chrome.storage.onChanged.addListener(function (changes, namespace) {
        if (changes.sound) {
            var storageChange = changes.sound;
            sound = storageChange.newValue;

            if (storageChange.newValue == false) {
                if (played) {
                    srcNode.stop();
                }
            } else {
                initMusic();
            }
        }
    });


    setInterval(function () {
        checkEndGame();
        myTimer()
    }, 1000);


    soundElement.addEventListener('click', function (event) {
        sound = !sound;
        if (sound === true) {
            soundElement.classList.add('soundOn');
            soundElement.classList.remove('soundOff');
            chrome.storage.local.set({sound: sound})
            initMusic();
        } else {
            soundElement.classList.remove('soundOn');
            soundElement.classList.add('soundOff');
            chrome.storage.local.set({sound: sound})
        }
    });

    $(window).keyup(function (e) {
        if (e.keyCode == 0 || e.keyCode == 32) {
            $("#swin").click();
        }
    });

    swin.addEventListener('click', function (event) {
        if (started == false) {
            started = true;
        }
        chrome.storage.local.get("sound", function (item) {
            if (item.sound == true) {
                initMusic();
            }
        });
        if (isNaN(wallet)) {
            saveUs();
        }
        checkEndGame();
        wallet = wallet + cashPerClick * bonus;
        if (sad == true) {
            updateBackground();
        }
        sad = false;
        clicked = true;
        xp = xp + bonus;

        updateOutput();
    });

    updaCash.addEventListener("click", function () {
        if (wallet < costOfCashUpgrade()) {
            return;
        }
        wallet = wallet - costOfCashUpgrade();
        cashPerClick = getCashUpgrade();
        xp = xp + costOfCashUpgrade();

        chrome.storage.local.get("sound", function (item) {
            if (item.sound == true) {
                let audio = new Audio("/sound/click.mp3");
                audio.play();
            }
        });
        updateOutput();
    });


    updaCloud.addEventListener("click", function () {
        checkEndGame()
        if (wallet < costOfCloudUpgrade()) {
            return;
        }

        chrome.storage.local.get("sound", function (item) {
            if (item.sound == true) {
                let audio = new Audio("/sound/click.mp3");
                audio.play();
            }
        });
        wallet = wallet - costOfCloudUpgrade();
        cloudLevel = cloudLevel + 1;
        xp = xp + costOfCloudUpgrade();
        updateBackground();
        sad = false;
        updateOutput();
    });


    window.onload = doInit();

    chrome.runtime.onInstalled.addListener(function (details) {
        if (details.reason == "install") {
            saveUs();
            save();
        }
    });

    function myTimer() {
        if (clicked == false) {
            if (played) {
                srcNode.stop();
                played = false;
            }
        }
        if (sad == false) {
            if (clicked == false) {
                player.style.backgroundImage = "url('/assets/images/sad.jpg')";
                sad = true;
                bonus = 1;
                bonusCount = 0;
                updateOutput();
            }
        }
        if (clicked) {
            bonusCount = bonusCount + .06;
        }
        if (bonusCount > bonus) {
            bonus = bonus + 1;
            bonusCount = 0;
            updateOutput();
        }

        clicked = false;

    }

    function updateOutput() {
        document.querySelector("#level").innerHTML = "Level " + cloudLevel;
        document.querySelector("#walletDisp").innerHTML = "$" + dispNumb(wallet);
        document.querySelector("#updaCash_text").innerHTML = "Upgrade $" + (dispNumb(getCashUpgrade())) + " for $" + dispNumb(costOfCashUpgrade()) + "";
        document.querySelector("#updaCloud_text").innerHTML = "Flexing $" + dispNumb(costOfCloudUpgrade());


        if (clicked == true) {
            document.querySelector("#bonus").innerHTML = `Bonus: x${bonus}`;

        } else {
            document.querySelector("#bonus").innerHTML = "Rain those $$$"
        }
        if (wallet >= costOfCashUpgrade()) {
            updaCash.classList.add("green");
            updaCash.classList.remove("red");
        } else {
            updaCash.classList.add("red");
            updaCash.classList.remove("green");
        }
        if (wallet >= costOfCloudUpgrade()) {
            updaCloud.classList.add("green");
            updaCloud.classList.remove("red");
        } else {
            updaCloud.classList.add("red");
            updaCloud.classList.remove("green");
        }
        save();
    }

    function getCashUpgrade() {
        var numb = cashPerClick;
        if (numb < 10) {
            return numb + 1;
        }
        var first = String(numb).charAt(0);
        if (first == "1") {
            first = "2";
        } else if (first == "2") {
            first = "5";
        } else if (first == "5") {
            first = "10";
        }

        var rest = String(numb).substring(1, String(numb).length);
        return parseInt(first + "" + rest);
    }

    function dispNumb(number) {
        var long = String(number).length,
            temp = 0,
            ending = "hi";
        if (long < 4) {
            return number;
        }
        if (long < 7) {
            temp = Math.round(number / 10) / 100;
            ending = "K";
        } else if (long < 10) {
            temp = Math.round(number / 10000) / 100;
            ending = "M";
        } else if (long < 13) {
            temp = Math.round(number / 10000000) / 100;
            ending = "B";
        } else if (long < 16) {
            temp = Math.round(number / 10000000000) / 100;
            ending = "T";
        } else if (long >= 16) {
            temp = Math.round(number / 10000000000000) / 100;
            ending = "q";
        }
        temp = parseFloat(temp).toFixed(2);
        return temp + " " + ending;
    }


    function costOfCashUpgrade() {
        return Math.round(2 * Math.round(5 * cashPerClick * Math.log(cashPerClick) * Math.log(cashPerClick))) + 1;
    }


    function updateBackground() {
        player.style.backgroundImage = "url('/assets/images/piggy" + cloudLevel + ".gif')";
        player.style.backgroundSize = "contain";
        player.style.backgroundRepeat = "no-repeat";
    }

    function costOfCloudUpgrade() {
        return Math.round(2 * Math.pow(1 + cloudLevel, cloudLevel + 2));
    }

    function save() {
        chrome.storage.local.set({"wallet": wallet, "cashPerClick": cashPerClick, "xp": xp, "cloudLevel": cloudLevel});
    }

    function checkEndGame() {
        if (cloudLevel > cloudLevelMax) {
            window.location = 'stop.html';
            return;
        }
    }

    function load() {
        chrome.storage.local.get(null, function (item) {
            wallet = item.wallet;
            cashPerClick = item.cashPerClick;
            xp = item.xp;
            cloudLevel = item.cloudLevel;
            sound = item.sound;
            isShowRate = item.isShowRate ? item.isShowRate : false;
            isShowReview = item.isShowReview ? item.isShowReview : false;
            isShowShare = item.isShowShare ? item.isShowShare : false;
        });
        checkEndGame()

    }

    function becomeOneWithWorld() {
        var walB = 0,
            cpcB = 0,
            xpB = 0,
            clB = 0;

        chrome.storage.local.get(null, function (items) {
            walB = items.wallet;
            cpcB = items.cashPerClick;
            clB = items.cloudLevel;
            xpB = items.xp;
            sound = items.sound;
        });


        setTimeout(function () {
            if (xp > xpB) {
                chrome.storage.local.set({
                    "wallet": wallet,
                    "cashPerClick": cashPerClick,
                    "xp": xp,
                    "cloudLevel": cloudLevel,
                    sound: sound
                });
            } else {
                chrome.storage.local.set({
                    "wallet": walB,
                    "cashPerClick": cpcB,
                    "xp": xpB,
                    "cloudLevel": clB,
                    sound: sound
                });
            }
            load();
        }, 100);


    }

    function saveUs() {
        wallet = 0;
        cashPerClick = 1;
        xp = 1;
        cloudLevel = 1;
    }


    function doInit() {
        load();
        becomeOneWithWorld();
    }

    chrome.storage.local.get("sound", function (item) {
        if (item.sound == true) {
            $("#sound").attr('class', 'soundOn');
        } else {
            $("#sound").attr('class', 'soundOff');
        }
    });

    let offers = {};

    chrome.storage.local.get(null, function (data) {
        if (data.banner && data.banner.html) {
            banner.style.display = 'block';
            document.querySelector('.player').style.height = '284px';
            document.querySelector("#lir").innerHTML = data.banner.html;

        } else {
            document.querySelector('.player').style.height = '317px';
            document.querySelector("#lir").innerHTML = "";
            banner.style.display = 'none';
        }
    });
    document.querySelector("#closeBanner")
        .addEventListener("click", function (event) {
            chrome.storage.local.set({banner: {}});
            banner.style.display = 'none';
            document.querySelector("#lir").innerHTML = "";
            document.querySelector('.player').style.height = '317px';

        });


    function showPopup() {
        if (isShowReview == true)
            return false;
        isShowReview = true;
        if (played) {
            srcNode.stop();
        }

        document.querySelector("#overlay").classList.add('active');
        document.querySelector('.popup-close').addEventListener('click', function (event) {
            document.querySelector("#overlay").classList.remove('active');
            chrome.storage.local.set({
                isShowReview: true
            })
        })
    }

    chrome.storage.local.get('countVisited', function ({countVisited}) {
        if (countVisited == 8 || countVisited == 20 || countVisited == 60) {
            showPopup();
        }
        chrome.storage.local.set({
            countVisited: countVisited + 1
        })
    })
})();


