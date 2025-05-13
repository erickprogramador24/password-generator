// Elementos del DOM
const passwordOutput = document.getElementById('password-output');
const generateBtn = document.getElementById('generate-btn');
const copyBtn = document.getElementById('copy-btn');
const lengthSlider = document.getElementById('length');
const lengthValue = document.getElementById('length-value');
const uppercaseCheckbox = document.getElementById('uppercase');
const numbersCheckbox = document.getElementById('numbers');
const symbolsCheckbox = document.getElementById('symbols');
const strengthBar = document.querySelector('.strength-bar');
const strengthText = document.getElementById('strength-text');
const themeToggle = document.getElementById('theme-toggle');
const credentialsList = document.getElementById('credentials-list');
const searchInput = document.getElementById('search-input');
const exportBtn = document.getElementById('export-btn');
const saveForm = document.getElementById('save-credential-form');
const credentialNameInput = document.getElementById('credential-name');
const credentialUsernameInput = document.getElementById('credential-username');
const credentialPasswordInput = document.getElementById('credential-password');
const toast = document.getElementById('toast');

// Caracteres para la contraseña
const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const numberChars = '0123456789';
const symbolChars = '!@#$%^&*()_+{}[]|:;"<>,.?/';

// Generar contraseña
function generatePassword() {
    let chars = lowercaseChars;
    if (uppercaseCheckbox.checked) chars += uppercaseChars;
    if (numbersCheckbox.checked) chars += numberChars;
    if (symbolsCheckbox.checked) chars += symbolChars;

    let password = '';
    for (let i = 0; i < lengthSlider.value; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        password += chars[randomIndex];
    }

    passwordOutput.value = password;
    credentialPasswordInput.value = password; // Actualizar campo de contraseña del formulario
    checkPasswordStrength(password);
}

// Verificar fortaleza de la contraseña
function checkPasswordStrength(password) {
    let strength = 0;
    
    if (password.length >= 12) strength += 2;
    else if (password.length >= 8) strength += 1;
    
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 2;
    
    let strengthPercent = (strength / 6) * 100;
    let strengthLevel = '';
    
    if (strengthPercent < 40) {
        strengthLevel = 'Débil';
        strengthBar.style.background = `linear-gradient(90deg, #ff4757 0%, #ff4757 ${strengthPercent}%, #ddd ${strengthPercent}%)`;
    } else if (strengthPercent < 70) {
        strengthLevel = 'Media';
        strengthBar.style.background = `linear-gradient(90deg, #ffa502 0%, #ffa502 ${strengthPercent}%, #ddd ${strengthPercent}%)`;
    } else {
        strengthLevel = 'Fuerte';
        strengthBar.style.background = `linear-gradient(90deg, #2ed573 0%, #2ed573 ${strengthPercent}%, #ddd ${strengthPercent}%)`;
    }
    
    strengthText.textContent = `Seguridad: ${strengthLevel}`;
}

// Copiar al portapapeles
function copyToClipboard() {
    if (!passwordOutput.value) return;
    
    navigator.clipboard.writeText(passwordOutput.value)
        .then(() => {
            showToast('¡Contraseña copiada!');
        });
}

// Mostrar notificación toast
function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Tema oscuro/claro
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    const icon = themeToggle.querySelector('i');
    icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// Guardar credencial desde el formulario
function saveCredential(e) {
    e.preventDefault();
    
    const credential = {
        service: credentialNameInput.value,
        username: credentialUsernameInput.value,
        password: credentialPasswordInput.value
    };
    
    const credentials = JSON.parse(localStorage.getItem('credentials')) || [];
    credentials.push(credential);
    localStorage.setItem('credentials', JSON.stringify(credentials));
    
    showToast('Credencial guardada');
    loadCredentials();
    saveForm.reset();
}

// Cargar credenciales
function loadCredentials() {
    const credentials = JSON.parse(localStorage.getItem('credentials')) || [];
    renderCredentials(credentials);
}

// Renderizar credenciales
function renderCredentials(credentials) {
    credentialsList.innerHTML = '';
    
    if (credentials.length === 0) {
        credentialsList.innerHTML = '<p class="empty-message">No hay credenciales guardadas.</p>';
        return;
    }
    
    credentials.forEach((cred, index) => {
        const credElement = document.createElement('div');
        credElement.className = 'credential-item';
        credElement.innerHTML = `
            <div class="credential-info">
                <h3>${cred.service}</h3>
                <p>Usuario: ${cred.username}</p>
                <input type="password" value="${cred.password}" readonly class="password-input" id="password-${index}">
            </div>
            <div class="credential-actions">
                <button class="show-password-btn" data-index="${index}"><i class="fas fa-eye"></i></button>
                <button class="copy-password-btn" data-index="${index}"><i class="fas fa-copy"></i></button>
                <button class="delete-credential-btn" data-index="${index}"><i class="fas fa-trash"></i></button>
            </div>
        `;
        credentialsList.appendChild(credElement);
    });
    
    // Event listeners para botones dinámicos
    document.querySelectorAll('.show-password-btn').forEach(btn => {
        btn.addEventListener('click', togglePasswordVisibility);
    });
    
    document.querySelectorAll('.copy-password-btn').forEach(btn => {
        btn.addEventListener('click', copyCredentialPassword);
    });
    
    document.querySelectorAll('.delete-credential-btn').forEach(btn => {
        btn.addEventListener('click', deleteCredential);
    });
}

// Alternar visibilidad de contraseña
function togglePasswordVisibility(e) {
    const index = e.target.closest('button').getAttribute('data-index');
    const passwordInput = document.getElementById(`password-${index}`);
    const icon = e.target.closest('button').querySelector('i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

// Copiar contraseña de credencial
function copyCredentialPassword(e) {
    const index = e.target.closest('button').getAttribute('data-index');
    const passwordInput = document.getElementById(`password-${index}`);
    navigator.clipboard.writeText(passwordInput.value)
        .then(() => {
            showToast('Contraseña copiada');
        });
}

// Eliminar credencial
function deleteCredential(e) {
    const index = e.target.closest('button').getAttribute('data-index');
    let credentials = JSON.parse(localStorage.getItem('credentials')) || [];
    credentials.splice(index, 1);
    localStorage.setItem('credentials', JSON.stringify(credentials));
    loadCredentials();
    showToast('Credencial eliminada');
}

// Exportar credenciales
function exportCredentials() {
    const credentials = JSON.parse(localStorage.getItem('credentials')) || [];
    if (credentials.length === 0) {
        showToast('No hay credenciales para exportar');
        return;
    }
    
    const dataStr = JSON.stringify(credentials, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', 'credenciales-securepass.json');
    linkElement.click();
}

// Filtrar credenciales
function filterCredentials() {
    const searchTerm = searchInput.value.toLowerCase();
    const credentials = JSON.parse(localStorage.getItem('credentials')) || [];
    const filtered = credentials.filter(cred => 
        cred.service.toLowerCase().includes(searchTerm) || 
        cred.username.toLowerCase().includes(searchTerm)
    );
    renderCredentials(filtered);
}

// Actualizar contraseña en tiempo real al mover el slider
function updatePasswordOnSliderChange() {
    lengthValue.textContent = lengthSlider.value;
    if (passwordOutput.value) {
        generatePassword();
    }
}

// Inicializar
function init() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeToggle.querySelector('i').className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    
    generatePassword();
    loadCredentials();
}

// Event Listeners
generateBtn.addEventListener('click', generatePassword);
copyBtn.addEventListener('click', copyToClipboard);
lengthSlider.addEventListener('input', updatePasswordOnSliderChange);
themeToggle.addEventListener('click', toggleTheme);
saveForm.addEventListener('submit', saveCredential);
exportBtn.addEventListener('click', exportCredentials);
searchInput.addEventListener('input', filterCredentials);

// Iniciar la aplicación
init();