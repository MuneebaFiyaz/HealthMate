
export async function initializeDatabase(database) {
    await database.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS health_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      steps INTEGER NOT NULL,
      calories INTEGER NOT NULL,
      water INTEGER NOT NULL
    );
  `);

    console.log('HealthMate database initialized successfully.');
}

// Add a new health record
export async function addHealthRecord(database, record) {
    const result = await database.runAsync(
        `INSERT INTO health_records (date, steps, calories, water)
     VALUES (?, ?, ?, ?);`,
        record.date,
        record.steps,
        record.calories,
        record.water
    );

    return result.lastInsertRowId;
}

// Get all the health records 
export async function getHealthRecords(database) {
    return await database.getAllAsync(
        'SELECT * FROM health_records ORDER BY date DESC, id DESC;'
    );
}

// Get one health record
export async function getHealthRecordById(database, id) {
    return await database.getFirstAsync(
        'SELECT * FROM health_records WHERE id = ?;',
        id
    );
}

// Update an existing health record
export async function updateHealthRecord(database, id, record) {
    return await database.runAsync(
        `UPDATE health_records
     SET date = ?, steps = ?, calories = ?, water = ?
     WHERE id = ?;`,
        record.date,
        record.steps,
        record.calories,
        record.water,
        id
    );
}

// Delete a health record
export async function deleteHealthRecord(database, id) {
    return await database.runAsync(
        'DELETE FROM health_records WHERE id = ?;',
        id
    );
}
