// public/stats.js
// Handles loading and deleting a single link's stats

async function loadStats() {
  const code = location.pathname.split('/').pop();
  const res = await fetch('/api/links/' + code);
  if (!res.ok) {
    document.getElementById('stat').innerText = 'Not found';
    return;
  }
  const link = await res.json();
  document.getElementById('stat').innerHTML = `
    <div class="border p-4">
      <div><strong>Code:</strong> ${link.code}</div>
      <div><strong>Target:</strong> <a href="${link.target}" target="_blank">${link.target}</a></div>
      <div><strong>Created:</strong> ${new Date(link.created_at).toLocaleString()}</div>
      <div><strong>Total clicks:</strong> ${link.total_clicks}</div>
      <div><strong>Last clicked:</strong> ${link.last_clicked ? new Date(link.last_clicked).toLocaleString() : 'never'}</div>
      <div class="mt-4">
        <button id="deleteBtn" class="bg-red-600 text-white px-3 py-1">Delete</button>
      </div>
    </div>
  `;

  document.getElementById('deleteBtn').addEventListener('click', async () => {
    if (!confirm('Delete this link?')) return;
    await fetch('/api/links/' + code, { method: 'DELETE' });
    location.href = '/';
  });
}

document.addEventListener('DOMContentLoaded', loadStats);
