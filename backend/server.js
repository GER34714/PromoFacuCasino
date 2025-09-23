const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// ===== CONFIG =====
// Números reservados de antemano (opcional)
const numerosFijos = [73, 44, 87, 93];

// ✅ Solo Facu en formato internacional (Argentina)
const cajeros = ['+5491125127839'];
let indiceCajero = 0; // ya no rota porque solo hay uno

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

// 🔹 Cajero (siempre Facu)
app.get('/api/cajero', (req, res) => {
  const numero = cajeros[indiceCajero];
  // aunque haya un solo cajero, dejamos la lógica por si querés volver a rotar
  indiceCajero = (indiceCajero + 1) % cajeros.length;
  res.json({ cajero: numero });
});

// 🔹 Registrar elección
app.post('/api/registrar', (req, res) => {
  const { numero, telefono } = req.body;
  const lista = JSON.parse(fs.readFileSync(DATA_FILE));

  // Verificar si el número ya está ocupado
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
