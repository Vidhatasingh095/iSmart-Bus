let currentRole = 'student';

// --- 1. Role Change Function (Student/Admin/Driver) ---
function switchRole(role) {
    currentRole = role;
    // Saare buttons se blue color hatao aur grey karo
    document.querySelectorAll('[id^="btn-"]').forEach(btn => {
        btn.classList.remove('tab-active');
        btn.classList.add('text-slate-500');
    });
    // Sirf selected button ko blue (active) karo
    const activeBtn = document.getElementById('btn-' + role);
    activeBtn.classList.add('tab-active');
    activeBtn.classList.remove('text-slate-500');
}

// --- 2. Form Toggle (Login aur Signup ke beech switch karna) ---
function toggleForm(type) {
    const loginF = document.getElementById('login-form');
    const signupF = document.getElementById('signup-form');
    const tabL = document.getElementById('tab-login');
    const tabS = document.getElementById('tab-signup');

    if (type === 'signup') {
        loginF.classList.add('hidden');
        signupF.classList.remove('hidden');
        // Signup tab ko highlight karo
        tabS.className = "pb-3 text-xs font-black border-b-2 border-indigo-600 text-indigo-600 uppercase tracking-widest transition-all";
        tabL.className = "pb-3 text-xs font-black border-b-2 border-transparent text-slate-400 uppercase tracking-widest transition-all";
    } else {
        signupF.classList.add('hidden');
        loginF.classList.remove('hidden');
        // Login tab ko highlight karo
        tabL.className = "pb-3 text-xs font-black border-b-2 border-indigo-600 text-indigo-600 uppercase tracking-widest transition-all";
        tabS.className = "pb-3 text-xs font-black border-b-2 border-transparent text-slate-400 uppercase tracking-widest transition-all";
    }
}

// --- 3. Password Toggle (Ankh wala icon) ---
document.querySelectorAll('.password-toggle').forEach(eye => {
    eye.addEventListener('click', function() {
        const input = this.previousElementSibling;
        if (input.type === 'password') {
            input.type = 'text';
            this.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            input.type = 'password';
            this.classList.replace('fa-eye-slash', 'fa-eye');
        }
    });
});

// --- 4. Send OTP Function ---
async function sendOTP() {
    const mobile = document.getElementById('signup-mobile').value;
    if(!mobile || mobile.length < 10) return alert("Please enter a valid mobile number!");

    try {
        const res = await fetch('http://localhost:5000/api/auth/send-otp', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ mobile })
        });
        const data = await res.json();
        if(res.ok) {
            alert("OTP Sent! Check your VS Code Terminal.");
        } else {
            alert(data.msg);
        }
    } catch (e) { 
        alert("Server Error! Make sure your backend is running."); 
    }
}

// --- 5. Registration (Signup) Logic ---
document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = {
        name: document.getElementById('signup-name').value,
        email: document.getElementById('signup-email').value,
        mobile: document.getElementById('signup-mobile').value,
        otp: document.getElementById('signup-otp').value,
        password: document.getElementById('signup-password').value,
        role: currentRole
    };

    const res = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(formData)
    });

    const data = await res.json();
    if(res.ok) { 
        alert("Registration Successful! Please Login."); 
        toggleForm('login'); 
    } else {
        alert(data.msg);
    }
});

// --- 6. Login Logic ---
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if(res.ok) {
        // User ki info browser memory mein save karna
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', data.role);
        localStorage.setItem('userName', data.name);
        window.location.href = 'dashboard.html';
    } else {
        alert(data.msg);
    }
});

// --- 7. Forgot Password Logic (Naya Add Kiya) ---
async function handleForgotPassword() {
    const mobile = prompt("Enter your registered mobile number for OTP:");
    if (!mobile) return;

    // OTP bhejenge
    const otpRes = await fetch('http://localhost:5000/api/auth/send-otp', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ mobile })
    });

    if (otpRes.ok) {
        const otp = prompt("OTP sent to terminal. Enter it here:");
        const newPassword = prompt("Enter your NEW password:");

        if (otp && newPassword) {
            const resetRes = await fetch('http://localhost:5000/api/auth/reset-password', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ mobile, otp, newPassword })
            });
            const data = await resetRes.json();
            alert(data.msg);
        }
    } else {
        alert("Failed to send OTP. Check mobile number.");
    }
}