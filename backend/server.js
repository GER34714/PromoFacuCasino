const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// ===== Config =====
// Números bloqueados de antemano (el ganador incluido pero oculto)
const numerosBloqueados = [73, 44, 87, 93]; // 93 es el ganador secreto
// Lista de cajeros para rotar los WhatsApp
const cajeros = ['1125127839', '1112345678']; // Facu, Joaky
let indiceCajero = 0; // round-robin

// Archivo donde se guardan los registros
const DATA_FILE = path.join(__dirname, 'data.json');
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]');

// ===== Rutas =====

// Números bloqueados para pintar en la grilla
app.get('/api/bloqueados', (req, res) => {
  res.json({ bloqueados: numerosBloqueados });
});

// Devuelve el próximo cajero para este usuario
app.get('/api/cajero', (req, res) => {
  const numero = cajeros[indiceCajero];
  indiceCajero = (indiceCajero + 1) % cajeros.length; // rota
  res.json({ cajero: numero });
});

// Registra la elección en el archivo local
app.post('/api/registrar', (req, res) => {
  const { numero, telefono } = req.body;
  const lista = JSON.parse(fs.readFileSync(DATA_FILE));
  // Guardamos también el cajero asignado
  const cajeroAsignado = cajeros[(indiceCajero - 1 + cajeros.length) % cajeros.length];
  lista.push({ numero, telefono, cajeroAsignado, fecha: new Date() });
  fs.writeFileSync(DATA_FILE, JSON.stringify(lista, null, 2));
  res.json({ ok: true });
});

// Número ganador (lo mostrará ganador.html el día del sorteo)
app.get('/api/ganador', (req, res) => {
  res.json({ ganador: 93 });
});

// ===== Start =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Servidor corriendo en puerto', PORT));
