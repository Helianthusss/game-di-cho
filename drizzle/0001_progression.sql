ALTER TABLE players ADD COLUMN xp INTEGER NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE players ADD COLUMN jobs INTEGER NOT NULL DEFAULT 0;
--> statement-breakpoint
UPDATE players SET xp=80,jobs=1 WHERE completed=1;
--> statement-breakpoint
DROP TRIGGER rent_check;
--> statement-breakpoint
DROP TRIGGER rent_charge;
--> statement-breakpoint
CREATE TRIGGER rent_check BEFORE INSERT ON shops BEGIN SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM players WHERE public_id=NEW.owner AND xp>=200 AND jobs>=3) THEN RAISE(ABORT,'Cần cấp 3 và hoàn thành 3 nhiệm vụ để mua sạp') END; SELECT CASE WHEN (SELECT coins FROM players WHERE public_id=NEW.owner)<250 THEN RAISE(ABORT,'Cần tích đủ 250K: mua sạp 200K và giữ 50K vốn') END; END;
--> statement-breakpoint
CREATE TRIGGER rent_charge AFTER INSERT ON shops BEGIN UPDATE players SET coins=coins-200 WHERE public_id=NEW.owner; END;
