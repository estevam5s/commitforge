// CommitForge v2.0 — Interface Web

document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const commitForm = document.getElementById('commit-form');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const themeToggle = document.getElementById('theme-toggle');
    const daysRange = document.getElementById('days-range');
    const numDaysInput = document.getElementById('num-days');
    const toggleAdvanced = document.getElementById('toggle-advanced');
    const advancedContent = document.querySelector('.advanced-content');
    const refreshHistoryBtn = document.getElementById('refresh-history');
    const jobsList = document.querySelector('.jobs-list');
    const modalOverlay = document.getElementById('modal-overlay');
    const closeModalBtn = document.querySelector('.close-modal');
    const cancelJobBtn = document.getElementById('cancel-job');
    const progressBar = document.getElementById('job-progress');
    const progressPercentage = document.getElementById('progress-percentage');
    const modalRepoUrl = document.getElementById('modal-repo-url');
    const modalPeriod = document.getElementById('modal-period');
    const modalStatus = document.getElementById('modal-status');
    const modalCommits = document.getElementById('modal-commits');
    const modalCommitsMade = document.getElementById('modal-commits-made');
    const modalElapsedTime = document.getElementById('modal-elapsed-time');
    const statusLogContent = document.getElementById('status-log-content');
    const toggleTokenVisibilityBtn = document.getElementById('toggle-token-visibility');
    const validateTokenBtn = document.getElementById('validate-token');
    const githubTokenInput = document.getElementById('github-token');
    const tokenValidationResult = document.getElementById('token-validation-result');
    const previewBtn = document.getElementById('preview-btn');
    const previewSection = document.getElementById('preview-section');
    const previewContent = document.getElementById('preview-content');

    // Modo de data
    const dateModeInputs = document.querySelectorAll('input[name="date-mode"]');
    const fieldYear = document.getElementById('field-year');
    const fieldRange = document.getElementById('field-range');
    const fieldDays = document.getElementById('field-days');

    // Modo de commit
    const commitModeInputs = document.querySelectorAll('input[name="commit-mode"]');
    const commitModeDesc = document.getElementById('commit-mode-desc');
    const commitModeDescriptions = {
        projeto: 'Commita os arquivos reais do repositório agrupados semanticamente por tipo',
        arquivo: 'Commita criando um arquivo de log único com entradas datadas',
    };

    const API_ENDPOINTS = {
        START_JOB: '/api/start-job',
        JOB_STATUS: '/api/job-status',
        CANCEL_JOB: '/api/cancel-job',
        JOBS_LIST: '/api/jobs',
        CLEAN_JOB: '/api/clean-job',
        CONFIG: '/api/config',
        VALIDATE_TOKEN: '/api/validate-token',
        PREVIEW: '/api/preview',
    };

    let activeJobId = null;
    let jobRefreshInterval = null;
    let statusRefreshInterval = null;

    // ── Modo de data ──────────────────────────────────────────────────
    dateModeInputs.forEach(input => {
        input.addEventListener('change', () => {
            const mode = input.value;
            fieldYear.style.display = mode === 'year' ? '' : 'none';
            fieldRange.style.display = mode === 'range' ? '' : 'none';
            fieldDays.style.display = mode === 'days' ? '' : 'none';
        });
    });

    // ── Modo de commit ────────────────────────────────────────────────
    commitModeInputs.forEach(input => {
        input.addEventListener('change', () => {
            if (commitModeDesc) {
                commitModeDesc.textContent = commitModeDescriptions[input.value] || '';
            }
        });
    });

    // ── Toggle visibilidade do token ──────────────────────────────────
    if (toggleTokenVisibilityBtn) {
        toggleTokenVisibilityBtn.addEventListener('click', function () {
            const icon = this.querySelector('i');
            if (githubTokenInput.type === 'password') {
                githubTokenInput.type = 'text';
                icon.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                githubTokenInput.type = 'password';
                icon.classList.replace('fa-eye-slash', 'fa-eye');
            }
        });
    }

    // ── Validar token ─────────────────────────────────────────────────
    if (validateTokenBtn && githubTokenInput) {
        validateTokenBtn.addEventListener('click', async function () {
            const token = githubTokenInput.value.trim();
            if (!token) {
                tokenValidationResult.innerHTML = '<span class="validation-error">Por favor, insira um token</span>';
                return;
            }
            tokenValidationResult.innerHTML = '<span>Validando token...</span>';
            try {
                const result = await fetchAPI(API_ENDPOINTS.VALIDATE_TOKEN, 'POST', { token });
                if (result.valid) {
                    tokenValidationResult.innerHTML =
                        `<span class="validation-success">✓ Token válido! Usuário: ${result.user}</span>`;
                } else {
                    tokenValidationResult.innerHTML =
                        `<span class="validation-error">✗ ${result.message}</span>`;
                }
            } catch (error) {
                tokenValidationResult.innerHTML =
                    `<span class="validation-error">Erro ao validar: ${error.message}</span>`;
            }
        });
    }

    // ── Prévia ────────────────────────────────────────────────────────
    if (previewBtn) {
        previewBtn.addEventListener('click', async () => {
            const payload = buildPreviewPayload();
            try {
                const result = await fetchAPI(API_ENDPOINTS.PREVIEW, 'POST', payload);
                const p = result.preview || {};
                const html = `
                    <div class="preview-info">
                        <p><strong>Período:</strong> ${p.start} → ${p.end}</p>
                        <p><strong>Commits por dia:</strong> ${p.commits_per_day}</p>
                        <p><strong>Fins de semana:</strong> ${p.skip_weekends ? 'Pulados' : 'Incluídos'}</p>
                        <p><strong>Total de commits:</strong> <strong>${p.total_commits}</strong></p>
                        ${p.exceeds_limit ? '<p class="validation-error">⚠ Excede o limite máximo!</p>' : ''}
                        ${p.sample_first && p.sample_first.length > 0 ? `
                            <p><strong>Primeiros commits:</strong> ${p.sample_first.slice(0, 3).join(' / ')}</p>
                        ` : ''}
                    </div>
                `;
                previewContent.innerHTML = html;
                previewSection.style.display = '';
            } catch (error) {
                showToast(`Erro na prévia: ${error.message}`, 'error');
            }
        });
    }

    function buildPreviewPayload() {
        const mode = document.querySelector('input[name="date-mode"]:checked').value;
        const payload = {
            commits_per_day: parseInt(document.getElementById('commits-per-day').value) || 1,
            skip_weekends: document.getElementById('skip-weekends').checked,
        };
        if (mode === 'year') {
            payload.year = parseInt(document.getElementById('year-input').value);
        } else if (mode === 'range') {
            payload.start_date = document.getElementById('start-date').value;
            payload.end_date = document.getElementById('end-date').value;
        } else {
            payload.num_days = parseInt(numDaysInput.value) || 30;
        }
        return payload;
    }

    // ── Utilitários ───────────────────────────────────────────────────
    function formatDate(timestamp) {
        return new Date(timestamp * 1000).toLocaleString('pt-BR');
    }

    function formatElapsedTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    function truncateText(text, maxLength = 40) {
        return text.length <= maxLength ? text : '...' + text.slice(-(maxLength - 3));
    }

    function getStatusClass(status) {
        switch (status) {
            case 'running': case 'cloning': case 'pushing': return 'status-running';
            case 'completed': return 'status-completed';
            case 'failed': return 'status-failed';
            case 'cancelled': case 'cleaned': return 'status-cancelled';
            default: return '';
        }
    }

    function getStatusLabel(status) {
        const labels = {
            cloning: 'Clonando repositório',
            running: 'Em andamento',
            pushing: 'Enviando commits',
            completed: 'Concluído',
            failed: 'Falhou',
            cancelled: 'Cancelado',
            cleaned: 'Limpo',
        };
        return labels[status] || status;
    }

    function addLogEntry(message) {
        const timeStr = new Date().toLocaleTimeString('pt-BR');
        const entry = document.createElement('div');
        entry.classList.add('log-entry');
        entry.innerHTML = `<span class="log-time">[${timeStr}]</span> ${message}`;
        statusLogContent.appendChild(entry);
        statusLogContent.scrollTop = statusLogContent.scrollHeight;
    }

    function showToast(message, type = 'info', duration = 5000) {
        const container = document.querySelector('.toast-container');
        const toast = document.createElement('div');
        toast.classList.add('toast', `toast-${type}`);
        toast.innerHTML = `
            <div class="toast-message">${message}</div>
            <button class="close-toast">&times;</button>
        `;
        container.appendChild(toast);
        toast.querySelector('.close-toast').addEventListener('click', () => toast.remove());
        setTimeout(() => { if (toast.parentNode) toast.remove(); }, duration);
    }

    // ── Tema ──────────────────────────────────────────────────────────
    function initTheme() {
        if (localStorage.getItem('theme') === 'dark') {
            document.body.classList.add('dark-theme');
            themeToggle.checked = true;
        }
    }

    themeToggle.addEventListener('change', function () {
        document.body.classList.toggle('dark-theme', this.checked);
        localStorage.setItem('theme', this.checked ? 'dark' : 'light');
    });

    // ── Tabs ──────────────────────────────────────────────────────────
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            tabButtons.forEach(b => b.classList.remove('active'));
            button.classList.add('active');
            tabContents.forEach(c => {
                c.classList.remove('active');
                if (c.id === tabId) c.classList.add('active');
            });
            if (tabId === 'history') fetchJobsList();
        });
    });

    // ── Range slider ──────────────────────────────────────────────────
    if (daysRange && numDaysInput) {
        daysRange.addEventListener('input', () => { numDaysInput.value = daysRange.value; });
        numDaysInput.addEventListener('input', () => { daysRange.value = numDaysInput.value; });
    }

    // ── Opções avançadas ──────────────────────────────────────────────
    if (toggleAdvanced) {
        toggleAdvanced.addEventListener('click', function () {
            advancedContent.classList.toggle('show');
            const icon = this.querySelector('i');
            icon.classList.toggle('fa-chevron-down');
            icon.classList.toggle('fa-chevron-up');
        });
    }

    // ── Modal ─────────────────────────────────────────────────────────
    function openModal() { modalOverlay.classList.add('show'); }
    function closeModal() { modalOverlay.classList.remove('show'); }

    closeModalBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });

    // ── API ───────────────────────────────────────────────────────────
    async function fetchAPI(endpoint, method = 'GET', data = null) {
        const options = { method, headers: { 'Content-Type': 'application/json' } };
        if (data) options.body = JSON.stringify(data);
        const response = await fetch(endpoint, options);
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Erro na requisição');
        return result;
    }

    // ── Job: Iniciar ──────────────────────────────────────────────────
    async function startJob(formData) {
        const result = await fetchAPI(API_ENDPOINTS.START_JOB, 'POST', formData);
        activeJobId = result.job_id;
        initializeJobMonitoring(activeJobId);
        openModal();

        addLogEntry(`Processo iniciado — ID: ${activeJobId}`);
        addLogEntry(`Repositório: ${truncateText(formData.repo_url, 50)}`);
        addLogEntry(`Modo: ${formData.commit_mode === 'projeto' ? 'Projeto (arquivos reais)' : 'Arquivo (log único)'}`);
        if (formData.year) addLogEntry(`Ano alvo: ${formData.year}`);
        if (formData.start_date) addLogEntry(`Intervalo: ${formData.start_date} → ${formData.end_date}`);
        if (result.estimated_commits) addLogEntry(`Commits estimados: ${result.estimated_commits}`);
        if (result.use_api) addLogEntry('Usando API do GitHub para autenticação');

        showToast('Processo iniciado com sucesso!', 'success');
        return result;
    }

    async function cancelJob(jobId) {
        await fetchAPI(`${API_ENDPOINTS.CANCEL_JOB}/${jobId}`, 'POST');
        addLogEntry('Processo cancelado pelo usuário');
        showToast('Processo cancelado', 'warning');
    }

    async function cleanJob(jobId) {
        await fetchAPI(`${API_ENDPOINTS.CLEAN_JOB}/${jobId}`, 'POST');
        showToast('Arquivos do processo removidos', 'info');
        fetchJobsList();
    }

    async function fetchJobStatus(jobId) {
        const result = await fetchAPI(`${API_ENDPOINTS.JOB_STATUS}/${jobId}`);
        return result.job;
    }

    async function fetchJobsList() {
        const result = await fetchAPI(API_ENDPOINTS.JOBS_LIST);
        renderJobsList(result.jobs);
    }

    // ── Monitoramento ─────────────────────────────────────────────────
    function initializeJobMonitoring(jobId) {
        if (statusRefreshInterval) clearInterval(statusRefreshInterval);
        statusLogContent.innerHTML = '';

        statusRefreshInterval = setInterval(async () => {
            const job = await fetchJobStatus(jobId);
            if (!job) { clearInterval(statusRefreshInterval); return; }

            updateProgressModal(job);

            if (job.status === 'running' && modalStatus.textContent !== 'Em andamento') {
                addLogEntry('Criando commits retroativos...');
            } else if (job.status === 'pushing' && modalStatus.textContent !== 'Enviando commits') {
                addLogEntry('Enviando commits para o repositório remoto...');
            } else if (job.status === 'completed' && modalStatus.textContent !== 'Concluído') {
                addLogEntry(`✓ Processo concluído! ${job.commits_made || job.num_days} commits criados.`);
                clearInterval(statusRefreshInterval);
                fetchJobsList();
            } else if (job.status === 'failed' && modalStatus.textContent !== 'Falhou') {
                addLogEntry(`✗ Erro: ${job.error || 'Erro desconhecido'}`);
                clearInterval(statusRefreshInterval);
                fetchJobsList();
            } else if (job.status === 'cancelled' && modalStatus.textContent !== 'Cancelado') {
                clearInterval(statusRefreshInterval);
                fetchJobsList();
            }
        }, 1000);
    }

    function updateProgressModal(job) {
        modalRepoUrl.textContent = truncateText(job.repo_url, 45);

        // Período
        if (job.year) {
            modalPeriod.textContent = `Ano ${job.year}`;
        } else if (job.start_date && job.end_date) {
            modalPeriod.textContent = `${job.start_date} → ${job.end_date}`;
        } else {
            modalPeriod.textContent = `Últimos ${job.num_days} dias`;
        }

        modalStatus.textContent = getStatusLabel(job.status);
        modalCommits.textContent = job.estimated_commits || job.num_days || 0;
        modalCommitsMade.textContent = job.commits_made || 0;

        const progress = job.progress || 0;
        progressBar.style.width = `${progress}%`;
        progressPercentage.textContent = `${progress}%`;

        const elapsed = Math.floor(Date.now() / 1000) - (job.start_time || Math.floor(Date.now() / 1000));
        modalElapsedTime.textContent = formatElapsedTime(elapsed);

        const done = ['completed', 'failed', 'cancelled'].includes(job.status);
        cancelJobBtn.style.display = done ? 'none' : 'block';
    }

    // ── Renderizar lista de jobs ───────────────────────────────────────
    function renderJobsList(jobs) {
        jobsList.innerHTML = '';

        if (!jobs || jobs.length === 0) {
            jobsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-history fa-3x"></i>
                    <p>Nenhum processo encontrado</p>
                </div>`;
            return;
        }

        jobs.sort((a, b) => b.start_time - a.start_time);

        jobs.forEach(job => {
            let duracao = '';
            if (job.end_time && job.start_time) {
                duracao = formatElapsedTime(job.end_time - job.start_time);
            } else if (job.start_time) {
                duracao = formatElapsedTime(Math.floor(Date.now() / 1000) - job.start_time) + ' (em andamento)';
            }

            let periodo = '';
            if (job.year) periodo = `Ano ${job.year}`;
            else if (job.start_date && job.end_date) periodo = `${job.start_date} → ${job.end_date}`;
            else periodo = `Últimos ${job.num_days || '?'} dias`;

            const card = document.createElement('div');
            card.classList.add('job-card');
            card.innerHTML = `
                <div class="job-info">
                    <h3>${truncateText(job.repo_url, 45)}</h3>
                    <div class="job-meta">
                        <span>Iniciado: ${formatDate(job.start_time)}</span>
                        <span>Período: ${periodo}</span>
                        <span>Commits: ${job.commits_made || 0} / ${job.estimated_commits || job.num_days || 0}</span>
                        ${duracao ? `<span>Duração: ${duracao}</span>` : ''}
                    </div>
                </div>
                <span class="job-status ${getStatusClass(job.status)}">
                    ${job.status === 'running' ? `${job.progress || 0}%` : getStatusLabel(job.status)}
                </span>
                <div class="job-actions">
                    ${job.status === 'running' ? `
                        <button class="btn icon-btn cancel-job-btn" data-id="${job.id}" title="Cancelar">
                            <i class="fas fa-stop-circle"></i>
                        </button>` : ''}
                    <button class="btn icon-btn view-job-btn" data-id="${job.id}" title="Ver detalhes">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${['completed', 'failed', 'cancelled'].includes(job.status) ? `
                        <button class="btn icon-btn clean-job-btn" data-id="${job.id}" title="Remover arquivos">
                            <i class="fas fa-trash"></i>
                        </button>` : ''}
                </div>`;
            jobsList.appendChild(card);
        });

        document.querySelectorAll('.cancel-job-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                if (confirm('Cancelar este processo?')) cancelJob(this.getAttribute('data-id'));
            });
        });

        document.querySelectorAll('.view-job-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                activeJobId = this.getAttribute('data-id');
                initializeJobMonitoring(activeJobId);
                openModal();
            });
        });

        document.querySelectorAll('.clean-job-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                if (confirm('Remover os arquivos deste processo?')) cleanJob(this.getAttribute('data-id'));
            });
        });
    }

    // ── Submit do formulário ──────────────────────────────────────────
    commitForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const repoUrl = document.getElementById('repo-url').value.trim();
        if (!repoUrl) { showToast('Por favor, insira a URL do repositório', 'error'); return; }

        const mode = document.querySelector('input[name="date-mode"]:checked').value;
        const commitMode = document.querySelector('input[name="commit-mode"]:checked')?.value || 'projeto';
        const commitsPerDay = parseInt(document.getElementById('commits-per-day').value) || 1;
        const filename = document.getElementById('filename').value.trim() || 'data.txt';
        const commitMessage = document.getElementById('commit-message').value.trim() || 'Commit retroativo: {date}';
        const customUsername = document.getElementById('custom-username').value.trim();
        const customEmail = document.getElementById('custom-email').value.trim();
        const branchName = document.getElementById('branch-name')?.value.trim() || '';
        const pushOption = document.getElementById('push-option').checked;
        const randomTimes = document.getElementById('random-times').checked;
        const skipWeekends = document.getElementById('skip-weekends').checked;
        const useApi = document.getElementById('use-api').checked;
        const githubToken = githubTokenInput.value.trim();

        const formData = {
            repo_url: repoUrl,
            filename,
            commit_message: commitMessage,
            push: pushOption,
            random_times: randomTimes,
            skip_weekends: skipWeekends,
            commits_per_day: Math.max(1, Math.min(10, commitsPerDay)),
            use_api: useApi,
            commit_mode: commitMode,
        };
        if (branchName) formData.branch_name = branchName;

        if (mode === 'year') {
            const year = parseInt(document.getElementById('year-input').value);
            if (!year || year < 2000 || year > 2099) {
                showToast('Informe um ano válido entre 2000 e 2099', 'error');
                return;
            }
            formData.year = year;
        } else if (mode === 'range') {
            const startDate = document.getElementById('start-date').value;
            const endDate = document.getElementById('end-date').value;
            if (!startDate || !endDate) { showToast('Informe as datas de início e fim', 'error'); return; }
            if (startDate > endDate) { showToast('Data de início deve ser anterior à data de fim', 'error'); return; }
            formData.start_date = startDate;
            formData.end_date = endDate;
        } else {
            const numDays = parseInt(numDaysInput.value);
            if (isNaN(numDays) || numDays < 1) { showToast('O número de dias deve ser pelo menos 1', 'error'); return; }
            formData.num_days = numDays;
        }

        if (customUsername) formData.custom_username = customUsername;
        if (customEmail) formData.custom_email = customEmail;
        if (githubToken) formData.github_token = githubToken;

        try {
            await startJob(formData);
            setTimeout(() => {
                document.querySelector('[data-tab="history"]').click();
                fetchJobsList();
            }, 1000);
        } catch (error) {
            showToast(`Erro ao iniciar processo: ${error.message}`, 'error');
        }
    });

    // ── Cancelar job (modal) ──────────────────────────────────────────
    cancelJobBtn.addEventListener('click', async function () {
        if (!activeJobId) return;
        if (confirm('Cancelar este processo?')) await cancelJob(activeJobId);
    });

    refreshHistoryBtn.addEventListener('click', fetchJobsList);

    // ── Auto-refresh ──────────────────────────────────────────────────
    function startJobsRefresh() {
        if (jobRefreshInterval) clearInterval(jobRefreshInterval);
        jobRefreshInterval = setInterval(fetchJobsList, 10000);
    }

    // ── Inicialização ─────────────────────────────────────────────────
    function init() {
        initTheme();
        fetchJobsList();
        startJobsRefresh();
        if (toggleAdvanced) toggleAdvanced.click(); // Abrir opções avançadas por padrão
    }

    init();
});
