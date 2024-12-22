// ==UserScript==
// @name         DC eve40 pinger
// @namespace    http://tampermonkey.net/
// @version      2024-12-18
// @description  try to take over the world!
// @author       Lesker
// @match        https://tempest.margonem.pl/
// @grant        none
// ==/UserScript==

/*
global API
global Engine

*/

/*
normal-monster
elita1
*/


class MobModel {
    constructor(name, webhookUrl, roleID) {
        this.name = name;
        this.webhookUrl = webhookUrl;
        this.roleID = roleID;
        this.roleStr = `<@&${roleID}>`;
    }
    checkNpc(n) {
        if (n.d.type == 2) {
            if (n.d.nick != this.name) {
                return false;
            }
            return true;
        }
        return false;
    }
}

class Controller {
    constructor(mobModel) {
        this.mobModel = mobModel;
        this.run();
    }
    run(){
        // Sprawdzanie nowych mobów na mapie
        API.addCallbackToEvent("newNpc", (npc) => {
            if (this.mobModel.checkNpc(npc)) {
                console.log(npc.d.nick, npc.getKind(), npc.d.wt, npc);
                this.sendMessage(this.wordMessage(npc));
            }
        });
    }

    wordMessage(n) {
        console.log(this.mobModel.roleStr);
        let rolePing = this.mobModel.roleStr;
        let mobName = `${this.mobModel.name} ${this.mobModel.d.lvl}lv`;
        let location = `${Engine.map.d.name} (${n.d.x},${n.d.y})`;
        let hero = `${Engine.hero.d.nick} ${Engine.hero.d.lvl}lvl`;
        return `${rolePing} ${mobName} - ${location} - ${hero}`;}

    sendMessage(message) {
        console.log(message);
        const request = new XMLHttpRequest();
        let webhookURL = this.mobModel.webhookUrl;
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
    /*
    let mobModel = new MobModel(
        "Tyrtajos",
        "https://discord.com/api/webhooks/1319411938228441209/t9LkmWDBXqOCr1T_uMJwaYDcgGoial_uwgZmDIwiUKbNWJ7f0IfUkPE0uEQauv_EfI2R",
        "1319069418508128319",
    );
    */
    let mobModel = new MobModel(
        "Świąteczny Cerber",
        "https://discord.com/api/webhooks/1319417375497654343/U5sW_og3js6RZHojKoqBF-NnKznK_zSviFL21wRjFaO25rGy943ZKpWfRBYI_KbhpPOL",
        "1319042994711826433",
    );
    let program = new Controller(mobModel);
})();
