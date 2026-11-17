// APPWRITE CONFIG (Fill in your IDs here when you connect the database)
const APPWRITE_CONFIG = {
    endpoint: 'https://cloud.appwrite.io/v1',
    projectId: 'YOUR_PROJECT_ID',
    databaseId: 'YOUR_DATABASE_ID',
    collectionId: 'tickets'
};

// Admin department emails (Maintenance & ICT)
const deptEmails = {
    "Maintenance": "maintenance@kampuniyako.co.tz",
    "ICT": "ict.support@kampuniyako.co.tz"
};

let currentUser = null;
let tickets = JSON.parse(localStorage.getItem('jobcard_tickets')) || [];

// 1. Login System
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('loginName').value;
    const dept = document.getElementById('loginDept').value;
    const isAdmin = (dept === 'Maintenance' || dept === 'ICT');

    currentUser = { name, dept, isAdmin };
    
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('dashboardSection').classList.remove('hidden');
    document.getElementById('userBadge').innerText = `User: ${name} | Department: ${dept} (${isAdmin ? 'ADMIN' : 'USER'})`;

    if (isAdmin) {
        document.getElementById('userFormCard').classList.add('hidden');
        document.getElementById('tableTitle').innerText = `All Tickets for the ${dept} Department (Admin Dashboard)`;
    } else {
        document.getElementById('userFormCard').classList.remove('hidden');
        document.getElementById('tableTitle').innerText = `Tickets Submitted by the ${dept} Department`;
    }

    renderTickets();
});

function logout() {
    currentUser = null;
    document.getElementById('dashboardSection').classList.add('hidden');
    document.getElementById('loginSection').classList.remove('hidden');
}

function updateTargetEmail() {
    const target = document.getElementById('targetDept').value;
    document.getElementById('targetEmail').value = deptEmails[target] || '';
}

// 2. Submit New Ticket (User)
document.getElementById('ticketForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const targetDept = document.getElementById('targetDept').value;
    const targetEmail = document.getElementById('targetEmail').value;
    const issueTitle = document.getElementById('issueTitle').value;
    const priority = document.getElementById('priority').value;
    const description = document.getElementById('description').value;

    const newTicket = {
        id: 'JC-' + Math.floor(1000 + Math.random() * 9000),
        date: new Date().toLocaleString('en-GB'),
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
    alert(`Ticket ${newTicket.id} has been sent to ${targetDept} (${targetEmail})!`);
});

// 3. Change Status (Admins Only: Maintenance / ICT)
function changeStatus(ticketId, newStatus) {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    if (newStatus === 'Pending') {
        const reason = prompt("Enter the reason for setting this ticket to PENDING (e.g. Waiting for spare parts):");
        if (!reason || reason.trim() === "") {
            alert("You must enter a reason before setting the ticket to Pending!");
            renderTickets();
            return;
        }
        ticket.pendingReason = reason;
    } else {
        ticket.pendingReason = '-';
    }

    ticket.status = newStatus;
    saveAndRender();
}

// 4. Status Colours
function getStatusBadge(status) {
    switch(status) {
        case 'Receive':
            return `<span class="px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white">Receive</span>`;
        case 'Pending':
            return `<span class="px-3 py-1 rounded-full text-xs font-bold bg-orange-500 text-white">Pending</span>`;
        case 'Progress':
            return `<span class="px-3 py-1 rounded-full text-xs font-bold bg-sky-500 text-white">Progress</span>`;
        case 'Done':
            return `<span class="px-3 py-1 rounded-full text-xs font-bold bg-green-600 text-white">Done</span>`;
        default:
            return status;
    }
}

// 5. Display Tickets
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
        tbody.innerHTML = `<tr><td colspan="7" class="p-4 text-center text-gray-500">No tickets at the moment.</td></tr>`;
        return;
    }

    filteredTickets.forEach(ticket => {
        let adminControls = '';
        if (currentUser.isAdmin) {
            adminControls = `
                <select onchange="changeStatus('${ticket.id}', this.value)" class="border rounded p-1 text-xs bg-white font-semibold">
                    <option value="Receive" ${ticket.status === 'Receive' ? 'selected' : ''}>Receive</option>
                    <option value="Pending" ${ticket.status === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="Progress" ${ticket.status === 'Progress' ? 'selected' : ''}>Progress</option>
                    <option value="Done" ${ticket.status === 'Done' ? 'selected' : ''}>Done</option>
                </select>
            `;
        }

        const row = `
            <tr class="hover:bg-gray-50">
                <td class="p-3 font-bold text-blue-700">${ticket.id}<br><span class="text-xs font-normal text-gray-400">${ticket.date}</span></td>
                <td class="p-3 font-medium">${ticket.senderDept}<br><span class="text-xs text-gray-500">${ticket.createdBy}</span></td>
                <td class="p-3">${ticket.targetDept}<br><span class="text-xs text-gray-400">${ticket.targetEmail}</span></td>
                <td class="p-3">
                    <span class="font-semibold">${ticket.issueTitle}</span>
                    <p class="text-xs text-gray-600 truncate max-w-xs">${ticket.description}</p>
                </td>
                <td class="p-3">${getStatusBadge(ticket.status)}</td>
                <td class="p-3 text-xs text-orange-700 font-medium">${ticket.pendingReason}</td>
                <td class="p-3 flex flex-col gap-1.5">
                    ${adminControls}
                    <button onclick="openPrintModal('${ticket.id}')" class="bg-gray-800 hover:bg-black text-white text-xs px-2.5 py-1.5 rounded flex items-center justify-center gap-1">
                        🖨️ Print JobCard
                    </button>
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

// 6. Open Print Form
function openPrintModal(ticketId) {
    const t = tickets.find(item => item.id === ticketId);
    if (!t) return;

    document.getElementById('pTicketNo').innerText = t.id;
    document.getElementById('pDate').innerText = t.date;
    document.getElementById('pSenderDept').innerText = t.senderDept;
    document.getElementById('pCreatedBy').innerText = "Prepared by: " + t.createdBy;
    document.getElementById('pTargetDept').innerText = t.targetDept;
    document.getElementById('pTargetEmail').innerText = t.targetEmail;
    document.getElementById('pTitle').innerText = t.issueTitle + ` (${t.priority})`;
    document.getElementById('pDesc').innerText = t.description;
    document.getElementById('pStatus').innerText = t.status;
    document.getElementById('pReason').innerText = t.pendingReason;

    document.getElementById('printModal').classList.remove('hidden');
}

function closePrintModal() {
    document.getElementById('printModal').classList.add('hidden');
}
