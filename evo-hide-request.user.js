// ==UserScript==
// @name         Toggle colonna "Richieste in approvazione" Cartellino Unibo
// @namespace    http://tampermonkey.net/
// @version      2.3
// @description  Nasconde/mostra la colonna "Richieste in approvazione" senza sballare la tabella e ignorando i Totali settimanali e del mese
// @match        https://personale-unibo.hrgpi.it/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    let richiesteIndex = null;
    let hidden = false;

    function trovaIndiceColonna() {
        let table = document.querySelector("table.table-striped");
        if (!table) return null;

        let headerRow = table.querySelector("tr");
        if (!headerRow) return null;

        let headers = Array.from(headerRow.querySelectorAll("th"));
        let richiesteTh = headers.find(th =>
            th.innerText.replace(/\s+/g, " ").trim().startsWith("Richieste")
        );
        if (!richiesteTh) return null;

        let targetPos = 0;
        let currentPos = 0;
        for (let th of headers) {
            let span = parseInt(th.getAttribute("colspan") || "1", 10);
            currentPos += span;
            if (th === richiesteTh) {
                targetPos = currentPos;
                break;
            }
        }
        return targetPos;
    }

    function aggiornaColonna(nascondi) {
        let table = document.querySelector("table.table-striped");
        if (!table || richiesteIndex === null) return;

        table.querySelectorAll("tr").forEach(tr => {
            let firstCell = tr.querySelector("td, th");
            if (firstCell && /Totale\s+(settimanale|del mese)/i.test(firstCell.innerText)) {
                return; // skip i totali
            }

            let pos = 0;
            for (let cell of Array.from(tr.children)) {
                let span = parseInt(cell.getAttribute("colspan") || "1", 10);
                pos += span;
                if (pos === richiesteIndex) {
                    cell.style.display = nascondi ? "none" : "";
                    break;
                }
            }
        });
    }

    function creaBottone() {
        let container = document.querySelector("span.pt-1.pe-3");
        if (!container) return;

        // Trova il contenitore padre (quello che contiene data + badge verde)
        let parent = container.parentElement;
        if (!parent) return;

        // Rendi il contenitore flex per separare sinistra e destra
        parent.style.display = "flex";
        parent.style.justifyContent = "space-between";
        parent.style.alignItems = "center";

        let btn = document.createElement("button");
        btn.type = "button"; // evita refresh pagina
        btn.textContent = "Mostra Richieste";
        btn.style.padding = "6px 12px";
        btn.style.border = "none";
        btn.style.borderRadius = "6px";
        btn.style.cursor = "pointer";
        btn.style.backgroundColor = "#bb2e29";
        btn.style.color = "white";
        btn.style.fontFamily = "'Open Sans', sans-serif";
        btn.style.fontSize = "14px";
        btn.style.fontWeight = "600";

        btn.addEventListener("click", () => {
            hidden = !hidden;
            aggiornaColonna(hidden);
            btn.textContent = hidden ? "Mostra Richieste" : "Nascondi Richieste";
        });

        // Inserisci bottone come primo figlio (sinistra)
        parent.insertBefore(btn, parent.firstChild);
    }

    function init() {
        let titolo = document.querySelector(".title-label");
        if (!titolo || titolo.textContent.trim() !== "Cartellino") return;

        richiesteIndex = trovaIndiceColonna();
        if (richiesteIndex === null) return;

        // Nascondi di default
        aggiornaColonna(true);
        hidden = true;

        // Crea bottone toggle
        creaBottone();
    }

    window.addEventListener("load", init);
})();
