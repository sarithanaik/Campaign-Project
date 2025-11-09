const apiUrl = 'http://127.0.0.1:5000';

document.addEventListener('DOMContentLoaded', () => {

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    try {
        const res = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        if (data.success) {
            alert('Login successful!');
            window.location.href = 'dashboard.html';
        } else {
            alert(data.message);
        }
    } catch (err) {
        console.error('Login error:', err);
        alert('Error connecting to server.');
    }
    });
}

const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value.trim();
    try {
        const res = await fetch(`${apiUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        if (data.success) {
        alert('Registered successfully! Please log in.');
        window.location.href = 'index.html';
        } else {
        alert(data.message);
        }
    } catch (err) {
        console.error('Registration error:', err);
        alert('Error connecting to server.');
    }
    });
}

summaryDiv = document.getElementById('summary');
if (summaryDiv) {
    fetch(`${apiUrl}/campaigns`)
    .then((res) => res.json())
    .then((data) => {
        const active = data.filter((c) => c.status === 'Active').length;
        summaryDiv.innerHTML = `
        <p><strong>Total Campaigns:</strong> ${data.length}</p>
        <p><strong>Active Campaigns:</strong> ${active}</p>
        `;
    })
    .catch((err) => console.error('Error loading summary:', err));
}

const campaignForm = document.getElementById('campaignForm');
if (campaignForm) {
    campaignForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const campaignName = document.getElementById('campaignName').value.trim();
    const clientName = document.getElementById('clientName').value.trim();
    const startDate = document.getElementById('startDate').value;
    const status = document.getElementById('status').value;
    if (!campaignName || !clientName || !startDate) {
        alert('Please fill all fields!');
        return;
    }
    try {
        const res = await fetch(`${apiUrl}/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignName, clientName, startDate, status }),
        });
        const data = await res.json();
        if (data.success) {
        alert('Campaign added successfully!');
        campaignForm.reset();
        if (window.location.pathname.includes('view_campaigns.html')) {
            loadCampaigns();
        } else {
            window.location.href = 'view_campaigns.html';
        }
        } else {
        alert(data.message || 'Failed to add campaign.');
        }
    } catch (err) {
        console.error(err);
        alert('Server error. Check console.');
    }
    });
}

const campaignTable = document.getElementById('campaignTableBody');
const searchInput = document.getElementById('search');
async function loadCampaigns() {
    try {
    const res = await fetch(`${apiUrl}/campaigns`);
    const data = await res.json();
    displayCampaigns(data);
    } catch (err) {
    console.error('Error loading campaigns:', err);
    }
}
function displayCampaigns(campaigns) {
    if (!campaignTable) return;
    const filter = searchInput ? searchInput.value.toLowerCase() : '';
    campaignTable.innerHTML = '';
    campaigns
    .filter(
        (c) =>
        c.campaignName.toLowerCase().includes(filter) ||
        c.clientName.toLowerCase().includes(filter)
    )
    .forEach((c) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
        <td>${c.campaignName}</td>
        <td>${c.clientName}</td>
        <td>${c.startDate}</td>
        <td>
            <select onchange="updateStatus(${c.id}, this.value)">
            <option value="Active" ${c.status === 'Active' ? 'selected' : ''}>Active</option>
            <option value="Paused" ${c.status === 'Paused' ? 'selected' : ''}>Paused</option>
            <option value="Completed" ${c.status === 'Completed' ? 'selected' : ''}>Completed</option>
            </select>
        </td>
        <td><button onclick="deleteCampaign(${c.id})">Delete</button></td>
        `;
        campaignTable.appendChild(tr);
    });
}
window.updateStatus = async (id, status) => {
    try {
    await fetch(`${apiUrl}/campaigns/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
    });
    loadCampaigns();
    } catch (err) {
    console.error('Error updating status:', err);
    }
};

window.deleteCampaign = async (id) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    try {
    await fetch(`${apiUrl}/campaigns/${id}`, { method: 'DELETE' });
    loadCampaigns();
    } catch (err) {
    console.error('Error deleting campaign:', err);
    }
};
if (searchInput) searchInput.addEventListener('input', loadCampaigns);
if (campaignTable) loadCampaigns();
});
