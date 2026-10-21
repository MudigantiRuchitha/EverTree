
require("dotenv").config();
const { Client } = require("pg");

const source = new Client({
  host: process.env.PGHOST || "localhost",
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE || "evertree",
});

const destination = new Client({
  host: process.env.NEON_PGHOST,
  port: Number(process.env.NEON_PGPORT || 5432),
  user: process.env.NEON_PGUSER,
  password: process.env.NEON_PGPASSWORD,
  database: process.env.NEON_PGDATABASE || "evertree",
  ssl: { rejectUnauthorized: false },
});

async function migrateTable(table, preferredColumns) {
  const sourceColumns = await source.query(
    `SELECT column_name FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1`,
    [table]
  );

  const destinationColumns = await destination.query(
    `SELECT column_name FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1`,
    [table]
  );

  const sourceNames = sourceColumns.rows.map(r => r.column_name);
  const destinationNames = new Set(
    destinationColumns.rows.map(r => r.column_name)
  );

  const columns = preferredColumns.filter(
    c => sourceNames.includes(c) && destinationNames.has(c)
  );

  if (!columns.includes("id")) {
    throw new Error(`Cannot safely migrate ${table}: no shared id column`);
  }

  const { rows } = await source.query(
    `SELECT ${columns.map(c => `"${c}"`).join(", ")}
     FROM public."${table}" ORDER BY id`
  );

  let inserted = 0;
  for (const row of rows) {
    const names = columns.map(c => `"${c}"`).join(", ");
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");
    const updates = columns
      .filter(c => c !== "id")
      .map(c => `"${c}" = EXCLUDED."${c}"`)
      .join(", ");

    const sql = `
      INSERT INTO public."${table}" (${names})
      VALUES (${placeholders})
      ON CONFLICT (id) DO NOTHING
    `;

    await destination.query(sql, columns.map(c => row[c]));
    inserted++;
  }

  console.log(`${table}: processed ${inserted} source records`);
}

async function main() {
  if (!process.env.NEON_PGHOST ||
      !process.env.NEON_PGUSER ||
      !process.env.NEON_PGPASSWORD) {
    throw new Error("Set the NEON_PGHOST, NEON_PGUSER and NEON_PGPASSWORD variables first.");
  }

  await source.connect();
  await destination.connect();

  try {
    await destination.query("BEGIN");

    await migrateTable("users", [
      "id", "name", "email", "password_hash", "role", "phone",
      "verification_id", "phone_verified", "email_verified",
      "approval_status", "govt_id_type", "govt_id_number",
      "rera_number", "agency_license", "ownership_proof_ref",
      "avatar_url", "created_at"
    ]);

    await migrateTable("properties", [
      "id", "title", "description", "category", "property_type",
      "bhk", "price", "city", "district", "address", "latitude",
      "longitude", "seller_id", "is_featured", "views_count",
      "created_at"
    ]);

    await migrateTable("property_media", [
      "id", "property_id", "file_url", "media_url", "media_type"
    ]);

    await destination.query("COMMIT");

    console.log("Migration completed.");
  } catch (error) {
    await destination.query("ROLLBACK");
    throw error;
  }
}

main()
  .catch(error => {
    console.error("Migration failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await Promise.allSettled([
      source.end(),
      destination.end()
    ]);
  });
