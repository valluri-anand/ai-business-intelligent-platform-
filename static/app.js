document.addEventListener("DOMContentLoaded", () => {
    // KPI Bars
    function parseNum(v) {
        if (!v) return 0;
        let c = v.replace(/[$,\s]/g, '');
        let neg = c.startsWith('(') && c.endsWith(')');
        if (neg) c = c.slice(1, -1);
        let n = parseFloat(c);
        return isNaN(n) ? 0 : (neg ? -n : n);
    }
    
    const panels = document.querySelectorAll('.kpi-panel');
    panels.forEach(p => {
        const rows = p.querySelectorAll('.kpi-item');
        let max = 0;
        const vals = Array.from(rows).map(r => {
            const num = parseNum(r.querySelector('.kpi-val').textContent);
            if (Math.abs(num) > max) max = Math.abs(num);
            return num;
        });
        
        rows.forEach((r, i) => {
            const fill = r.querySelector('.kpi-bar-fill');
            if (fill) {
                let pct = max > 0 ? (Math.abs(vals[i]) / max) * 100 : 10;
                fill.style.width = pct + '%';
                if (vals[i] < 0) fill.style.background = 'var(--error)';
            }
        });
    });

    const sel = document.getElementById('companySelect');
    if (sel && sel.options.length) window.switchCompany(sel.value);

    // Upload
    const dz = document.getElementById('dropzone');
    const fi = document.getElementById('fileInput');
    const pc = document.getElementById('progressContainer');
    const pf = document.getElementById('progressBarFill');
    const ps = document.getElementById('progressStatus');
    const pp = document.getElementById('progressPercent');

    if (dz) {
        dz.ondragover = e => { e.preventDefault(); dz.style.borderColor = 'var(--accent)'; }
        dz.ondragleave = e => { e.preventDefault(); dz.style.borderColor = 'var(--border-color)'; }
        dz.ondrop = e => {
            e.preventDefault(); dz.style.borderColor = 'var(--border-color)';
            if (e.dataTransfer.files.length) upload(e.dataTransfer.files[0]);
        }
        fi.onchange = () => { if (fi.files.length) upload(fi.files[0]); }
    }

    function upload(file) {
        if (!file.name.toLowerCase().endsWith('.pdf')) return showToast('Upload PDF only', 'error');
        pc.style.display = 'block'; pf.style.width = '15%'; pp.textContent = '15%'; ps.textContent = 'Uploading...';
        
        const fd = new FormData(); fd.append('file', file);
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/upload', true);
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                pf.style.width = '100%'; pp.textContent = '100%'; ps.textContent = 'Done!';
                showToast('Success');
                setTimeout(() => location.reload(), 1000);
            } else {
                pc.style.display = 'none'; showToast('Error processing', 'error');
            }
        }
        xhr.send(fd);
    }
});

window.switchCompany = function(comp) {
    const d = companyData[comp];
    if (!d) return;
    
    const gd = document.getElementById('growthDriversList');
    gd.innerHTML = '';
    if (d.growth_drivers && d.growth_drivers[0]) {
        d.growth_drivers.forEach(x => {
            if(x.trim()) gd.innerHTML += `<li>${x}</li>`;
        });
    } else gd.innerHTML = '<li>No data</li>';
    
    const rf = document.getElementById('riskFactorsList');
    rf.innerHTML = '';
    if (d.risk_factors && d.risk_factors[0]) {
        d.risk_factors.forEach(x => {
            if(x.trim()) rf.innerHTML += `<li>${x}</li>`;
        });
    } else rf.innerHTML = '<li>No data</li>';
}

window.showToast = function(msg, type='success') {
    const c = document.getElementById('toastContainer');
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.textContent = msg;
    c.appendChild(t);
    setTimeout(() => t.classList.add('show'), 10);
    setTimeout(() => { t.classList.remove('show'); setTimeout(()=>t.remove(), 300); }, 3000);
}

window.sendMessage = async function() {
    const inp = document.getElementById('chatInput');
    const q = inp.value.trim();
    if (!q) return;
    
    const sel = document.getElementById('chatCompanySelect');
    const comp = sel ? sel.value : '';
    
    appendMsg('user', q);
    inp.value = '';
    
    try {
        const payload = { question: q };
        if (comp) payload.company = comp;
        
        const res = await fetch('/api/chat', {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });
        
        if (!res.ok) throw new Error('Server error');
        const data = await res.json();
        appendMsg('bot', data.answer || 'No answer');
    } catch(e) {
        appendMsg('bot', 'Error: ' + e.message);
    }
}

function appendMsg(role, text) {
    const c = document.getElementById('chatMessages');
    const m = document.createElement('div');
    m.className = `chat-msg ${role}`;
    m.innerHTML = `<div class="msg-bubble">${escapeHtml(text)}</div>`;
    c.appendChild(m);
    c.scrollTop = c.scrollHeight;
}

function escapeHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
}
window.toggleCopilot = function() {
    const panel = document.getElementById("aiCopilotPanel");
    if (panel) {
        panel.classList.toggle("hidden-panel");
    }
}
