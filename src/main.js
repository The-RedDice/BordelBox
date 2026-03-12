/**
 * Cacabox Client — main.js
 * Gère la connexion Socket.io, la réception des items et leur affichage.
 */

// ─── Config ──────────────────────────────────────────────────────────────────

// Chargé depuis config.json via fetch (fonctionne avec Tauri et un serveur local)
let CONFIG = { pseudo: 'unknown', serverUrl: 'http://localhost:3000' };

async function loadConfig() {
  try {
    const res = await fetch('./config.json');
    CONFIG = await res.json();
    if (!CONFIG.pseudo || CONFIG.pseudo === 'CHANGE_MOI') {
      CONFIG.pseudo = 'pc_' + Math.random().toString(36).slice(2, 7);
      console.warn('[Cacabox] Pseudo non défini, pseudo aléatoire :', CONFIG.pseudo);
    }
  } catch (e) {
    console.error('[Cacabox] Impossible de charger config.json', e);
  }
}

// ─── Socket.io (chargé dynamiquement depuis le serveur) ──────────────────────

async function loadSocketIO() {
  return new Promise((resolve, reject) => {
    const s   = document.createElement('script');
    s.src     = `${CONFIG.serverUrl}/socket.io/socket.io.js`;
    s.onload  = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

// ─── Éléments DOM ────────────────────────────────────────────────────────────

const mediaContainer  = document.getElementById('media-container');
const mediaVideo      = document.getElementById('media-video');
const mediaImage      = document.getElementById('media-image');
const messageContainer = document.getElementById('message-container');
const messageText     = document.getElementById('message-text');
const audioPlayer     = document.getElementById('audio-player');

// ─── Logique d'affichage ──────────────────────────────────────────────────────

let socket;

/**
 * Affiche un item reçu du serveur, puis émet `media_ended` une fois terminé.
 */
function showItem(item) {
  const { type, payload } = item;

  switch (type) {

    // ── Vidéo téléchargée via yt-dlp ──────────────────
    case 'media': {
      hideAll();
      const src = `${CONFIG.serverUrl}/media/${payload.filename}`;

      mediaVideo.style.display = 'block';
      mediaImage.style.display = 'none';
      mediaVideo.src = src;
      mediaContainer.classList.add('visible');

      // Unmute nécessaire sur certains navigateurs (politique autoplay)
      mediaVideo.muted = false;
      mediaVideo.volume = 1;

      mediaVideo.onended = () => {
        hideAll();
        socket.emit('media_ended');
      };
      mediaVideo.onerror = () => {
        console.error('[Cacabox] Erreur lecture vidéo');
        hideAll();
        socket.emit('media_ended');
      };
      break;
    }

    // ── Fichier (image ou audio CDN Discord) ──────────
    case 'file': {
      hideAll();
      const { url, fileType } = payload;

      if (fileType === 'audio') {
        audioPlayer.src = url;
        audioPlayer.play().catch(console.error);
        audioPlayer.onended = () => {
          socket.emit('media_ended');
        };
        // Pas d'affichage visuel pour l'audio
      } else {
        // Image
        mediaImage.style.display = 'block';
        mediaVideo.style.display = 'none';
        mediaImage.src = url;
        mediaContainer.classList.add('visible');

        // Afficher 5 secondes puis passer au suivant
        setTimeout(() => {
          hideAll();
          socket.emit('media_ended');
        }, 5000);
      }
      break;
    }

    // ── Message texte ──────────────────────────────────
    case 'message': {
      hideAll();
      messageText.textContent = payload.text;

      // Reset animation
      messageText.style.animation = 'none';
      messageText.offsetHeight;   // reflow
      messageText.style.animation = '';

      messageContainer.classList.add('visible');

      // Durée basée sur la longueur du texte, min 3s max 8s
      const duration = Math.min(8000, Math.max(3000, payload.text.length * 60));

      setTimeout(() => {
        messageContainer.classList.remove('visible');
        setTimeout(() => {
          socket.emit('media_ended');
        }, 400); // Attendre la transition de disparition
      }, duration);
      break;
    }

    default:
      console.warn('[Cacabox] Type inconnu :', type);
      socket.emit('media_ended');
  }
}

function hideAll() {
  mediaContainer.classList.remove('visible');
  messageContainer.classList.remove('visible');
  mediaVideo.src    = '';
  mediaVideo.pause();
  mediaImage.src    = '';
  audioPlayer.src   = '';
  audioPlayer.pause();
}

// ─── Init ─────────────────────────────────────────────────────────────────────

(async () => {
  await loadConfig();
  await loadSocketIO().catch(() => {
    console.error('[Cacabox] Impossible de charger Socket.io. Serveur démarré ?');
    return;
  });

  // eslint-disable-next-line no-undef
  socket = io(CONFIG.serverUrl, {
    reconnection: true,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 10000,
  });

  socket.on('connect', () => {
    console.log('[Cacabox] Connecté au serveur — identification avec :', CONFIG.pseudo);
    socket.emit('identify', { pseudo: CONFIG.pseudo });
  });

  socket.on('identified', ({ pseudo }) => {
    console.log('[Cacabox] Identifié :', pseudo);
    // Activer le click-through via la commande Tauri
    activateClickThrough();
  });

  // Le serveur pousse l'item à afficher
  socket.on('show', (item) => {
    console.log('[Cacabox] Reçu :', item.type);
    showItem(item);
  });

  socket.on('disconnect', () => {
    console.warn('[Cacabox] Déconnecté — tentative de reconnexion…');
  });
})();

// ─── Click-through Tauri ──────────────────────────────────────────────────────

async function activateClickThrough() {
  try {
    // L'import de l'API Tauri est dynamique pour éviter les erreurs en mode navigateur
    const { invoke } = await import('@tauri-apps/api/core');
    await invoke('set_clickthrough', { enabled: true });
    console.log('[Cacabox] Click-through activé');
  } catch {
    // Pas dans un contexte Tauri (ex: dev browser) — pas grave
    console.info('[Cacabox] Click-through non disponible (hors Tauri)');
  }
}
