CREATE TABLE players (id TEXT PRIMARY KEY, public_id TEXT NOT NULL UNIQUE, name TEXT NOT NULL DEFAULT 'Khách đi chợ', coins INTEGER NOT NULL DEFAULT 150 CHECK(coins >= 0), bag INTEGER NOT NULL DEFAULT 0, bargains INTEGER NOT NULL DEFAULT 0, completed INTEGER NOT NULL DEFAULT 0, goods INTEGER NOT NULL DEFAULT 0, x REAL NOT NULL DEFAULT 800, y REAL NOT NULL DEFAULT 650, seen INTEGER NOT NULL DEFAULT 0);
--> statement-breakpoint
CREATE TABLE shops (owner TEXT PRIMARY KEY REFERENCES players(public_id), name TEXT NOT NULL, stock INTEGER NOT NULL DEFAULT 0 CHECK(stock >= 0), price INTEGER NOT NULL DEFAULT 8 CHECK(price BETWEEN 5 AND 20));
--> statement-breakpoint
CREATE TABLE trades (id TEXT PRIMARY KEY, buyer TEXT NOT NULL REFERENCES players(public_id), seller TEXT NOT NULL REFERENCES shops(owner), price INTEGER NOT NULL, created INTEGER NOT NULL);
--> statement-breakpoint
CREATE TRIGGER rent_check BEFORE INSERT ON shops BEGIN SELECT CASE WHEN (SELECT coins FROM players WHERE public_id=NEW.owner)<50 THEN RAISE(ABORT,'Không đủ 50K thuê sạp') END; END;
--> statement-breakpoint
CREATE TRIGGER rent_charge AFTER INSERT ON shops BEGIN UPDATE players SET coins=coins-50 WHERE public_id=NEW.owner; END;
--> statement-breakpoint
CREATE TRIGGER stock_check BEFORE UPDATE OF stock ON shops WHEN NEW.stock>OLD.stock BEGIN SELECT CASE WHEN (SELECT coins FROM players WHERE public_id=NEW.owner)<(NEW.stock-OLD.stock)*4 THEN RAISE(ABORT,'Không đủ tiền nhập hàng') END; END;
--> statement-breakpoint
CREATE TRIGGER stock_charge AFTER UPDATE OF stock ON shops WHEN NEW.stock>OLD.stock BEGIN UPDATE players SET coins=coins-(NEW.stock-OLD.stock)*4 WHERE public_id=NEW.owner; END;
--> statement-breakpoint
CREATE TRIGGER trade_check BEFORE INSERT ON trades BEGIN SELECT CASE WHEN NEW.buyer=NEW.seller THEN RAISE(ABORT,'Không thể mua sạp của mình') END; SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM shops WHERE owner=NEW.seller AND stock>0 AND price=NEW.price) THEN RAISE(ABORT,'Sạp hết hàng hoặc vừa đổi giá') END; SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM players WHERE public_id=NEW.buyer AND coins>=NEW.price) THEN RAISE(ABORT,'Không đủ tiền mua hàng') END; END;
--> statement-breakpoint
CREATE TRIGGER trade_apply AFTER INSERT ON trades BEGIN UPDATE players SET coins=coins-NEW.price,goods=goods+1 WHERE public_id=NEW.buyer; UPDATE players SET coins=coins+NEW.price WHERE public_id=NEW.seller; UPDATE shops SET stock=stock-1 WHERE owner=NEW.seller; END;
