CREATE TABLE wholesale_shipments (
  id TEXT PRIMARY KEY,
  owner TEXT NOT NULL REFERENCES shops(owner),
  status INTEGER NOT NULL DEFAULT 0 CHECK(status IN (0,1,2))
);
--> statement-breakpoint
CREATE UNIQUE INDEX wholesale_active_owner ON wholesale_shipments(owner) WHERE status < 2;
--> statement-breakpoint
CREATE TRIGGER wholesale_charge AFTER INSERT ON wholesale_shipments
BEGIN
  UPDATE players SET coins=coins-30 WHERE public_id=NEW.owner AND coins>=30;
  SELECT CASE WHEN changes()=0 THEN RAISE(ABORT,'Không đủ 30K nhập lô sỉ') END;
END;
--> statement-breakpoint
DROP TRIGGER stock_check;
--> statement-breakpoint
DROP TRIGGER stock_charge;
--> statement-breakpoint
CREATE TRIGGER stock_check BEFORE UPDATE OF stock ON shops
WHEN NEW.stock>OLD.stock AND NOT EXISTS (SELECT 1 FROM wholesale_shipments WHERE owner=NEW.owner AND status=1)
BEGIN
  SELECT CASE WHEN (SELECT coins FROM players WHERE public_id=NEW.owner)<(NEW.stock-OLD.stock)*4 THEN RAISE(ABORT,'Không đủ tiền nhập hàng') END;
END;
--> statement-breakpoint
CREATE TRIGGER stock_charge AFTER UPDATE OF stock ON shops
WHEN NEW.stock>OLD.stock AND NOT EXISTS (SELECT 1 FROM wholesale_shipments WHERE owner=NEW.owner AND status=1)
BEGIN
  UPDATE players SET coins=coins-(NEW.stock-OLD.stock)*4 WHERE public_id=NEW.owner;
END;
--> statement-breakpoint
CREATE TRIGGER wholesale_unload AFTER UPDATE OF status ON wholesale_shipments
WHEN OLD.status=0 AND NEW.status=1
BEGIN
  UPDATE shops SET stock=stock+15 WHERE owner=NEW.owner AND stock<=85;
  SELECT CASE WHEN changes()=0 THEN RAISE(ABORT,'Cần 15 chỗ trống trong kho') END;
  UPDATE wholesale_shipments SET status=2 WHERE id=NEW.id;
END;
