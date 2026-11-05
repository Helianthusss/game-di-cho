ALTER TABLE players ADD COLUMN haul_active INTEGER NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE players ADD COLUMN haul_last INTEGER NOT NULL DEFAULT 0;
