# SimpleVideo

Application web permettant de générer une vidéo verticale (9:16) à partir d'images, d'un titre et d'un sous-titre.

## Dossiers

- `backend` : serveur Node.js/Express utilisant FFmpeg pour produire la vidéo.
- `frontend` : petite application React consommant l'API.

## Prérequis

- Node.js >= 16
- FFmpeg installé sur la machine

## Lancer le backend

```bash
cd backend
npm install
npm start
```

Le serveur écoute par défaut sur le port `3001`.

## Lancer le frontend

Servir simplement le fichier `frontend/index.html` (par exemple avec `npx serve frontend`).

La page propose de téléverser des images (1 à 10), saisir un titre et un sous-titre puis génère la vidéo via l'API.
