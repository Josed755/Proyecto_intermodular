const express = require('express');
const cors = require('cors');
const { pool, createTable } = require('./database/config');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:3000',  
  credentials: true
}));
app.use(express.json());

// Inicializa la base de datos
createTable();

// Obtiene todos los alumnos
app.get('/api/cafeteria', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM Alumnos WHERE Activo = TRUE ORDER BY Nombre'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error GET /api/alumnos:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtiene todas las estadísticas
app.get('/api/estadisticas', async (req, res) => {
  try {
    // Por sexo
    const [sexoStats] = await pool.execute(`
      SELECT 
        Sexo,
        COUNT(*) as cantidad,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM Alumnos WHERE Activo = TRUE)), 2) as porcentaje
      FROM Alumnos 
      WHERE Activo = TRUE
      GROUP BY Sexo
    `);

    // Por repetidor
    const [repetidorStats] = await pool.execute(`
      SELECT 
        CASE 
          WHEN Repetidor = TRUE THEN 'Repetidor'
          ELSE 'No Repetidor'
        END as tipo,
        COUNT(*) as cantidad,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM Alumnos WHERE Activo = TRUE)), 2) as porcentaje
      FROM Alumnos 
      WHERE Activo = TRUE
      GROUP BY Repetidor
    `);

    res.json({
      sexo: sexoStats,
      repetidor: repetidorStats
    });
  } catch (error) {
    console.error('Error GET /api/estadisticas:', error);
    res.status(500).json({ error: error.message });
  }
});

// Para crear nuevo alumno
app.post('/api/alumnos', async (req, res) => {
  const { matricula, nombre, sexo, edad, email, repetidor } = req.body;
  
  try {
    const [result] = await pool.execute(
      'INSERT INTO Alumnos (Matricula, Nombre, Sexo, Edad, Email, Repetidor) VALUES (?, ?, ?, ?, ?, ?)',
      [matricula, nombre, sexo, edad || null, email || null, repetidor || false]
    );
    
    const [newAlumno] = await pool.execute(
      'SELECT * FROM Alumnos WHERE Id = ?',
      [result.insertId]
    );
    
    res.status(201).json(newAlumno[0]);
  } catch (error) {
    console.error('Error POST /api/alumnos:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'La matrícula ya existe' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Para actualizar alumno
app.put('/api/alumnos/:id', async (req, res) => {
  const { id } = req.params;
  const { matricula, nombre, sexo, edad, email, repetidor } = req.body;
  
  try {
    await pool.execute(
      `UPDATE Alumnos 
       SET Matricula = ?, Nombre = ?, Sexo = ?, Edad = ?, Email = ?, Repetidor = ?
       WHERE Id = ?`,
      [matricula, nombre, sexo, edad || null, email || null, repetidor || false, id]
    );
    
    res.json({ success: true, message: 'Alumno actualizado' });
  } catch (error) {
    console.error('Error PUT /api/alumnos/:id:', error);
    res.status(500).json({ error: error.message });
  }
});

// Para eliminar alumno 
app.delete('/api/alumnos/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    await pool.execute(
      'UPDATE Alumnos SET Activo = FALSE WHERE Id = ?',
      [id]
    );
    
    res.json({ success: true, message: 'Alumno dado de baja' });
  } catch (error) {
    console.error('Error DELETE /api/alumnos/:id:', error);
    res.status(500).json({ error: error.message });
  }
});

// Datos para el PDF
app.get('/api/alumnos/pdf', async (req, res) => {
  try {
    const [alumnos] = await pool.execute('SELECT * FROM Alumnos WHERE Activo = TRUE ORDER BY Nombre');
    const [estadisticas] = await pool.execute(`
      SELECT 
        (SELECT COUNT(*) FROM Alumnos WHERE Activo = TRUE AND Sexo = "Masculino") as masculinos,
        (SELECT COUNT(*) FROM Alumnos WHERE Activo = TRUE AND Sexo = "Femenino") as femeninos,
        (SELECT COUNT(*) FROM Alumnos WHERE Activo = TRUE AND Repetidor = TRUE) as repetidores,
        (SELECT COUNT(*) FROM Alumnos WHERE Activo = TRUE AND Repetidor = FALSE) as noRepetidores,
        (SELECT COUNT(*) FROM Alumnos WHERE Activo = TRUE) as total
    `);
    
    res.json({
      alumnos,
      estadisticas: estadisticas[0],
      fechaGeneracion: new Date().toLocaleDateString('es-ES')
    });
  } catch (error) {
    console.error('Error GET /api/alumnos/pdf:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend funcionando' });
});

app.listen(PORT, () => {
  console.log(`Backend ejecutándose en: http://localhost:${PORT}`);
  console.log(`API disponible en: http://localhost:${PORT}/api/alumnos`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});