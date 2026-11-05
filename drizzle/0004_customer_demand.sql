DROP TRIGGER customer_check;
--> statement-breakpoint
CREATE TRIGGER customer_check BEFORE INSERT ON customer_sales BEGIN SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM shops WHERE owner=NEW.owner AND stock>=NEW.quantity AND price*NEW.quantity=NEW.total AND price<=CASE (CAST(NEW.created/90000 AS INTEGER)%4) WHEN 0 THEN 9 WHEN 1 THEN 12 WHEN 2 THEN 10 ELSE 15 END) THEN RAISE(ABORT,'Khách chưa chấp nhận giá hoặc sạp chưa đủ hàng') END; END;
