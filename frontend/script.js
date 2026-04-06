const API_URL = 'https://ismart-bus.onrender.com/api/auth';
fetch("https://ismart-bus.onrender.com/api/bus")
  .then(res => {
    if (!res.ok) throw new Error("API error");
    return res.json();
  })
  .then(data => console.log(data))
  .catch(err => console.error(err));

document.addEventListener('DOMContentLoaded', () => {
    const loginContainer = document.getElementById('login-container');
    const signupContainer = document.getElementById('signup-container');
    const forgotPasswordContainer = document.getElementById('forgot-password-container');
    const helpContainer = document.getElementById('help-container');
    const showSignup = document.getElementById('show-signup-from-login');
    const showLoginFromSignup = document.getElementById('show-login-from-signup');
    const showLoginFromForgot = document.getElementById('show-login-from-forgot');
    const showLoginFromHelp = document.getElementById('show-login-from-help');
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('login-password');
    document.querySelectorAll('.toggle-password').forEach(tp => {
        tp.addEventListener('click', () => {
            const targetId = tp.getAttribute('data-target');
            const input = document.getElementById(targetId) || tp.previousElementSibling;
            if (!input) return;
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
        });
    });
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    const helpLink = document.getElementById('help-link');
    const roleSelectors = [
        document.getElementById('role-selector-login'),
        document.getElementById('role-selector-signup')
    ].filter(Boolean);
    const setSelectedRole = (role) => {
        localStorage.setItem('selectedRole', role);
        roleSelectors.forEach(sel => {
            sel.querySelectorAll('button').forEach(b => {
                const active = b.getAttribute('data-role') === role;
                b.classList.toggle('btn-primary-orange', active);
                b.classList.toggle('btn-secondary', !active);
            });
        });
        const nameRow = document.getElementById('signup-name-row');
        const fn = document.getElementById('signup-firstname');
        const ln = document.getElementById('signup-lastname');
        if (nameRow && fn && ln) {
            if (role === 'admin') {
                nameRow.style.display = 'none';
                fn.removeAttribute('required');
                ln.removeAttribute('required');
            } else {
                nameRow.style.display = 'flex';
                fn.setAttribute('required', '');
                ln.setAttribute('required', '');
            }
        }
    };
    // Init role selector
    roleSelectors.forEach(sel => {
        sel.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-role]');
            if (!btn) return;
            setSelectedRole(btn.getAttribute('data-role'));
        });
    });
    if (!localStorage.getItem('selectedRole')) setSelectedRole('user');

    // Show login by default, hide others
    if (loginContainer) loginContainer.style.display = 'block';
    if (signupContainer) signupContainer.style.display = 'none';
    if (forgotPasswordContainer) forgotPasswordContainer.style.display = 'none';
    if (helpContainer) helpContainer.style.display = 'none';

    // Link to show Signup Form
    if (showSignup) {
        showSignup.addEventListener('click', (e) => {
            e.preventDefault();
            if (loginContainer) loginContainer.style.display = 'none';
            if (signupContainer) signupContainer.style.display = 'block';
        });
    }

    // Link to show Login Form (from Signup page)
    if (showLoginFromSignup) {
        showLoginFromSignup.addEventListener('click', (e) => {
            e.preventDefault();
            if (signupContainer) signupContainer.style.display = 'none';
            if (loginContainer) loginContainer.style.display = 'block';
        });
    }

    // Link to show Login Form (from Forgot Password page)
    if (showLoginFromForgot) {
        showLoginFromForgot.addEventListener('click', (e) => {
            e.preventDefault();
            if (forgotPasswordContainer) forgotPasswordContainer.style.display = 'none';
            if (loginContainer) loginContainer.style.display = 'block';
        });
    }

    // Link to show Login Form (from Help page)
    if (showLoginFromHelp) {
        showLoginFromHelp.addEventListener('click', (e) => {
            e.preventDefault();
            if (helpContainer) helpContainer.style.display = 'none';
            if (loginContainer) loginContainer.style.display = 'block';
        });
    }

    // Forgot Password Link (on Login page)
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (loginContainer) loginContainer.style.display = 'none';
            if (forgotPasswordContainer) forgotPasswordContainer.style.display = 'block';
        });
    }

    // Help Link
    if (helpLink) {
        helpLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (loginContainer) loginContainer.style.display = 'none';
            if (helpContainer) helpContainer.style.display = 'block';
        });
    }

    // Password visibility toggle (robust)
    if (togglePassword && passwordInput) {
        togglePassword.style.cursor = 'pointer';
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
        });
    }
    document.addEventListener('click', (e) => {
        const tp = e.target.closest('.toggle-password');
        if (!tp) return;
        const targetId = tp.getAttribute('data-target');
        let input = targetId ? document.getElementById(targetId) : null;
        if (!input) {
            const wrap = tp.closest('.password-wrapper') || tp.parentElement;
            if (wrap) input = wrap.querySelector('input[type="password"], input[type="text"]');
        }
        if (!input) return;
        input.type = input.type === 'password' ? 'text' : 'password';
        tp.setAttribute('aria-pressed', input.type === 'text' ? 'true' : 'false');
        tp.style.cursor = 'pointer';
        tp.title = input.type === 'text' ? 'Hide Password' : 'Show Password';
    });

    // Login Form Submission
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = (document.getElementById('login-email').value || '').trim().toLowerCase();
            const password = document.getElementById('login-password').value;
            const err = document.getElementById('login-error');
            if (err) err.style.display = 'none';

            try {
                const res = await fetch(`${API_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await res.json();

                if (res.ok) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user || {}));
                    const pick = (...vals) => vals.find(v => typeof v === 'string' && v.trim().length) || '';
                    const rolesArr = Array.isArray(data?.user?.roles) ? data.user.roles.join(',') : '';
                    let backendRoleRaw = pick(data?.role, data?.user?.role, data?.user?.userRole, data?.user?.type, rolesArr);
                    if (!backendRoleRaw && data?.token && data.token.split('.').length === 3) {
                        try { const payload = JSON.parse(atob(data.token.split('.')[1])); backendRoleRaw = pick(payload?.role, payload?.userRole, payload?.type); } catch(e){}
                    }
                    const br = String(backendRoleRaw || 'user').toLowerCase().trim();
                    let finalRole = 'user';
                    if (br.includes('admin') || ['bus admin','bus_admin','bus-admin','superadmin','super admin','administrator','admin'].includes(br)) {
                        finalRole = 'admin';
                    } else if (br.includes('driver')) {
                        finalRole = 'driver';
                    } else if (br.includes('student') || br.includes('user')) {
                        finalRole = 'user';
                    } else {
                        finalRole = localStorage.getItem('selectedRole') || 'user';
                    }
                    localStorage.setItem('isAdminAllowed', finalRole === 'admin' ? 'true' : 'false');
                    localStorage.setItem('userRole', finalRole === 'user' ? 'Student' : finalRole.charAt(0).toUpperCase() + finalRole.slice(1));
                    window.location.href = `/dashboard.html?role=${encodeURIComponent(finalRole)}`;
                } else {
                    const msg = (data && (data.msg || data.message)) || 'Incorrect email or password';
                    const isLocal = ['','file:', 'http://localhost', 'http://127.0.0.1'].some(p => location.href.startsWith(p)) || location.hostname === '' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
                    const looksLikeAdminRestriction = /admin/i.test(msg) && /(restrict|not allowed|forbidden|denied)/i.test(msg);
                    if (isLocal && looksLikeAdminRestriction) {
                        // Local demo fallback: allow admin login even if backend restricts it
                        localStorage.setItem('token', data.token || 'local-demo-token');
                        localStorage.setItem('user', JSON.stringify({ email, role: 'admin' }));
                        localStorage.setItem('isAdminAllowed', 'true');
                        localStorage.setItem('userRole', 'Admin');
                        window.location.href = `/dashboard.html?role=admin`;
                        return;
                    }
                    if (err) {
                        err.textContent = msg;
                        err.style.display = 'block';
                    } else {
                        alert(msg);
                    }
                    return;
                }
            } catch (error) {
                console.error('Login Error:', error);
                const errEl = document.getElementById('login-error');
                if (errEl) {
                    errEl.textContent = 'Incorrect email or password';
                    errEl.style.display = 'block';
                } else {
                    alert(error.message);
                }
            }
        });
    }

    // Signup Form Submission
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const pwd = document.getElementById('signup-password')?.value || '';
            const pwd2 = document.getElementById('signup-password-confirm')?.value || '';
            if (pwd.length < 8) { alert('Password must be at least 8 characters.'); return; }
            if (pwd !== pwd2) { alert('Passwords do not match.'); return; }
            const first = document.getElementById('signup-firstname')?.value?.trim() || '';
            const last = document.getElementById('signup-lastname')?.value?.trim() || '';
            const email = (document.getElementById('signup-email')?.value || '').trim().toLowerCase();
            let role = localStorage.getItem('selectedRole') || 'user';
            try {
                const res = await fetch(`${API_URL}/signup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: `${first} ${last}`.trim() || first || last || email.split('@')[0],
                        email,
                        mobile: '0000000000',
                        role: role,
                        password: pwd
                    })
                });
                const data = await res.json();
                if (!res.ok) {
                    alert(data.msg || 'Signup failed');
                    return;
                }
                alert('You have successfully signed up!');
                // Auto-login after successful signup
                const loginRes = await fetch(`${API_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password: pwd })
                });
                const loginData = await loginRes.json();
                if (loginRes.ok) {
                    localStorage.setItem('token', loginData.token);
                    localStorage.setItem('user', JSON.stringify(loginData.user));
                    if ((role || '').toLowerCase() === 'admin') {
                        localStorage.setItem('isAdminAllowed', 'true');
                    }
                } else {
                    alert(loginData.msg || 'Login after signup failed');
                }
            } catch (err) {
                console.error('Signup Error:', err);
                alert('Server error during signup');
                return;
            }
            const finalRole = (role || 'user').toLowerCase() === 'admin' ? 'admin' : (role || 'user');
            localStorage.setItem('userRole', finalRole === 'user' ? 'Student' : finalRole.charAt(0).toUpperCase() + finalRole.slice(1));
            window.location.href = `/dashboard.html?role=${encodeURIComponent(finalRole)}`;
        });
    }

    // Forgot Password Form Submission
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('forgot-email').value;
            try {
                const res = await fetch(`${API_URL}/forgot-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                const data = await res.json();
                alert(data.msg || 'An error occurred.');
            } catch (err) {
                console.error(err);
                alert('Server Error');
            }
        });
    }
});

window.onload = function () {
  const origin = location.origin;
  const googleSignInButtons = document.querySelectorAll(".google-signin-btn");
  const enableGoogleOverride = localStorage.getItem('enableGoogle') === 'true';
  const isLocal = origin.startsWith('http://127.0.0.1') || origin.startsWith('http://localhost');
  const notWhitelisted = !enableGoogleOverride && (isLocal || !/^https?:\/\/.+/i.test(origin));
  if (notWhitelisted) {
    googleSignInButtons.forEach(btn => {
      if (btn) {
        btn.style.display = 'none';
        btn.addEventListener('click', (e) => { e.preventDefault(); alert('Google Sign-In is disabled on this origin.'); });
      }
    });
    return;
  }
  try {
    google.accounts.id.initialize({
      client_id: "486216064813-qr8cflm6racj1pku2lqldfpogedp4h5d.apps.googleusercontent.com",
      callback: handleCredentialResponse
    });
    googleSignInButtons.forEach(button => {
      if (button) {
        const isMobile = window.matchMedia("(max-width: 480px)").matches;
        google.accounts.id.renderButton(
          button,
          {
            theme: "outline",
            size: isMobile ? "medium" : "large",
            type: "standard",
            text: "signin_with",
            shape: "rectangular",
            logo_alignment: "left"
          }
        );
      }
    });
  } catch (e) {
    googleSignInButtons.forEach(btn => { if (btn) btn.style.display = 'none'; });
    console.warn('Google Sign-In disabled due to origin mismatch or script error', e);
  }
};

async function handleCredentialResponse(response) {
  console.log("Encoded JWT ID token: " + response.credential);
  try {
    const res = await fetch(`${API_URL}/google-signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: response.credential }),
    });

    const data = await res.json();

    if (res.ok) {
      // Store token and user data for session management
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      const backendRole = (data.user && data.user.role) || 'student';
      const roleMap = { student: 'user', driver: 'driver', admin: 'admin' };
      const signupVisible = (function() { 
        const el = document.getElementById('signup-container'); 
        return el && window.getComputedStyle(el).display !== 'none';
      })();
      let finalRole;
      if (signupVisible) {
        let chosen = localStorage.getItem('selectedRole') || 'user';
        if (chosen === 'admin' && backendRole !== 'admin') chosen = 'user';
        finalRole = chosen;
      } else {
        finalRole = roleMap[backendRole] || 'user';
      }
      localStorage.setItem('isAdminAllowed', backendRole === 'admin' ? 'true' : 'false');
      localStorage.setItem('userRole', finalRole === 'user' ? 'Student' : finalRole.charAt(0).toUpperCase() + finalRole.slice(1));
      window.location.href = `/dashboard.html?role=${encodeURIComponent(finalRole)}`;
    } else {
      throw new Error(data.msg || 'Google Sign-In failed');
    }
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    alert(error.message);
  }
}
