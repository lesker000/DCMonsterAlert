// ==UserScript==
// @name         DCMonsterAlert
// @namespace    http://tampermonkey.net/
// @version      2024-01-03
// @description  Dodatek ma wołać na dc po pojawieniu się potwora z listy, przeznaczony dla nieśmiertelnej ekipy
// @author       Lesker
// @match        https://tempest.margonem.pl/
// @grant        none
// ==/UserScript==

/*
global API
global Engine
global log
*/

function lg(text){
    console.log(text);
}

class MobModel {
    constructor(name, webhookUrl, roleID) {
        this.name = name;
        this.webhookUrl = webhookUrl;
        this.roleID = roleID;
        this.roleStr = `<@&${roleID}>`;
    }
    checkNpc(n){
        if (n.d.nick == this.name) {
            return true;
        }
        return false
    }
}

class Model{
    constructor(){
        this.mob = null;
        this.mobs=[
            new MobModel(
                "Świąteczny Cerber",
                "https://discord.com/api/webhooks/1319417375497654343/U5sW_og3js6RZHojKoqBF-NnKznK_zSviFL21wRjFaO25rGy943ZKpWfRBYI_KbhpPOL",
                "1319042994711826433",
            ),
            new MobModel(
                "Świąteczny Tarrol Agze",
                "https://discord.com/api/webhooks/1319417375497654343/U5sW_og3js6RZHojKoqBF-NnKznK_zSviFL21wRjFaO25rGy943ZKpWfRBYI_KbhpPOL",
                "1319042994711826433",
            ),
            new MobModel(
                "Mroczny Patryk",
                "https://discord.com/api/webhooks/1324649639261114368/7zDTWl14wczNDHc4gzmR2B0s4f0J_2eDCzcZbVLQgGGr9WtdMutBbZlCb8Xfj-bNcdP1",
                "1033820862870212649",
            ),
            new MobModel(
                "Karmazynowy Mściciel",
                "https://discord.com/api/webhooks/1324649639261114368/7zDTWl14wczNDHc4gzmR2B0s4f0J_2eDCzcZbVLQgGGr9WtdMutBbZlCb8Xfj-bNcdP1",
                "1033782214418239589",
            ),
            new MobModel(
                "Złodziej",
                "https://discord.com/api/webhooks/1324649639261114368/7zDTWl14wczNDHc4gzmR2B0s4f0J_2eDCzcZbVLQgGGr9WtdMutBbZlCb8Xfj-bNcdP1",
                "1033782846885728256",
            ),
            new MobModel(
                "Zły Przewodnik",
                "https://discord.com/api/webhooks/1324649639261114368/7zDTWl14wczNDHc4gzmR2B0s4f0J_2eDCzcZbVLQgGGr9WtdMutBbZlCb8Xfj-bNcdP1",
                "1033782428986249287",
            ),
        ]

    }
    checkMobs(npc){
        if(npc.d.type != 4){
            for(let i=0; i<this.mobs.length;i++){
                if(this.mobs[i].checkNpc(npc)){
                    this.mob = this.mobs[i];
                    return true;
                   }
            }
        }
        return false
    }
}

class Controller {
    constructor(model) {
        this.model = model;
        this.run();
    }

    run(){
        API.addCallbackToEvent("newNpc", (npc) => {
            if(this.model.checkMobs(npc)){
                let mess = this.wordMessage(npc);
                lg(mess);
                this.sendMessage(mess);
            }
        });
    }

    wordMessage(n) {
        let rolePing = this.model.mob.roleStr;
        let mobName = `${this.model.mob.name} ${n.d.lvl}lv`;
        let location = `${Engine.map.d.name} (${n.d.x},${n.d.y})`;
        let hero = `${Engine.hero.d.nick} ${Engine.hero.d.lvl}lvl`;
        return `${rolePing} ${mobName} - ${location} - ${hero}`;
        }

    sendMessage(message) {
        console.log(message);
        const request = new XMLHttpRequest();
        let webhookURL = this.model.mob.webhookUrl;
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

}

(function() {
    'use strict';
    window.addEventListener('load', (event) => {
        if(!Engine.hero.d.clan.id == 1131 & !Engine.hero.d.clan.id == 3452){
            log("Poza klanem, kończymy")
            return 0
        }
        let model = new Model()
        let program = new Controller(model);
    });


})();
