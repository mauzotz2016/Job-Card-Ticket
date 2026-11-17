// =========================================================================
// 1. APPWRITE CONFIGURATION (Jaza ID zako ukishatengeneza Project Appwrite)
// =========================================================================
const APPWRITE_CONFIG = {
    endpoint: 'https://cloud.appwrite.io/v1',
    projectId: 'WEKA_PROJECT_ID_HAPA',
    databaseId: 'WEKA_DATABASE_ID_HAPA',
    collectionId: 'tickets'
};

// Barua pepe za idara za Admin (Maintenance na ICT)
const deptEmails = {
    "Maintenance": "maintenance@kampuniyako.co.tz",
    "ICT": "ict.support@kampuniyako.co.tz"
};

let currentUser = null;
let tickets = JSON.parse(localStorage.getItem('jobcard_tickets')) || [];

// =========================================================================
// 2. MFUMO WA LOGIN (USER = IDARA, ADMIN = MAINTENANCE / ICT)
// =========================================================================
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('loginName').value.trim();
    const dept = document.getElementById('loginDept').value;
    const isAdmin = (dept === 'Maintenance' || dept === 'ICT');

    currentUser = { name, dept, isAdmin };
    
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('dashboardSection').classList.remove('hidden');
    document.getElementById('userBadge').innerText = `Mtumiaji: ${name} | Idara: ${dept} (${isAdmin ? 'ADMIN' : 'USER'})`;

    if (isAdmin) {
        document.getElementById('userFormCard').classList.add('hidden');
        document.getElementById('tableTitle').innerText = `Tiketi Zote Zinazohusu Idara ya ${dept} (Admin Dashboard)`;
    } else {
        document.getElementById('userFormCard').classList.remove('hidden');
        document.getElementById('tableTitle').innerText = `Tiketi Zilizotumwa na Idara ya ${dept}`;
    }

    renderTickets();
});

function logout() {
    currentUser = null;
    document.getElementById('dashboardSection').classList.add('hidden');
    document.getElementById('loginSection').classList.remove('hidden');
}

// Jaza Email ya idara husika kiautomatiki
function updateTargetEmail() {
    const target = document.getElementById('targetDept').value;
    document.getElementById('targetEmail').value = deptEmails[target] || '';
}

// =========================================================================
// 3. KUTUMA TIKETI MPYA (USER)
// =========================================================================
document.getElementById('ticketForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const targetDept = document.getElementById('targetDept').value;
    const targetEmail = document.getElementById('targetEmail').value;
    const issueTitle = document.getElementById('issueTitle').value.trim();
    const priority = document.getElementById('priority').value;
    const description = document.getElementById('description').value.trim();

    const newTicket = {
        id: 'JC-' + Math.floor(1000 + Math.random() * 9000),
        date: new Date().toLocaleString('sw-TZ'),
        senderDept: currentUser.dept,
        createdBy: currentUser.name,
        targetDept: targetDept,
        targetEmail: targetEmail,
        issueTitle: issueTitle,
        priority: priority,
        description: description,
        status: 'Receive',
        pendingReason: '-'
    };

    tickets.unshift(newTicket);
    saveAndRender();
    this.reset();
    alert(`Tiketi ${newTicket.id} imetumwa kwenda ${targetDept} (${targetEmail})!`);
});

// =========================================================================
// 4. KUBADILI STATUS (ADMIN PEKEE: MAINTENANCE / ICT)
// =========================================================================
function changeStatus(ticketId, newStatus) {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    if (newStatus === 'Pending') {
        const reason = prompt("Weka sababu ya tiketi hii kuwa PENDING (mfano: Tunangoja spea):");
        if (!reason || reason.trim() === "") {
            alert("Lazima uweke sababu kabla ya kuiweka kwenye Pending!");
            renderTickets();
            return;
        }
        ticket.pendingReason = reason.trim();
    } else {
        ticket.pendingReason = '-';
    }

    ticket.status = newStatus;
    saveAndRender();
}

function getStatusBadge(status) {
    switch(status) {
        case 'Receive':
            return `<span class="badge-status bg-receive">Receive</span>`;
        case 'Pending':
            return `<span class="badge-status bg-pending">Pending</span>`;
        case 'Progress':
            return `<span class="badge-status bg-progress">Progress</span>`;
        case 'Done':
            return `<span class="badge-status bg-done">Done</span>`;
        default:
            return status;
    }
}

// =========================================================================
// 5. KUONYESHA TIKETI KWENYE JEDWALI
// =========================================================================
function renderTickets() {
    const tbody = document.getElementById('ticketsTableBody');
    tbody.innerHTML = '';

    const filteredTickets = tickets.filter(t => {
        if (currentUser.isAdmin) {
            return t.targetDept === currentUser.dept;
        } else {
            return t.senderDept === currentUser.dept;
        }
    });

    if (filteredTickets.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#6b7280; padding:1.5rem;">Hakuna tiketi yoyote kwa sasa.</td></tr>`;
        return;
    }

    filteredTickets.forEach(ticket => {
        let adminControls = '';
        if (currentUser.isAdmin) {
            adminControls = `
                <select onchange="changeStatus('${ticket.id}', this.value)" class="status-select">
                    <option value="Receive" ${ticket.status === 'Receive' ? 'selected' : ''}>Receive</option>
                    <option value="Pending" ${ticket.status === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="Progress" ${ticket.status === 'Progress' ? 'selected' : ''}>Progress</option>
                    <option value="Done" ${ticket.status === 'Done' ? 'selected' : ''}>Done</option>
                </select>
            `;
        }

        const row = `
            <tr>
                <td><strong>${ticket.id}</strong><br><span class="small-text">${ticket.date}</span></td>
                <td><strong>${ticket.senderDept}</strong><br><span class="small-text">${ticket.createdBy}</span></td>
                <td>${ticket.targetDept}<br><span class="small-text">${ticket.targetEmail}</span></td>
                <td>
                    <strong>${ticket.issueTitle}</strong> (${ticket.priority})
                    <p class="small-text">${ticket.description}</p>
                </td>
                <td>${getStatusBadge(ticket.status)}</td>
                <td class="text-orange"><strong>${ticket.pendingReason}</strong></td>
                <td>
                    <div class="actions-cell">
                        ${adminControls}
                        <button onclick="openPrintModal('${ticket.id}')" class="btn btn-dark">Print JobCard</button>
                    </div>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function saveAndRender() {
    localStorage.setItem('jobcard_tickets', JSON.stringify(tickets));
    renderTickets();
}

// =========================================================================
// 6. KUFUNGUA FOMU YA KU-PRINT (MANUAL WORK)
// =========================================================================
function openPrintModal(ticketId) {
    const t = tickets.find(item => item.id === ticketId);
    if (!t) return;

    document.getElementById('pTicketNo').innerText = t.id;
    document.getElementById('pDate').innerText = t.date;
    document.getElementById('pSenderDept').innerText = t.senderDept;
    document.getElementById('pCreatedBy').innerText = "Imeandaliwa na: " + t.createdBy;
    document.getElementById('pTargetDept').innerText = t.targetDept;
    document.getElementById('pTargetEmail').innerText = t.targetEmail;
    document.getElementById('pTitle').innerText = `${t.issueTitle} (${t.priority})`;
    document.getElementById('pDesc').innerText = t.description;
    document.getElementById('pStatus').innerText = t.status;
    document.getElementById('pReason').innerText = t.pendingReason;

    document.getElementById('printModal').classList.remove('hidden');
}

function closePrintModal() {
    document.getElementById('printModal').classList.add('hidden');
}
