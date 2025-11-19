// ==UserScript==
// @name DCMonsterAlert
// @namespace http://tampermonkey.net/
// @version 0.09
// @description Dodatek ma wołać na dc po pojawieniu się potwora z listy, przeznaczony dla nieśmiertelnej ekipy.
// @author Lesker
// @match https://tempest.margonem.pl/
// @icon https://raw.githubusercontent.com/lesker000/DCMonsterAlert/refs/heads/main/out.gif
// @grant none
// @downloadURL https://github.com/lesker000/DCMonsterAlert/raw/refs/heads/main/main.user.js
// @updateURL https://github.com/lesker000/DCMonsterAlert/raw/refs/heads/main/main.user.js
// ==/UserScript==

const version = "0.9";

/*
global API
global Engine
global log
global _g
*/

const MEMORY_MANAGER = {
    STORAGE_KEY: 'LESKER_DC_ALERT_cache',
	initialize() {
        this.cleanupExpiredMobs();
        if (this.shouldSendDailyReport()) {
			let mess = `${Engine.hero.getNick()} | ${version}`;
			sendMessageToWebhook(mess, WEBHOOKS_LINKS.daily_report);
            this.updateLastReportTime();
        }
    },

    getCache() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : { lastReport: 0, mobs: {} };
        } catch (e) {
            return { lastReport: 0, mobs: {} };
        }
    },

    saveCache(cache) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cache));
        } catch (e) {
            console.error('Błąd zapisu cache:', e);
        }
    },

    shouldSendDailyReport() {
        const cache = this.getCache();
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;

        return (now - cache.lastReport) > oneDay;
    },

    updateLastReportTime() {
        const cache = this.getCache();
        cache.lastReport = Date.now();
        this.saveCache(cache);
    },

    canSendMobAlert(mobName) {
        const cache = this.getCache();
        const now = Date.now();
        const oneMinute = 60 * 1000;

        const lastAlert = cache.mobs[mobName] || 0;
        return (now - lastAlert) > oneMinute;
    },

    updateMobAlertTime(mobName) {
        const cache = this.getCache();
        cache.mobs[mobName] = Date.now();
        this.saveCache(cache);
    },

    cleanupExpiredMobs() {
        const cache = this.getCache();
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;

        let cleaned = false;
        for (const mobName in cache.mobs) {
            if ((now - cache.mobs[mobName]) > oneHour) {
                delete cache.mobs[mobName];
                cleaned = true;
            }
        }

        if (cleaned) {
            this.saveCache(cache);
        }
    }
};

const WEBHOOKS_LINKS = {
	niesmiertelni: "https://discord.com/api/webhooks/1324649639261114368/7zDTWl14wczNDHc4gzmR2B0s4f0J_2eDCzcZbVLQgGGr9WtdMutBbZlCb8Xfj-bNcdP1",
	immortalsxkongo:"https://discord.com/api/webhooks/1398242009050775633/_v4UDzcghP-mnuO7CmUt8Fdaq9UHnugmILCijWJd1zBA1fQOmaiV8lTOGqigS7okXB8V",
	errors:"https://discord.com/api/webhooks/1328562952445624332/RhTTwPx76Of2t9J0zcNbKhStzBvN7W6p4kI9InXy41eG9WCqXI9wC-ulY5W4ccljg7dx",
	info_logs:"https://discord.com/api/webhooks/1325617566755983520/O40pCrOw-F1DbX3TyuXwwreDC5VRXB6VBWU4UrdAzLotHcyyn8lA8ruzloSWvlryTb10",
	heros_test:"https://discord.com/api/webhooks/1357322319323730061/jTpa6SK2SiAae2pYdhs6R9v5mYX2UZYl_iRlj6WIb1LocIVo3duv15PrdQRNeHi5EetV",
	daily_report:"https://discord.com/api/webhooks/1440551899035205642/Aope6p5gdjXYWIdkd--_ktKMXHEU1I5Fp0qvci-7U74nZBN1Yl7dYMRJQE6BjwYCc2Yy"
}

const TARGET_MOBS = [
{
	id: 17405,
	name: "Mroczny Patryk",
	lvl: 35,
	webhooks: [
		{
			url: WEBHOOKS_LINKS.niesmiertelni,
			roleId: "1033820862870212649"
		},
		{
			url: WEBHOOKS_LINKS.immortalsxkongo,
			roleId: "1424556172010066051"
		}
	]
},
{
	id: 17439,
	name: "Karmazynowy Mściciel",
	lvl: 45,
	webhooks: [
		{
			url: WEBHOOKS_LINKS.niesmiertelni,
			roleId: "1033782214418239589"
		},
		{
			url: WEBHOOKS_LINKS.immortalsxkongo,
			roleId: "1397616078774992976"
		}
		]
},
{
	id: 40601,
	name: "Złodziej",
	lvl: 51,
	webhooks: [
		{
			url: WEBHOOKS_LINKS.niesmiertelni,
			roleId: "1033782846885728256"
		},
		{
			url: WEBHOOKS_LINKS.immortalsxkongo,
			roleId: "1397616190792273960"
		}
	]
},
{
	id: 17402,
	name: "Zły Przewodnik",
	lvl: 63,
	webhooks: [
		{
			url: WEBHOOKS_LINKS.niesmiertelni,
			roleId: "1033782428986249287"
		}
	]
},
{
	id: 17494,
	name: "Opętany Paladyn",
	lvl: 74,
	webhooks: [
		{
			url: WEBHOOKS_LINKS.niesmiertelni,
			roleId: "1259621257498857482"
		}
	]
},
{
	id: 19743,
	name: "Piekielny Kościej",
	lvl: 85,
	webhooks: [
		{
			url: WEBHOOKS_LINKS.niesmiertelni,
			roleId: "1259621430933454848"
		}
	]
},
{
	id: 278168,
	name: "Koziec Mąciciel Ścieżek",
	lvl: 94,
	webhooks: [
		{
			url: WEBHOOKS_LINKS.niesmiertelni,
			roleId: "1259622347023978567"
		}
	]
},
{
	id: 17438,
	name: "Kochanka Nocy",
	lvl: 102,
	webhooks: [
		{
			url: WEBHOOKS_LINKS.niesmiertelni,
			roleId: "1278048863927668838"
		}
	]
},
{
	id: 27031,
	name: "Książe Kasim",
	lvl: 116,
	webhooks: [
		{
			url: WEBHOOKS_LINKS.niesmiertelni,
			roleId: "1278049080836362250"
		}
	]
},
{
	id: 322259,
	name: "Święty Braciszek",
	lvl: 123,
	webhooks: [
		{
			url: WEBHOOKS_LINKS.niesmiertelni,
			roleId: "1317263595804823562"
		}
	]
}
];

const INTERESTING_MOBS = {
	id:[],
	nick:["Tropiciel Herosów","Wtajemniczony Tropiciel Herosów","Doświadczony Tropiciel Herosów"]
}

function olog(message) {
    console.log(`[DCMonsterAlert] ${message}`);
}

function isHeroInClan(){
	try {
		if (!Engine.hero.d.clan) return false;
		const clanIds = [1131, 3452];
		if (clanIds.includes(Engine.hero.d.clan.id))return true;
		return false;
	} catch (error) {
		console.error("Błąd sprawdzania klanu:\n", error);
		return false;
	}
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function stringifyCircular(obj) {
    const cache = new Set();

    const formatted = JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (cache.has(value)) {
                return '[Circular Reference]';
            }
            cache.add(value);
        }
        return value;
    }, 2);
    return formatted
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}


function ownCallbackToEvent(npc){
	function isKindNull(npc) {
		if (!npc.d) {
			return false;
		}

		if (typeof npc.getKind !== 'function') {
			return false;
		}

		const kind = npc.getKind();
		return kind === null;
	}

	function handleClanTargetMob(npc){
		function findTargetMobToClan(npc) {
			if (!npc || typeof npc.getId !== 'function') {
				return null;
			}

			const npcId = npc.getId();
			const foundById = TARGET_MOBS.find(mob => mob.id === npcId);
			if (foundById) {
				return foundById;
			}

			// if tropiciel
			if (typeof npc.getNick === 'function') {
				const npcName = npc.getNick();

				const tropiciele = ["Tropiciel Herosów", "Wtajemniczony Tropiciel Herosów", "Doświadczony Tropiciel Herosów"];

				if (tropiciele.includes(npcName)) {
					// Szukaj tropiciela po poziomie
					if (typeof npc.getLevel === 'function') {
						const npcLevel = npc.getLevel();
						
						const foundByLevel = TARGET_MOBS.find(mob => {
							const levelMatch = mob.lvl === npcLevel;
							return levelMatch;
						});
						return foundByLevel || null;
					} else {
					}
				}
			}
			return null;
		}


		function prepareMessageToChatAndSend(npc){
			function sendMessageToClanChat(message) {
				_g('chat&channel=clan', !1, {
					c: message
				});
			}
		const npcNick = `${npc.getNick()} ${npc.getLevel()}lvl`;
			const mapName = Engine.map.d.name;
			const npcX = npc.getX();
			const npcY = npc.getY();

			let message = `${npcNick} - ${mapName} (${npcX}, ${npcY})`;
			sendMessageToClanChat(message);

		}

		const targetMobToClan = findTargetMobToClan(npc);
		if (targetMobToClan === null){
			return;
		}
		if (!MEMORY_MANAGER.canSendMobAlert(npc.getNick()))return;
		prepareMessageToChatAndSend(npc);
		prepareMessagesToWebhookAndSend(targetMobToClan, npc);
		MEMORY_MANAGER.updateMobAlertTime(npc.getNick());
	}

	function handleResearchData(npc){
		function prepareMessAndSend(npc){
			let mess = ``;
			mess += `${Engine.hero.getNick()} ${Engine.hero.getLevel()} | `;
			mess += `${npc.getNick()} ${npc.getLevel()} \n`;
			mess += `${stringifyCircular(npc)} \n`;
			mess += `version: ${version}`;
			sendMessageToWebhook(mess, WEBHOOKS_LINKS.info_logs)
		}
		const notInterestingKinds = ['null', 'recovery', 'normal-monster', 'npcs', 'elita1'];
		let isInteresting = false;
		if(INTERESTING_MOBS.id.includes(npc.getId())) isInteresting = true;
		else if (INTERESTING_MOBS.nick.includes(npc.getNick())) isInteresting = true;
		else if (!notInterestingKinds.includes(npc.getKind())) isInteresting = true;
		if(!isInteresting)return;
		prepareMessAndSend(npc);

	}

	if (isKindNull(npc)){
		return true;
	}

	handleResearchData(npc);
	handleClanTargetMob(npc);
}

function prepareMessagesToWebhookAndSend(targetMob, npc) {
    if (!targetMob || !targetMob.webhooks || !npc) {
        return;
    }
    const heroNick = Engine.hero.getNick();
	const npcNick = npc.getNick();
    const mapName = Engine.map.d.name;
    const npcX = npc.getX();
    const npcY = npc.getY();
    targetMob.webhooks.forEach(webhook => {
		let message = ``;
        const roleId = webhook.roleId;
		if(roleId)message+=`<@&${roleId}>\n`
        message += `${npcNick} - **${mapName} (${npcX}, ${npcY})**\nWykrył: ${heroNick}`;
        sendMessageToWebhook(message, webhook.url);
    });
}

function sendMessageToWebhook(message, webhookUrl) {
	const request = new XMLHttpRequest();
	request.open("POST", webhookUrl, true);
	request.setRequestHeader("Content-Type", "application/json");
	const payload = {
		content: message
	};

	request.onload = function() {
		if (request.status >= 200 && request.status < 300) {
			//wiadomość wysłana
		} else {
			console.error("Błąd przy wysyłaniu wiadomości: ", request.statusText);
		}
	};

	request.onerror = function() {
		console.error("Błąd sieci");
	};

	request.send(JSON.stringify(payload));
}


(async function() {
	'use strict';
	while (!Engine || !Engine.map || !Engine.map.d || !Engine.map.d.name || !Engine.hero || !Engine.hero.d || !Engine.hero.d.x || !Engine.npcs.getDrawableList()) {
		await sleep(150);
	}
	MEMORY_MANAGER.initialize();

	if (isHeroInClan()) {
		log("Wołacz Herosów na DC uruchomiony.");
		try{
			API.addCallbackToEvent("newNpc", ownCallbackToEvent);
		}
		catch (error) {
			const errorMessage = `ERROR\n${Engine.hero.d.nick}\n${error.message}\n${error.stack}\n${version}\n`;
			sendMessageToWebhook(errorMessage, WEBHOOKS_LINKS.errors)
		};
	}
	else{
		log("Postać spoza Nieśmiertelnego konglomeratu, wołacz wyłączony.");
		return;
	}
})();

