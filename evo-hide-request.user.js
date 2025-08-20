// ==UserScript==
// @name        EVO - Nascondi Richieste in Approvazione
// @namespace   https://unibo.it/
// @version     3.3
// @description Nasconde/mostra la colonna "Richieste in approvazione" senza sballare la tabella del cartellino.
// @match       https://personale-unibo.hrgpi.it/*
// @icon        https://www.unibo.it/favicon.ico
// @grant       none
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

        // Nasconde/mostra la colonna "Richieste in approvazione"
        table.querySelectorAll("tr").forEach(tr => {
            let firstCell = tr.querySelector("td, th");
            const isTotalRow = firstCell && /Totale\s+(settimanale|del mese)/i.test(firstCell.innerText);

            if (!isTotalRow) {
                // Per le righe "normali" nasconde la cella
                let pos = 0;
                for (let cell of Array.from(tr.children)) {
                    let span = parseInt(cell.getAttribute("colspan") || "1", 10);
                    pos += span;
                    if (pos === richiesteIndex) {
                        cell.style.display = nascondi ? "none" : "";
                        break;
                    }
                }
            } else {
                // Per le righe "Totale" modifica il colspan
                let currentColspan = parseInt(firstCell.getAttribute("colspan") || "1", 10);
                if (nascondi) {
                    firstCell.setAttribute("colspan", currentColspan - 1);
                } else {
                    firstCell.setAttribute("colspan", currentColspan + 1);
                }
            }
        });
    }

    function creaBottone() {
        let container = document.querySelector("div.d-flex.justify-content-end");
        if (!container) return;

        let btn = document.createElement("button");
        btn.type = "button";
        
        // Imposta il testo iniziale del pulsante in base allo stato "hidden"
        btn.textContent = hidden ? "Mostra Richieste" : "Nascondi Richieste";

        btn.style.padding = "6px 12px";
        btn.style.border = "none";
        btn.style.borderRadius = "6px";
        btn.style.cursor = "pointer";
        btn.style.backgroundColor = "#bb2e29";
        btn.style.color = "white";
        btn.style.fontFamily = "'Open Sans', sans-serif";
        btn.style.fontSize = "14px";
        btn.style.fontWeight = "600";
        btn.style.marginRight = "auto";
        btn.style.order = "-1";

        btn.addEventListener("click", () => {
            hidden = !hidden;
            aggiornaColonna(hidden);
            btn.textContent = hidden ? "Mostra Richieste" : "Nascondi Richieste";
        });

        container.appendChild(btn);
    }

    function init() {
        let titolo = document.querySelector(".title-label");
        if (!titolo || titolo.textContent.trim() !== "Cartellino") return;

        richiesteIndex = trovaIndiceColonna();
        if (richiesteIndex === null) return;

        aggiornaColonna(true);
        hidden = true;

        creaBottone();
    }

    window.addEventListener("load", init);
})();
