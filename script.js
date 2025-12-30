const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSIp2laD55RuKc2tn-m5X8JVMR70mjgfFCLuyB7IirpUDwZQUMp3u_dfd16oNEOmVZfOGpeqktlndg8/pub?output=csv";
const classroomSheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT0anoFy_YNRIVWoulfmJFN7XY3wSmdwwr4-bwXVa_26uzqFLDKOAMc68og3Cq3vVht4ZHMPQ2VJiFF/pub?output=csv";

// CSV Parser
function parseCSV(text) {
    const rows = [], row = [], value = "", insideQuotes = false;
    let rowTemp = [], val = "", inside = false;
    let r = [], v = "", inQuotes = false;
    const result = [], temp = [];
    const arr = [];
    let currentRow = [];
    let currentVal = "";
    let insideQuote = false;
    let data = [];
    const lines = text.split("\n");
    lines.forEach(line => {
        const row = [];
        let val = "", inside = false;
        for (let i = 0; i < line.length; i++) {
            const c = line[i], next = line[i + 1];
            if (c === '"' && inside && next === '"') { val += '"'; i++; }
            else if (c === '"') { inside = !inside; }
            else if (c === ',' && !inside) { row.push(val); val = ""; }
            else { val += c; }
        }
        row.push(val);
        data.push(row);
    });
    return data;
}

document.addEventListener("DOMContentLoaded", () => {
    const role = localStorage.getItem("userRole");
    const hostPanel = document.getElementById("host-announcement-panel");

    if (role === "host") hostPanel.style.display = "block";
    else document.getElementById("view-only-label").style.display = "block";

    // Fetch announcements
    fetch(sheetURL)
        .then(res => res.text())
        .then(text => {
            const data = parseCSV(text);
            const headers = data[0];
            const rows = data.slice(1);

            const getIndex = name => headers.indexOf(name);
            const titleIdx = getIndex("Column 2");
            const descIdx = getIndex("DESCRIPTION");
            const yearIdx = getIndex("WHICH YEAR");
            const dateIdx = getIndex("DATE");
            const timeIdx = getIndex("TIMING");

            const container = document.getElementById("announcements-container");
            container.innerHTML = "";

            rows.forEach(r => {
                if (!r[titleIdx]) return;
                const card = document.createElement("div");
                card.className = "announcement-card";
                card.innerHTML = `
                <h3>${r[titleIdx]}</h3>
                <p>${r[descIdx] || ""}</p>
                <small>${r[yearIdx] || ""} | ${r[dateIdx] || ""} | ${r[timeIdx] || ""}</small>
            `;
                container.appendChild(card);
            });
        })
        .catch(err => console.error("Announcement error:", err));

    // Fetch classrooms
    fetch(classroomSheetURL)
        .then(res => res.text())
        .then(csv => {
            const data = parseCSV(csv);
            const headers = data[0].map(h => h.trim());
            const roomIdx = headers.indexOf("ROOM NO");
            const timeIdx = headers.indexOf("TIMING");
            const statusIdx = headers.indexOf("STATUS");

            if (roomIdx === -1 || timeIdx === -1 || statusIdx === -1) {
                console.error("Header mismatch", headers); return;
            }

            const tbody = document.querySelector("#classroom-table tbody");
            tbody.innerHTML = "";

            data.slice(1).forEach(row => {
                if (!row[roomIdx]) return;
                const tr = document.createElement("tr");
                tr.innerHTML = `
                <td>${row[roomIdx]}</td>
                <td>${row[timeIdx]}</td>
                <td>${row[statusIdx]}</td>
            `;
                const statusCell = tr.querySelector("td:nth-child(3)");
                const text = statusCell.textContent.toLowerCase();
                if (text.includes("free") || text.includes("empty")) statusCell.classList.add("status-free");
                else statusCell.classList.add("status-occupied");

                tbody.appendChild(tr);
            });
        })
        .catch(err => console.error("Classroom error:", err));
});
