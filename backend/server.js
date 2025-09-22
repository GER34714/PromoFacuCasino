const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// ===== CONFIG =====
// Números que vos querés reservar de antemano (opcional)
const numerosFijos = [73, 44, 87, 93];
// Cajeros para rotación de WhatsApp
const cajeros = ['1125127839', '1112345678'];
let indiceCajero = 0;

// Archivo de almacenamiento
const DATA_FILE = path.join(__dirname, 'data.json');
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]');

// ===== RUTAS =====

// 🔹 Bloqueados: fijos + todos los que ya eligieron
app.get('/api/bloqueados', (req, res) => {
  const lista = JSON.parse(fs.readFileSync(DATA_FILE));
  const elegidos = lista.map(item => item.numero);
  const bloqueados = Array.from(new Set([...numerosFijos, ...elegidos]));
  res.json({ bloqueados });
});

// 🔹 Próximo cajero
app.get('/api/cajero', (req, res) => {
  const numero = cajeros[indiceCajero];
  indiceCajero = (indiceCajero + 1) % cajeros.length;
  res.json({ cajero: numero });
});

// 🔹 Registrar elección
app.post('/api/registrar', (req, res) => {
  const { numero, telefono } = req.body;
  const lista = JSON.parse(fs.readFileSync(DATA_FILE));

  // Si el número ya está elegido, no lo guardamos de nuevo
  if (lista.some(item => item.numero === numero)) {
    return res.json({ ok: false, mensaje: 'Número ya ocupado' });
  }

  const cajeroAsignado = cajeros[(indiceCajero - 1 + cajeros.length) % cajeros.length];
  lista.push({ numero, telefono, cajeroAsignado, fecha: new Date() });
  fs.writeFileSync(DATA_FILE, JSON.stringify(lista, null, 2));
  res.json({ ok: true });
});

// 🔹 Número ganador (para ganador.html)
app.get('/api/ganador', (req, res) => {
  res.json({ ganador: 93 });
});

// ===== START =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Servidor corriendo en puerto', PORT));
