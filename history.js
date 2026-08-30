import { supabase } from './supabase-client.js';

// auth protection
async function initAuth() {
  const { data } = await supabase.auth.getSession();
  if (!data || !data.session) {
    window.location.href = 'auth.html';
    return;
  }

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await supabase.auth.signOut();
      window.location.href = 'auth.html';
    });
  }
}

// fetch and render history
async function loadHistory() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: logs, error } = await supabase
    .from('speech_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const historyContainer = document.getElementById('historyList');

  if (error || !logs || logs.length === 0) {
    historyContainer.innerHTML = `
      <div class="empty-state">
        <p class="empty-text">No speech logs recorded yet.</p>
        <a href="index.html" class="prim-btn">Start Practice Session</a>
      </div>
    `;
    return;
  }

  // Calculate 
  const totalSessions = logs.length;
  let sumClarity = 0;
  let sumFillers = 0;

  logs.forEach(log => {
    sumClarity += log.clarity || 0;
    sumFillers += log.filler_count || 0;
  });

  document.getElementById('totalCount').textContent = totalSessions;
  document.getElementById('avgClarity').textContent = `${Math.round(sumClarity / totalSessions)}%`;
  document.getElementById('totalFillers').textContent = sumFillers;
  document.getElementById('sessionBadge').textContent = `${totalSessions} ${totalSessions === 1 ? 'Session' : 'Sessions'}`;

  // Render History item
  historyContainer.innerHTML = logs.map(log => {
    const dateObj = new Date(log.created_at);
    const formattedDate = dateObj.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
    const formattedTime = dateObj.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    return `
      <div class="history-item">
        <div class="item-header">
          <span class="item-timestamp">${formattedDate} at ${formattedTime}</span>
          <span class="item-fillers">Fillers: <strong>${log.filler_count || 0}</strong></span>
        </div>
        
        <p class="item-transcript">
          "${log.transcript || 'No transcript text available.'}"
        </p>
        
        <div class="item-metrics">
          <div class="metric-pill"> <strong>${log.wpm || 0}</strong> WPM</div>
          <div class="metric-pill"> <strong>${log.clarity || 0}%</strong> Clarity</div>
          <div class="metric-pill"> <strong>${log.pronunciation || 0}%</strong> Pronunciation</div>
        </div>
      </div>
    `;
  }).join('');
}

// Runing it (initializer)
initAuth();
loadHistory();