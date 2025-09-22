const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname,'..','public')));

const DATA_FILE = path.join(__dirname,'data.json');
if(!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE,'[]');

// ===== Config =====
const numerosBloqueados = [73,44,87,93]; // los que ya salen ocupados
const cajeros = ['1125127839','1112345678']; // Facu y Joaky
let indiceCajero = 0; // para rotar

app.get('/api/bloqueados',(req,res)=>{
  res.json({bloqueados: numerosBloqueados});
});

// Devuelve el próximo cajero de la lista
app.get('/api/cajero',(req,res)=>{
  const numero = cajeros[indiceCajero];
  indiceCajero = (indiceCajero + 1) % cajeros.length; // rota
  res.json({cajero: numero});
});

app.post('/api/registrar',(req,res)=>{
  const {numero,telefono} = req.body;
  const lista = JSON.parse(fs.readFileSync(DATA_FILE));
  lista.push({numero,telefono,cajeroAsignado: cajeros[(indiceCajero-1+cajeros.length)%cajeros.length],fecha:new Date()});
  fs.writeFileSync(DATA_FILE,JSON.stringify(lista,null,2));
  res.json({ok:true});
});

app.get('/api/ganador',(req,res)=>{
  res.json({ganador:93});
});

const PORT=process.env.PORT||3000;
app.listen(PORT,()=>console.log('Servidor en puerto',PORT));
