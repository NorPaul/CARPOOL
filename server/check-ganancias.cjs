require('dotenv').config();
const sequelize = require('./config/database');

async function check() {
  await sequelize.authenticate();
  console.log('✅ Conectado a la BD\n');

  const [viajes] = await sequelize.query(`
    SELECT IdViaje, AsientosTotales, AsientosDisponibles, PrecioPorPasajero, IdEstado,
           (AsientosTotales - AsientosDisponibles) AS DifAsientos
    FROM viajes
    WHERE IdEstado = 3
    ORDER BY IdViaje
  `);

  const [participantes] = await sequelize.query(`
    SELECT IdViaje, COUNT(*) AS TotalParticipantes
    FROM participantesviaje
    GROUP BY IdViaje
  `);

  const partMap = {};
  participantes.forEach(p => { partMap[p.IdViaje] = Number(p.TotalParticipantes); });

  console.log('=== Viajes Finalizados (IdEstado=3) ===');
  let totalAsientos = 0, totalParticipantes = 0;
  viajes.forEach(v => {
    const part = partMap[v.IdViaje] ?? 0;
    const ganAsientos = v.DifAsientos * Number(v.PrecioPorPasajero);
    const ganPart    = part * Number(v.PrecioPorPasajero);
    totalAsientos += ganAsientos;
    totalParticipantes += ganPart;
    const ok = v.DifAsientos === part ? '✅' : '❌ INCONSISTENTE';
    console.log(`  Viaje #${v.IdViaje}: AsientosDif=${v.DifAsientos}  Participantes=${part}  ${ok}`);
    console.log(`             Ganancia por asientos=$${ganAsientos.toFixed(2)}  Ganancia por participantes=$${ganPart.toFixed(2)}`);
  });

  console.log(`\nTOTAL por (AsientosTotales-Disponibles): $${totalAsientos.toFixed(2)}`);
  console.log(`TOTAL por ParticipanteViaje:              $${totalParticipantes.toFixed(2)}`);
  process.exit(0);
}

check().catch(e => { console.error('Error:', e.message); process.exit(1); });
