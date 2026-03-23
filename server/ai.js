const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;

function initAI() {
  if (process.env.GEMINI_API_KEY) {
    try {
      genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      console.log('✅ Google Gemini API initialisée');
    } catch (err) {
      console.error('❌ Erreur lors de l\'initialisation de Gemini :', err.message);
    }
  } else {
    console.log('⚠️  GEMINI_API_KEY non définie, les fonctionnalités IA seront désactivées.');
  }
}

async function generateResponse(prompt) {
  if (!genAI) {
    throw new Error("L'API Gemini n'est pas configurée sur ce serveur.");
  }

  const systemPrompt = `Tu es une IA sarcastique, fun et très brève qui s'affiche en gros caractères sur l'écran d'un utilisateur. Ton message doit être très court (maximum 150 caractères) car il sera lu très vite. Ne mets pas de formatage Markdown (pas d'astérisques ou gras), juste du texte brut. Le prompt de l'utilisateur qui te commande est le suivant : "${prompt}"`;

  // Liste des modèles à essayer par ordre de préférence.
  // Cache en mémoire du dernier modèle qui a fonctionné pour cette clé API
  // Cela permet de ne pas faire 7 requêtes à chaque fois et de régler le problème "89 requêtes"
  const defaultModels = [
    'gemini-2.0-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash',
    'gemini-flash-latest',
    'gemini-1.0-pro-latest',
    'gemini-1.0-pro',
    'gemini-pro'
  ];

  // Si on a un modèle fonctionnel en cache, on le met en premier
  const modelsToTry = global.workingGeminiModel
    ? [global.workingGeminiModel, ...defaultModels.filter(m => m !== global.workingGeminiModel)]
    : defaultModels;

  let result = null;
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      result = await model.generateContent(systemPrompt);
      // Si on arrive ici, le modèle a fonctionné
      console.log(`[Gemini AI] Modèle utilisé avec succès : ${modelName}`);
      global.workingGeminiModel = modelName; // Enregistrer le modèle pour les prochains appels
      break;
    } catch (apiError) {
      lastError = apiError;
      const errMsg = apiError.message || '';

      // Si c'est un 429 avec "limit: 0", cela signifie que le modèle est DÉSACTIVÉ pour ce projet gratuit.
      // Il faut ABSOLUMENT continuer et essayer le suivant.
      if (errMsg.includes('limit: 0') || errMsg.includes('limit 0')) {
        console.warn(`[Gemini AI] Modèle ${modelName} désactivé pour ce compte (limit: 0). Tentative du suivant...`);
        continue;
      }

      // Si c'est un VRAI 429 (quota réel dépassé sur un modèle qui marche d'habitude)
      // ou 403 (accès interdit globalement), on arrête pour éviter de spammer l'API
      if (apiError.status === 429 || errMsg.includes('429') || apiError.status === 403 || errMsg.includes('403')) {
        console.warn(`[Gemini AI] VRAI Quota atteint ou accès interdit (${apiError.status || 'erreur HTTP'}) sur ${modelName}. Arrêt des tentatives pour éviter le spam.`);
        break;
      }

      // Si l'erreur est un 404 (modèle introuvable pour cette clé spécifique), on essaie le suivant.
      if (apiError.status === 404 || errMsg.includes('404')) {
        console.warn(`[Gemini AI] Modèle ${modelName} inaccessible (404), tentative avec le suivant...`);
        continue;
      }

      // Pour les autres erreurs (ex: clé invalide globale 400), on arrête immédiatement
      break;
    }
  }

  if (!result) {
    console.error('[Gemini AI] Erreur de génération (tous les modèles ont échoué) :', lastError);
    throw new Error('Erreur lors de la génération IA: ' + (lastError?.message || lastError));
  }

  try {
    const response = await result.response;
    let text = response.text();

    text = text.replace(/[*_~`]/g, '').trim();

    if (text.length > 200) {
      text = text.substring(0, 197) + '...';
    }

    return text;
  } catch (err) {
    console.error('[Gemini AI] Erreur lors de l\'extraction du texte :', err);
    throw new Error('Erreur lors de la génération IA: ' + (err.message || err));
  }
}

module.exports = { initAI, generateResponse };
