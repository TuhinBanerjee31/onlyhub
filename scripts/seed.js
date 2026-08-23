const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// Read .env.local or .env
function loadEnv() {
  const envFiles = [".env.local", ".env"];
  for (const file of envFiles) {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, "utf-8");
      content.split("\n").forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          const idx = trimmed.indexOf("=");
          if (idx !== -1) {
            const key = trimmed.slice(0, idx).trim();
            const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      });
    }
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in your .env / .env.local file.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log(`🔌 Testing connection to Supabase: ${supabaseUrl}`);
  const { data, error } = await supabase.from("hackathons").select("count", { count: "exact" });
  if (error) {
    console.error("❌ Connection failed or tables do not exist yet:", error.message);
    console.log("👉 Please make sure you have run the schema in supabase/schema.sql in your Supabase SQL Editor.");
    return false;
  }
  console.log(`✅ Connected successfully! Current hackathons in Supabase: ${data?.[0]?.count || 0}`);
  return true;
}

async function seed() {
  const connected = await testConnection();
  if (!connected) return;

  console.log("🚀 Syncing existing 161 hackathons to your Supabase database...");
  
  // Call the Next.js internal API or seed data
  try {
    const res = await fetch("http://localhost:3000/api/hackathons");
    const json = await res.json();
    if (json.data && json.data.length > 0) {
      const rows = json.data.map(h => ({
        id: h.id,
        title: h.title,
        platform: h.platform,
        mode: h.mode,
        start_date: h.startDate,
        end_date: h.endDate,
        display_dates: h.displayDates,
        image_url: h.imageUrl,
        url: h.url,
        description: h.description,
        short_description: h.shortDescription,
        tags: h.tags,
        prize_pool: h.prizePool || null,
        location: h.location || null,
        organizer: h.organizer || null,
        status: h.status,
        featured: h.featured || false,
        updated_at: new Date().toISOString()
      }));

      const { data, error } = await supabase.from("hackathons").upsert(rows, { onConflict: "url" }).select();
      if (error) {
        console.error("❌ Upsert failed:", error.message);
      } else {
        console.log(`🎉 Successfully seeded ${data.length} hackathons into Supabase!`);
      }
    }
  } catch (err) {
    console.error("Error during seeding:", err.message);
  }
}

seed();
