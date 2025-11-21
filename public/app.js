// public/app.js
// Handles dashboard: list, create, delete links

async function loadLinks() {
  const res = await fetch('/api/links');
  if (!res.ok) {
    document.getElementById('app').innerText = 'Failed to load links';
    return;
  }
  const links = await res.json();

  document.getElementById('app').innerHTML = `
    <form id="addForm" class="mb-6 space-y-4">
      <input name="target" placeholder="Enter long URL"
        class="border p-2 w-full" required>

      <input name="code" placeholder="Custom code (optional)"
        class="border p-2 w-full">

      <button class="bg-blue-600 text-white px-4 py-2">Create</button>
    </form>

    <table class="w-full border">
      <thead>
        <tr class="bg-gray-100">
          <th class="p-2">Code</th>
          <th class="p-2">Target</th>
          <th class="p-2">Clicks</th>
          <th class="p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        ${links
          .map(
            (l) => `
          <tr class="border-t">
            <td class="p-2"><a href="/${l.code}" class="text-blue-600">${l.code}</a></td>
            <td class="p-2 truncate max-w-xs"><a href="${l.target}" target="_blank">${l.target}</a></td>
            <td class="p-2">${l.total_clicks}</td>
            <td class="p-2">
              <button data-code="${l.code}" class="text-red-600 btn-delete">Delete</button>
              <a href="/stats/${l.code}" class="ml-2 text-sm text-gray-600">Stats</a>
            </td>
          </tr>`
          )
          .join('')}
      </tbody>
    </table>
  `;

  document.getElementById('addForm').onsubmit = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    const res = await fetch('/api/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(()=>({error:'unknown'}));
      alert('Error: ' + (err.error || 'unknown'));
      return;
    }
    loadLinks();
  };

  // attach delete handlers
  Array.from(document.querySelectorAll('.btn-delete')).forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const code = btn.dataset.code;
      if (!confirm('Delete ' + code + '?')) return;
      await fetch(`/api/links/${code}`, { method: 'DELETE' });
      loadLinks();
    });
  });
}

// initial load
document.addEventListener('DOMContentLoaded', loadLinks);
