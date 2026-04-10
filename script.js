const textos = ["Desarrollador Web 💻","Marketing Digital 📈","Roblox Luau 🎮","Creatividad ✨"];
let textoActual = 0, index = 0, isDeleting = false;
const velocidadEscribir = 100, velocidadBorrar = 50, pausaAntesBorrar = 2000, pausaAntesEscribir = 500;

function typeText() {
    const el = document.getElementById("typing-text");
    const textoCompleto = textos[textoActual];
    if (isDeleting) {
        el.innerHTML = textoCompleto.substring(0, index);
        index--;
        if (index < 0) { isDeleting = false; textoActual = (textoActual + 1) % textos.length; setTimeout(typeText, pausaAntesEscribir); }
        else { setTimeout(typeText, velocidadBorrar); }
    } else {
        el.innerHTML = textoCompleto.substring(0, index);
        index++;
        if (index > textoCompleto.length) { isDeleting = true; setTimeout(typeText, pausaAntesBorrar); }
        else { setTimeout(typeText, velocidadEscribir); }
    }
}

function crearParticula() {
    const container = document.getElementById('particles');
    if (!container) return;
    const p = document.createElement('div');
    p.classList.add('particle');
    p.style.left = Math.random() * 100 + '%';
    const size = Math.random() * 3 + 2;
    p.style.width = p.style.height = size + 'px';
    const dur = Math.random() * 6 + 4;
    p.style.animationDuration = dur + 's';
    p.style.animationDelay = Math.random() * 3 + 's';
    container.appendChild(p);
    setTimeout(() => p.remove(), (dur + 3) * 1000);
}
setInterval(crearParticula, 400);

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal, .fade-up').forEach(el => revealObserver.observe(el));

function animarContador(el) {
    const target = parseInt(el.dataset.target);
    const inicio = performance.now();
    function update(now) {
        const prog = Math.min((now - inicio) / 1500, 1);
        const ease = 1 - Math.pow(1 - prog, 3);
        el.textContent = Math.floor(ease * target);
        if (prog < 1) requestAnimationFrame(update);
        else el.textContent = target + '+';
    }
    requestAnimationFrame(update);
}
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.querySelectorAll('.stat-numero[data-target]').forEach(animarContador); statsObserver.unobserve(e.target); } });
}, { threshold: 0.5 });
const stats = document.querySelector('.stats-rapidos');
if (stats) statsObserver.observe(stats);

window.onload = function() {
    setTimeout(typeText, pausaAntesEscribir);
    document.querySelectorAll('.fade-up').forEach(el => setTimeout(() => el.classList.add('visible'), 100));
};