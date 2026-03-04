(function () {
  const authModal = document.getElementById('auth-modal');
  const registerForm = document.getElementById('register-form');
  const loginForm = document.getElementById('login-form');
  const authStatus = document.getElementById('auth-status');
  const currentUser = document.getElementById('current-user');
  const logoutBtn = document.getElementById('logout-btn');
  const modalClose = document.getElementById('auth-modal-close');
  const navLoginBtn = document.getElementById('nav-login-btn');
  const navRegisterBtn = document.getElementById('nav-register-btn');
  const authTabs = document.querySelectorAll('.auth-tab');

  function openModal(tab = 'login') {
    if (!authModal) return;
    authModal.style.display = 'flex';
    switchTab(tab);
    renderUser();
  }

  function closeModal() {
    if (!authModal) return;
    authModal.style.display = 'none';
    clearFieldErrors(loginForm);
    clearFieldErrors(registerForm);
    if (authStatus) authStatus.textContent = '';
  }

  function switchTab(tab) {
    authTabs.forEach(btn => {
      if (btn.dataset.tab === tab) {
        btn.classList.add('active');
        btn.style.borderBottomColor = 'var(--saffron)';
        btn.style.color = 'var(--navy)';
      } else {
        btn.classList.remove('active');
        btn.style.borderBottomColor = 'transparent';
        btn.style.color = '#9CA3AF';
      }
    });

    if (tab === 'login') {
      if (loginForm) loginForm.style.display = 'block';
      if (registerForm) registerForm.style.display = 'none';
    } else {
      if (loginForm) loginForm.style.display = 'none';
      if (registerForm) registerForm.style.display = 'block';
    }

    clearFieldErrors(loginForm);
    clearFieldErrors(registerForm);
    if (authStatus) authStatus.textContent = '';
  }

  // Modal controls
  if (navLoginBtn) {
    navLoginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal('login');
    });
  }

  if (navRegisterBtn) {
    navRegisterBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal('register');
    });
  }

  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  if (authModal) {
    authModal.addEventListener('click', (e) => {
      if (e.target === authModal) closeModal();
    });
  }

  authTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      switchTab(tab.dataset.tab);
    });
  });

  function setButtonLoading(form, isLoading, loadingText) {
    if (!form) return;
    const submitButton = form.querySelector('button[type="submit"]');
    if (!submitButton) return;

    if (isLoading) {
      submitButton.dataset.originalText = submitButton.textContent || '';
      submitButton.textContent = `⏳ ${loadingText}`;
      submitButton.disabled = true;
      return;
    }

    submitButton.textContent = submitButton.dataset.originalText || submitButton.textContent;
    submitButton.disabled = false;
  }

  function clearFieldErrors(form) {
    if (!form) return;
    form.querySelectorAll('.field-error').forEach((node) => node.remove());
  }

  function setFieldError(form, fieldName, message) {
    if (!form) return;
    const field = form.querySelector(`[name="${fieldName}"]`);
    if (!field) return;

    const errorEl = document.createElement('small');
    errorEl.className = 'field-error';
    errorEl.textContent = message;
    errorEl.style.display = 'block';
    errorEl.style.margin = '-4px 0 8px';
    errorEl.style.color = '#b91c1c';
    field.insertAdjacentElement('afterend', errorEl);
  }

  function applyValidationErrors(form, error) {
    const detail = error?.data?.detail;
    if (!Array.isArray(detail)) return false;

    let applied = false;
    detail.forEach((item) => {
      if (!Array.isArray(item?.loc)) return;
      const fieldName = item.loc[item.loc.length - 1];
      if (typeof fieldName !== 'string') return;
      if (typeof item.msg !== 'string') return;
      setFieldError(form, fieldName, item.msg);
      applied = true;
    });

    return applied;
  }

  function setStatus(message, isError) {
    if (!authStatus) return;
    authStatus.textContent = message;
    authStatus.style.color = isError ? '#b91c1c' : '#065f46';
  }

  function renderUser() {
    if (!currentUser || !logoutBtn || !window.auth) return;
    const user = window.auth.getUser();
    const navDashboardBtn = document.getElementById('nav-dashboard-btn');
    
    if (user) {
      currentUser.textContent = `✓ Logged in as ${user.full_name}`;
      currentUser.style.display = 'block';
      logoutBtn.style.display = 'block';
      if (loginForm) loginForm.style.display = 'none';
      if (registerForm) registerForm.style.display = 'none';
      
      // Show dashboard button and hide login/register buttons
      if (navLoginBtn) navLoginBtn.style.display = 'none';
      if (navRegisterBtn) navRegisterBtn.style.display = 'none';
      if (navDashboardBtn) navDashboardBtn.style.display = 'block';
    } else {
      currentUser.textContent = '';
      currentUser.style.display = 'none';
      logoutBtn.style.display = 'none';
      
      // Show login/register buttons and hide dashboard button
      if (navLoginBtn) navLoginBtn.style.display = 'block';
      if (navRegisterBtn) navRegisterBtn.style.display = 'block';
      if (navDashboardBtn) navDashboardBtn.style.display = 'none';
    }
  }

  if (registerForm && window.auth) {
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      clearFieldErrors(registerForm);
      setButtonLoading(registerForm, true, 'Registering...');
      const formData = new FormData(registerForm);
      const payload = {
        full_name: String(formData.get('full_name') || '').trim(),
        email: String(formData.get('email') || '').trim(),
        password: String(formData.get('password') || ''),
        phone: String(formData.get('phone') || '').trim() || null,
      };

      try {
        await window.auth.register(payload);
        setStatus('✓ Registration successful!', false);
        registerForm.reset();
        renderUser();
        setTimeout(closeModal, 1500);
      } catch (error) {
        const hasValidationErrors = applyValidationErrors(registerForm, error);
        if (!hasValidationErrors && error?.status === 409) {
          setFieldError(registerForm, 'email', error.message);
        }
        setStatus(`Register failed: ${error.message}`, true);
      } finally {
        setButtonLoading(registerForm, false, 'Registering...');
      }
    });
  }

  if (loginForm && window.auth) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      clearFieldErrors(loginForm);
      setButtonLoading(loginForm, true, 'Logging in...');
      const formData = new FormData(loginForm);
      const payload = {
        email: String(formData.get('email') || '').trim(),
        password: String(formData.get('password') || ''),
      };

      try {
        await window.auth.login(payload);
        setStatus('✓ Login successful!', false);
        loginForm.reset();
        renderUser();
        setTimeout(closeModal, 1500);
      } catch (error) {
        if (error?.status === 401) {
          setFieldError(loginForm, 'email', error.message);
          setFieldError(loginForm, 'password', error.message);
        } else {
          applyValidationErrors(loginForm, error);
        }
        setStatus(`Login failed: ${error.message}`, true);
      } finally {
        setButtonLoading(loginForm, false, 'Logging in...');
      }
    });
  }

  if (logoutBtn && window.auth) {
    logoutBtn.addEventListener('click', () => {
      window.auth.logout();
      setStatus('✓ Logged out successfully.', false);
      renderUser();
      switchTab('login');
    });
  }

  renderUser();
})();
