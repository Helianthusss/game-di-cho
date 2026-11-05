# Chợ Bình An — hướng nâng cấp

## Mục tiêu

Người chơi cảm nhận một khu chợ có hoạt động, rồi đi từ khách mua lẻ tới người vận chuyển, chủ sạp và người quản lý vựa. Bản đồ lớn phải tạo ra tuyến mua bán và giao hàng, thay vì chỉ kéo dài quãng đường.

## Lượt nâng cấp hiện tại

- Bảng hiệu có hai mặt chữ đọc đúng, không còn nhìn xuyên mặt sau bị lật chữ.
- NPC khách có tuyến ghé sạp, dừng hỏi hàng rồi tiếp tục đi; tách biệt với người chơi online.
- Người bán trong nhà lồng, xe đẩy và người mang kiện ở khu kho.
- Hai mức mật độ NPC, có lựa chọn nhẹ máy; âm thanh nền tổng hợp chỉ bật khi người chơi chọn.
- Khách gia đình, quán bún, bếp cơm và nhà hàng có nhu cầu và ngân sách khác nhau. Giá bán và tồn kho quyết định khả năng nhận đơn. Hiển thị lãi gộp mỗi bó trước các chi phí khác.

## Các bước tiếp theo được đề xuất — chưa triển khai

1. **Kinh tế theo mặt hàng:** nhập rau, trái cây và gia vị theo thùng; đơn vị thùng/kg/bó rõ ràng; hàng tồn, hạn tươi, hao hụt và báo cáo lãi ròng. Cần mô phỏng cân bằng trước khi áp dụng vào tài khoản thật.
2. **Nhà lồng có chức năng riêng:** mua sỉ tại từng vựa, chọn nhà cung cấp, so giá theo phiên và tự chở về sạp. Chuyển điều kiện giao dịch từ bảng chung sang vị trí sạp cụ thể.
3. **Chuỗi nghề nghiệp:** mua lẻ → phụ giao hàng → xe đẩy → sạp nhỏ → kho → nhân viên → xe tải. Mỗi mốc mở một cách chơi mới, không chỉ tăng chỉ số.
4. **Sự kiện ảnh hưởng việc chơi:** xe hàng tới, mưa làm chậm giao, đơn quán ăn giờ cao điểm, hàng cuối buổi giảm giá. Mỗi sự kiện phải được máy chủ xác nhận và có thời hạn rõ ràng.
5. **Hợp tác giữa người thật:** đơn đặt hàng có mã, hợp đồng vận chuyển, giao nhận và thanh toán nguyên tử; đánh giá giao dịch đã hoàn thành. Hiện presence vẫn dùng polling; cần thử tải trước khi chuyển sang phòng WebSocket.
6. **Nâng chất lượng hình ảnh và trải nghiệm:** mô hình riêng cho hàng hóa và nhân vật, hoạt ảnh bốc/đặt/cân hàng, tối ưu instancing/LOD, thiết lập đồ họa và hướng dẫn đầu game ngắn.

## Cách đánh giá

- Người mới hoàn thành đơn đầu mà không cần giải thích ngoài game.
- Một quyết định về chất lượng, giá hoặc tuyến giao có kết quả thấy được.
- Khu dân sinh, nhà lồng và kho đều có lý do để quay lại.
- Không nhân đôi tiền/hàng khi nhấn lặp hoặc mất kết nối.
- Đo hiệu năng trên điện thoại trước khi tăng thêm mật độ cảnh.
