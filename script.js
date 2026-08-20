(() => {
  "use strict";

  const phone = "5585997684934";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll("[data-year]").forEach((n) => { n.textContent = String(new Date().getFullYear()); });

  const floatMsg = encodeURIComponent("Olá! Quero saber mais sobre o Levizim para o nosso casamento.");
  document.querySelectorAll("[data-whatsapp]").forEach((a) => { a.href = `https://wa.me/${phone}?text=${floatMsg}`; });

  const header = document.querySelector("[data-header]");
  const heroScroll = document.querySelector(".hero-scroll");
  const scrubCopy = document.querySelector("[data-scrub-copy]");
  const scrubPhotos = document.querySelector("[data-scrub-photos]");
  const heroFigs = Array.from(document.querySelectorAll(".hero-photos figure"));
  const parallax = Array.from(document.querySelectorAll("[data-parallax] img"));
  const manifestoScroll = document.querySelector(".manifesto-scroll");
  const mText = document.querySelector("[data-mtext]");
  const mCards = Array.from(document.querySelectorAll(".manifesto-cards .pillar-card"));
  const desktop = () => window.innerWidth > 900;

  let ticking = false;
  const onScroll = () => {
    const vh = window.innerHeight;

    if (header && heroScroll) {
      header.classList.toggle("is-solid", heroScroll.getBoundingClientRect().bottom < vh * 0.8);
    }

    if (!reduced) {
      // Hero suave: a copy recua e some, as fotos sobem na frente
      if (heroScroll) {
        const rect = heroScroll.getBoundingClientRect();
        const dist = Math.max(1, heroScroll.offsetHeight - vh);
        const p = Math.min(1, Math.max(0, -rect.top / dist));
        if (scrubCopy) {
          scrubCopy.style.transform = `translateY(${(-p * 9).toFixed(2)}vh)`;
          scrubCopy.style.opacity = String(Math.max(0, 1 - p * (desktop() ? 1.55 : 6)));
        }
        if (desktop()) {
          if (scrubPhotos) {
            scrubPhotos.style.transform = `translateY(${((1 - p) * 74).toFixed(2)}vh)`;
            scrubPhotos.style.opacity = String(Math.min(1, Math.max(0, p * 1.5 - 0.04)));
          }
          heroFigs.forEach((f) => { f.style.opacity = ""; f.style.transform = ""; });
        } else if (heroFigs.length) {
          // Mobile: uma foto por vez, grande
          if (scrubPhotos) { scrubPhotos.style.transform = ""; scrubPhotos.style.opacity = "1"; }
          const startP = 0.18, n = heroFigs.length, seg = (1 - startP) / n;
          heroFigs.forEach((fig, i) => {
            const local = (p - (startP + i * seg)) / seg;
            let op = 0, sc = 0.9;
            if (local >= 0) {
              const fin = Math.min(1, local / 0.32);
              const fout = i < n - 1 ? Math.max(0, 1 - (local - 0.82) / 0.18) : 1;
              op = Math.max(0, Math.min(fin, fout));
              sc = 0.9 + 0.12 * fin;
            }
            if (local > 1 && i === n - 1) { op = 1; sc = 1.02; }
            fig.style.opacity = String(op);
            fig.style.transform = `translate(-50%, -50%) scale(${sc.toFixed(3)})`;
          });
        }
      }

      // Parallax nos fundos (só desktop)
      if (desktop()) {
        parallax.forEach((img) => {
          const host = img.closest("[data-parallax]");
          const r = host.getBoundingClientRect();
          const rel = (r.top + r.height / 2 - vh / 2) / vh;
          img.style.transform = `translateY(${(rel * -30).toFixed(1)}px)`;
        });
      }
    }

    // Manifesto: texto aparece primeiro, as fotos sobem por cima uma a uma
    if (manifestoScroll && mCards.length && !reduced) {
      const mr = manifestoScroll.getBoundingClientRect();
      const mdist = Math.max(1, manifestoScroll.offsetHeight - vh);
      const mp = Math.min(1, Math.max(0, -mr.top / mdist));
      if (mText) {
        const tf = mp < 0.12 ? 1 : Math.max(0, 1 - (mp - 0.12) / 0.22);
        mText.style.opacity = String(tf);
        mText.style.transform = `translateY(${(-Math.max(0, mp - 0.12) * 7).toFixed(2)}vh)`;
      }
      const startC = 0.15, n = mCards.length, seg = (1 - startC) / n;
      if (desktop()) {
        mCards.forEach((c, i) => {
          const local = (mp - (startC + i * seg)) / seg;
          const fin = Math.min(1, Math.max(0, local / 0.5));
          c.style.opacity = String(fin);
          c.style.transform = `translateY(${((1 - fin) * 72).toFixed(1)}px)`;
        });
      } else {
        mCards.forEach((c, i) => {
          const local = (mp - (startC + i * seg)) / seg;
          let op = 0, sc = 0.92;
          if (local >= 0) {
            const fin = Math.min(1, local / 0.32);
            const fout = i < n - 1 ? Math.max(0, 1 - (local - 0.82) / 0.18) : 1;
            op = Math.max(0, Math.min(fin, fout));
            sc = 0.92 + 0.1 * fin;
          }
          if (local > 1 && i === n - 1) { op = 1; sc = 1.02; }
          c.style.opacity = String(op);
          c.style.transform = `translate(-50%, -50%) scale(${sc.toFixed(3)})`;
        });
      }
    } else if (mCards.length && reduced) {
      mCards.forEach((c) => { c.style.opacity = "1"; });
    }
    ticking = false;
  };
  const schedule = () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } };
  onScroll();
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);

  // Reveal
  const items = Array.from(document.querySelectorAll(".reveal"));
  if (reduced || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
  } else {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const delay = Number(entry.target.dataset.revealDelay || 0) * 100;
        setTimeout(() => entry.target.classList.add("is-visible"), delay);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    items.forEach((el) => io.observe(el));
  }

  // Contagem dos números (autoridade)
  const counters = Array.from(document.querySelectorAll("[data-count]"));
  if (counters.length && !reduced && "IntersectionObserver" in window) {
    const co = new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = Number(el.dataset.count) || 0;
        const prefix = el.dataset.prefix || "";
        const suffix = el.dataset.suffix || "";
        const t0 = performance.now(), dur = 1500;
        const step = (t) => {
          const p = Math.min(1, (t - t0) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = prefix + Math.round(target * eased) + suffix;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        obs.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach((c) => co.observe(c));
  }

  const dateInput = document.getElementById("data");
  if (dateInput) {
    const now = new Date();
    dateInput.min = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  }

  const form = document.getElementById("booking-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const val = (id) => document.getElementById(id)?.value.trim() || "Não informado";
      const rawDate = document.getElementById("data")?.value;
      const dataFmt = rawDate
        ? new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(`${rawDate}T12:00:00Z`))
        : "Não informada";
      const message = [
        "Olá! Gostaria de solicitar uma proposta do Levizim para o nosso casamento.",
        "",
        `Noivos: ${val("nome")}`,
        `WhatsApp: ${val("whatsapp")}`,
        `Data do casamento: ${dataFmt}`,
        `Cidade/Estado: ${val("cidade")}`,
        `Local: ${val("local")}`,
        `Nº de convidados: ${val("convidados")}`,
        `Ideia musical: ${val("mensagem")}`
      ].join("\n");
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
      const popup = window.open(url, "_blank", "noopener,noreferrer");
      if (!popup) window.location.assign(url);
    });
  }
})();
