/* =========================================================
   PARTICLE BACKGROUND
========================================================= */

const canvas = document.getElementById("particleCanvas");
const ctx = canvas.getContext("2d");

let particles = [];
const COUNT = 80;
const mouse = { x: null, y: null, radius: 120 };

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

window.addEventListener("mousemove", e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

window.addEventListener("mouseout", () => {
    mouse.x = null;
    mouse.y = null;
});

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = Math.random() * 0.6 - 0.3;
        this.vy = Math.random() * 0.6 - 0.3;
        this.size = Math.random() * 2 + 1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

        if (mouse.x) {
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < mouse.radius) {
                this.x += (dx / dist) * 2;
                this.y += (dy / dist) * 2;
            }
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(56,189,248,0.7)";
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    for (let i = 0; i < COUNT; i++) {
        particles.push(new Particle());
    }
}
initParticles();

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animateParticles);
}
animateParticles();

/* =========================================================
   PROJECT ROUTING
========================================================= */

function openLink(url) {
    window.open(url, "_blank");
}

/* =========================================================
   INTERACTIVE LAB MODAL
========================================================= */

const labModal = document.getElementById("labModal");

function openLab() {
    labModal.style.display = "flex";
}

function closeLab(e) {
    if (!e || e.target === labModal) {
        labModal.style.display = "none";
    }
}

/* =========================================================
   LOGIC ANALYZER & COMPLEXITY ESTIMATOR
========================================================= */

function visualize() {
    const input = document.getElementById("logicInput").value.trim();
    const output = document.getElementById("flowResult");

    output.innerHTML = "";

    if (!input) {
        output.innerHTML = "<p style='color:#94a3b8'>No logic entered.</p>";
        return;
    }

    const lines = input
        .split("\n")
        .map(line => line.trim())
        .filter(Boolean);

    let loopCount = 0;
    let conditionCount = 0;
    let loopDepth = 0;
    let maxLoopDepth = 0;

    // ---------- VISUAL BLOCKS ----------
    lines.forEach(line => {
        const block = document.createElement("div");
        block.style.padding = "10px";
        block.style.margin = "8px 0";
        block.style.borderRadius = "8px";
        block.style.fontSize = "0.95rem";
        block.style.background = "#1e293b";
        block.style.color = "#e5e7eb";

        const lower = line.toLowerCase();

        // Detect loop
        if (lower.includes("for") || lower.includes("while")) {
            loopCount++;
            loopDepth++;
            maxLoopDepth = Math.max(maxLoopDepth, loopDepth);
            block.style.borderLeft = "4px solid #facc15";
            block.innerText = "🔁 Loop detected → " + line;
        }
        // Detect condition
        else if (lower.includes("if") || lower.includes("else")) {
            conditionCount++;
            block.style.borderLeft = "4px solid #38bdf8";
            block.innerText = "🔀 Condition → " + line;
        }
        // Detect end of block
        else if (lower === "end") {
            loopDepth = Math.max(0, loopDepth - 1);
            block.style.borderLeft = "4px solid #64748b";
            block.innerText = "⏹ End";
        }
        // Normal step
        else {
            block.style.borderLeft = "4px solid #22c55e";
            block.innerText = "➡ " + line;
        }

        output.appendChild(block);
    });

    // ---------- COMPLEXITY ----------
    let complexity = "O(1)";
    if (maxLoopDepth === 1) complexity = "O(n)";
    if (maxLoopDepth === 2) complexity = "O(n²)";
    if (maxLoopDepth >= 3) complexity = "O(n³+)";

    // ---------- SUMMARY ----------
    const summary = document.createElement("div");
    summary.style.marginTop = "16px";
    summary.style.padding = "12px";
    summary.style.background = "#020617";
    summary.style.borderRadius = "10px";
    summary.style.border = "1px solid #334155";
    summary.style.color = "#e5e7eb";

    summary.innerHTML = `
        <strong>Analysis Summary</strong><br><br>
        🔁 Loops detected: ${loopCount}<br>
        🔀 Conditions detected: ${conditionCount}<br>
        📊 Max loop depth: ${maxLoopDepth}<br>
        ⏱ Estimated Time Complexity: <b>${complexity}</b>
    `;

    if (maxLoopDepth >= 2) {
        summary.innerHTML += `<br><br>⚠ Nested loops detected — may impact performance.`;
    }

    output.appendChild(summary);
}
