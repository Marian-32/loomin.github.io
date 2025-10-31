// ===== Helpers =====

const $ = (s, c = document) => c.querySelector(s);

const $$ = (s, c = document) => [...c.querySelectorAll(s)];

const html = document.documentElement;

// ===== Lucide =====

document.addEventListener("DOMContentLoaded", () => {
	lucide.createIcons();
});

// ===== Tema persistente =====

const THEME_KEY = "loomin_theme";

const stored = localStorage.getItem(THEME_KEY);

if (stored) {
	html.setAttribute("data-theme", stored);
} else {
	html.setAttribute(
		"data-theme",
		matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
	);
}

function toggleTheme() {
	const now = html.getAttribute("data-theme") === "dark" ? "light" : "dark";

	html.setAttribute("data-theme", now);

	localStorage.setItem(THEME_KEY, now);

	lucide.createIcons(); // re-render icons para contraste
}

$("[data-action='theme']")?.addEventListener("click", toggleTheme);

$(".theme-toggle")?.addEventListener("click", toggleTheme);

// ===== Off-canvas DERECHA (50svw) =====

const nav = $("#nav");

const btnMenu = $(".menu-toggle");

const btnClose = $(".nav__close");

btnMenu?.addEventListener("click", () => {
	nav.classList.add("is-open");

	nav.setAttribute("aria-hidden", "false");

	btnMenu.setAttribute("aria-expanded", "true");

	setTimeout(() => nav.querySelector(".nav__link")?.focus(), 120);
});

function closeNav() {
	nav.classList.remove("is-open");

	nav.setAttribute("aria-hidden", "true");

	btnMenu.setAttribute("aria-expanded", "false");

	btnMenu.focus();
}

btnClose?.addEventListener("click", closeNav);

nav?.addEventListener("click", (e) => {
	if (e.target.matches("#nav a")) closeNav();
});

// ===== Scroll progress + header shrink =====

const header = $(".header");

const progress = $(".scroll-progress span");

let lastY = 0;

function onScroll() {
	const y = window.scrollY || document.documentElement.scrollTop;

	header.classList.toggle("header--shrink", y > 8 && y > lastY);

	lastY = y <= 0 ? 0 : y;

	const h = document.documentElement,
		total = h.scrollHeight - h.clientHeight;

	progress.style.width = (total > 0 ? (h.scrollTop / total) * 100 : 0) + "%";
}

addEventListener("scroll", onScroll, { passive: true });

onScroll();

// ===== Ripple =====

function attachRipple(el) {
	el.addEventListener("pointerdown", (e) => {
		const rect = el.getBoundingClientRect();

		el.style.setProperty("--rx", e.clientX - rect.left + "px");

		el.style.setProperty("--ry", e.clientY - rect.top + "px");

		el.classList.remove("is-animating");
		void el.offsetWidth;
		el.classList.add("is-animating");
	});
}

$$(".ripple").forEach(attachRipple);

// ===== NAV ACTIVO por CLICK =====

const navLinks = [...document.querySelectorAll(".nav__link")];

navLinks.forEach((a) => {
	a.addEventListener("click", () => {
		navLinks.forEach((n) => {
			n.classList.remove("is-active");
			n.removeAttribute("aria-current");
		});

		a.classList.add("is-active");

		a.setAttribute("aria-current", "page");
	});
});

// ===== NAV/DOCK ACTIVO por SCROLL =====

const sectionIds = [
	"main",
	"servicios",
	"planes",
	"proyectos",
	"equipo",
	"faq",
	"contacto",
	"crear-cuenta"
];

const dockBtns = [...document.querySelectorAll(".dock__btn[href^='#']")];

const observer = new IntersectionObserver(
	(entries) => {
		const visible = entries
			.filter((e) => e.isIntersecting)
			.sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

		if (!visible) return;

		const id = visible.target.id ? `#${visible.target.id}` : "#main";

		// Marca en nav

		navLinks.forEach((n) => {
			const match = n.getAttribute("href") === id;

			n.classList.toggle("is-active", match);

			if (match) n.setAttribute("aria-current", "page");
			else n.removeAttribute("aria-current");
		});

		// Marca en dock

		dockBtns.forEach((b) =>
			b.classList.toggle("is-active", b.getAttribute("href") === id)
		);
	},
	{ rootMargin: "-40% 0px -50% 0px", threshold: [0.25, 0.5, 0.75] }
);

sectionIds.forEach((id) => {
	const el = document.getElementById(id);

	if (el) observer.observe(el);
});

// ===== FABs =====

$("[data-action='top']")?.addEventListener("click", () =>
	scrollTo({ top: 0, behavior: "smooth" })
);

// ===== Celebración: confetti =====

const canvas = $("#confetti");

const ctx = canvas.getContext("2d", { alpha: true });

function resizeCanvas() {
	canvas.width = canvas.parentElement.clientWidth;

	canvas.height = canvas.parentElement.clientHeight;
}

function rand(a, b) {
	return Math.random() * (b - a) + a;
}

let confetti = [],
	animId = null;

function makeConfetti(n = 120) {
	const cs = getComputedStyle(document.documentElement);

	const c1 = cs.getPropertyValue("--accent").trim();

	const c2 = cs.getPropertyValue("--accent-2").trim();

	confetti = Array.from({ length: n }, () => ({
		x: rand(0, canvas.width),

		y: rand(-40, -10),

		v: rand(1, 3),

		w: rand(8, 16),

		h: rand(4, 8),

		r: rand(0, 2 * Math.PI),

		dr: rand(-0.05, 0.05),

		color: Math.random() > 0.5 ? c1 : c2
	}));
}

function drawConfetti() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	confetti.forEach((p) => {
		ctx.save();
		ctx.translate(p.x, p.y);
		ctx.rotate(p.r);

		ctx.fillStyle = p.color;
		ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);

		ctx.restore();

		p.y += p.v;
		p.x += Math.sin(p.y * 0.02);
		p.r += p.dr;
	});

	confetti = confetti.filter((p) => p.y < canvas.height + 20);

	if (confetti.length > 0) animId = requestAnimationFrame(drawConfetti);
}

function celebrate() {
	if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

	resizeCanvas();
	makeConfetti();
	cancelAnimationFrame(animId);
	drawConfetti();

	if (navigator.vibrate) navigator.vibrate(20);
}

addEventListener("resize", () => {
	if (animId) resizeCanvas();
});

$("[data-celebrate]")?.addEventListener("click", celebrate);

// Auto una vez por sesión

if (!sessionStorage.getItem("loomin_clinked")) {
	setTimeout(() => {
		celebrate();
		sessionStorage.setItem("loomin_clinked", "1");
	}, 800);
}

// ===== Formularios (demo sin backend) =====

function handleForm(formId, okMsg) {
	const form = $(formId);

	if (!form) return;

	const msg = form.querySelector(".form-msg");

	form.addEventListener("submit", (e) => {
		e.preventDefault();

		if (!form.checkValidity()) {
			msg.textContent = "Por favor, completá los campos obligatorios.";

			return;
		}

		msg.textContent = okMsg;

		form.reset();
	});
}

handleForm(
	"#form-contact",
	"Gracias, revisaremos tu consulta y te responderemos."
);

handleForm("#form-signup", "Cuenta creada (demo). Revisá tu correo.");

// ===== Lucide final pass (por si cambia tema) =====

document.addEventListener("visibilitychange", () => {
	if (document.visibilityState === "visible") lucide.createIcons();
});
