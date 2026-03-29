// Background Animation Setup
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let w, h, dots = [];

function init() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    dots = [];
    for(let i=0; i<15; i++) {
        dots.push({ 
            x: Math.random()*w, 
            y: Math.random()*h, 
            r: Math.random()*80+20, 
            vx: Math.random()-0.5, 
            vy: Math.random()-0.5 
        });
    }
}

function anim() {
    ctx.fillStyle = '#030008'; 
    ctx.fillRect(0,0,w,h);
    dots.forEach(d => {
        d.x += d.vx; d.y += d.vy;
        if(d.x<0 || d.x>w) d.vx *= -1; 
        if(d.y<0 || d.y>h) d.vy *= -1;
        let g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r);
        g.addColorStop(0, '#1e1b4b'); 
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g; 
        ctx.beginPath(); 
        ctx.arc(d.x, d.y, d.r, 0, Math.PI*2); 
        ctx.fill();
    });
    requestAnimationFrame(anim);
}

init(); 
anim();

// Generator State
let mode = 'qr', logo = '';
const qr = new QRCodeStyling({ 
    width: 400, 
    height: 400, 
    dotsOptions: { type: "extra-rounded", color: "#8b5cf6" },
    qrOptions: { errorCorrectionLevel: "Q" }
});

// Navigation Functions
function enter() {
    document.getElementById('welcome-screen').classList.add('welcome-exit');
    document.getElementById('main-app').classList.add('active');
    qr.append(document.getElementById("qr-target"));
    sync();
}

function tab(m) {
    mode = m;
    document.getElementById('t-qr').classList.toggle('active', m==='qr');
    document.getElementById('t-bar').classList.toggle('active', m==='bar');
    document.getElementById('p-qr').style.display = m==='qr'?'block':'none';
    document.getElementById('p-bar').style.display = m==='bar'?'block':'none';
    document.getElementById('qr-target').style.display = m==='qr'?'block':'none';
    document.getElementById('bar-target').style.display = m==='bar'?'block':'none';
    sync();
}

// Update Logic
function sync() {
    if(mode === 'qr') {
        qr.update({ 
            data: document.getElementById('q-val').value, 
            image: logo, 
            dotsOptions: { 
                color: document.getElementById('q-clr').value, 
                type: document.getElementById('q-dot').value 
            } 
        });
    } else {
        try { 
            JsBarcode("#bar-target", document.getElementById('b-val').value, { 
                format: document.getElementById('b-fmt').value, 
                width: 2, 
                height: 50, 
                background: "#fff", 
                displayValue: true 
            }); 
        } catch(e) {
            console.error("Barcode generation error:", e);
        }
    }
}

// Event Listeners
document.querySelectorAll('input:not(#q-logo), select').forEach(e => e.addEventListener('input', sync));

document.getElementById('q-logo').addEventListener('change', e => {
    const f = e.target.files[0];
    const r = new FileReader();
    r.onload = ev => { 
        logo = ev.target.result; 
        document.getElementById('f-name').innerText = f.name.substring(0,10)+'...';
        sync(); 
    };
    if(f) r.readAsDataURL(f);
});

// Download Logic
function save() {
    if(mode === 'qr') {
        qr.download({ name: "Anik_QR", extension: "png" });
    } else {
        const svg = document.getElementById("bar-target");
        const xml = new XMLSerializer().serializeToString(svg);
        const can = document.createElement("canvas");
        const i = new Image();
        i.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
        i.onload = () => {
            can.width = i.width; 
            can.height = i.height;
            const c = can.getContext("2d");
            c.fillStyle = "white"; 
            c.fillRect(0,0,can.width,can.height);
            c.drawImage(i, 0, 0);
            const a = document.createElement('a'); 
            a.download = 'Anik_Bar.png'; 
            a.href = can.toDataURL(); 
            a.click();
        }
    }
}

window.addEventListener('resize', init);
