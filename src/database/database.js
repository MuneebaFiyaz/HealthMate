
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

    CREATE TABLE IF NOT EXISTS healthmate_migrations (
      name TEXT PRIMARY KEY
    );
  `);

  // Renumber existing records only once.
  const migration = await database.getFirstAsync(
    'SELECT name FROM healthmate_migrations WHERE name = ?;',
    'record_ids_rearranged'
  );

  if (!migration) {
    const existingRecords = await database.getAllAsync(
      'SELECT id, date FROM health_records ORDER BY date ASC, id ASC;'
    );

    if (existingRecords.length > 0) {
      const maxId = Math.max(
        ...existingRecords.map((record) => record.id)
      );

      // Move existing IDs temporarily to avoid duplicate IDs.
      const offset = maxId + existingRecords.length + 1;

      try {
        await database.execAsync('BEGIN TRANSACTION;');

        await database.runAsync(
          'UPDATE health_records SET id = id + ?;',
          offset
        );

        // Assign new IDs starting from 1.
        for (let index = 0; index < existingRecords.length; index++) {
          const oldId = existingRecords[index].id;
          const newId = index + 1;

          await database.runAsync(
            'UPDATE health_records SET id = ? WHERE id = ?;',
            newId,
            oldId + offset
          );
        }

        // Reset SQLite's AUTOINCREMENT sequence.
        await database.runAsync(
          "DELETE FROM sqlite_sequence WHERE name = 'health_records';"
        );

        await database.runAsync(
          'INSERT INTO healthmate_migrations (name) VALUES (?);',
          'record_ids_rearranged'
        );

        await database.execAsync('COMMIT;');
      } catch (error) {
        await database.execAsync('ROLLBACK;');
        throw error;
      }
    } else {
      await database.runAsync(
        'INSERT INTO healthmate_migrations (name) VALUES (?);',
        'record_ids_rearranged'
      );
    }
  }

  // Insert sample records only when the database is empty.
  const { count } = await database.getFirstAsync(
    'SELECT COUNT(*) AS count FROM health_records;'
  );

  if (count === 0) {
    const today = new Date();

    const dummyRecords = [
      { offset: 6, steps: 1850, calories: 320, water: 1800 },
      { offset: 5, steps: 2600, calories: 460, water: 2200 },
      { offset: 4, steps: 2100, calories: 380, water: 2000 },
      { offset: 3, steps: 3100, calories: 520, water: 2700 },
      { offset: 2, steps: 2450, calories: 430, water: 2350 },
      { offset: 1, steps: 2800, calories: 490, water: 2600 },
      { offset: 0, steps: 1950, calories: 350, water: 2100 },
    ];

    for (const record of dummyRecords) {
      const date = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - record.offset
      );

      const dateKey = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0'),
      ].join('-');

      await database.runAsync(
        `INSERT INTO health_records (date, steps, calories, water)
         VALUES (?, ?, ?, ?);`,
        dateKey,
        record.steps,
        record.calories,
        record.water
      );
    }
  }

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

// Get health records for a selected date
export async function getHealthRecordsByDate(database, date) {
  return await database.getAllAsync(
    'SELECT * FROM health_records WHERE date = ? ORDER BY id DESC;',
    date
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
