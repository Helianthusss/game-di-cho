ALTER TABLE players ADD COLUMN task_type INTEGER NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE players ADD COLUMN quality_fresh INTEGER NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE players ADD COLUMN quality_cheap INTEGER NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE players ADD COLUMN spent INTEGER NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE players ADD COLUMN haggle_attempts INTEGER NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE players ADD COLUMN discounts TEXT NOT NULL DEFAULT '{}';
--> statement-breakpoint
CREATE TABLE customer_sales (ticket TEXT PRIMARY KEY, owner TEXT NOT NULL REFERENCES shops(owner), quantity INTEGER NOT NULL, total INTEGER NOT NULL, created INTEGER NOT NULL);
--> statement-breakpoint
CREATE TRIGGER customer_check BEFORE INSERT ON customer_sales BEGIN SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM shops WHERE owner=NEW.owner AND stock>=NEW.quantity AND price*NEW.quantity=NEW.total AND price<=12) THEN RAISE(ABORT,'Khách cần giá tối đa 12K và đủ hàng trong kho') END; END;
--> statement-breakpoint
CREATE TRIGGER customer_apply AFTER INSERT ON customer_sales BEGIN UPDATE shops SET stock=stock-NEW.quantity WHERE owner=NEW.owner; UPDATE players SET coins=coins+NEW.total,xp=xp+NEW.quantity*3 WHERE public_id=NEW.owner; END;
