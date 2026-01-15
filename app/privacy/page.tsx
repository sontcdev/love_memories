export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
            <div className="container mx-auto px-4 py-16 max-w-4xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                        Chính Sách Bảo Mật
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
                    </p>
                </div>

                {/* Content */}
                <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 space-y-8">
                    {/* Introduction */}
                    <section>
                        <p className="text-gray-700 leading-relaxed text-lg">
                            Chào mừng bạn đến với <span className="font-semibold text-purple-600">Kỷ Niệm Số</span>.
                            Chúng tôi cam kết bảo vệ quyền riêng tư và dữ liệu cá nhân của bạn.
                            Chính sách này giải thích cách chúng tôi thu thập, sử dụng và bảo vệ thông tin của bạn.
                        </p>
                    </section>

                    {/* Section 1: Data Collection */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="text-purple-600">1.</span>
                            Dữ Liệu Chúng Tôi Thu Thập
                        </h2>
                        <div className="space-y-4 text-gray-700 leading-relaxed">
                            <p>
                                Chúng tôi chỉ thu thập các thông tin mà bạn chủ động cung cấp, bao gồm:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong>Ảnh và Video:</strong> Những tệp tin bạn tải lên để lưu giữ kỷ niệm</li>
                                <li><strong>Văn bản:</strong> Các lời nhắn, câu hỏi, câu trả lời mà bạn tạo</li>
                                <li><strong>Thông tin cài đặt:</strong> Tên, ngày kỷ niệm, ghi chú ngắn</li>
                                <li><strong>Mật khẩu bảo vệ:</strong> Được mã hóa và lưu trữ an toàn</li>
                            </ul>
                            <div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded-r-lg mt-4">
                                <p className="text-purple-900 font-medium">
                                    ✓ Chúng tôi KHÔNG thu thập dữ liệu cá nhân nhạy cảm như số điện thoại, email, hoặc thẻ tín dụng.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Purpose */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="text-purple-600">2.</span>
                            Mục Đích Sử Dụng
                        </h2>
                        <div className="space-y-4 text-gray-700 leading-relaxed">
                            <p>
                                Dữ liệu của bạn được sử dụng <strong>duy nhất</strong> cho các mục đích sau:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Hiển thị trang kỷ niệm số cá nhân của bạn</li>
                                <li>Lưu trữ và quản lý các nội dung bạn tạo</li>
                                <li>Đảm bảo tính năng bảo mật trang của bạn</li>
                                <li>Cải thiện trải nghiệm người dùng</li>
                            </ul>
                            <p className="font-semibold text-purple-600 mt-4">
                                Chúng tôi KHÔNG sử dụng dữ liệu của bạn cho bất kỳ mục đích marketing hay thương mại nào khác.
                            </p>
                        </div>
                    </section>

                    {/* Section 3: Security */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="text-purple-600">3.</span>
                            Bảo Mật Dữ Liệu
                        </h2>
                        <div className="space-y-4 text-gray-700 leading-relaxed">
                            <p>
                                Chúng tôi áp dụng các biện pháp bảo mật tiên tiến để bảo vệ dữ liệu của bạn:
                            </p>
                            <div className="grid md:grid-cols-2 gap-4 mt-4">
                                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                                    <h3 className="font-semibold text-green-800 mb-2">🔐 Mã Hóa</h3>
                                    <p className="text-sm text-green-700">
                                        Mật khẩu và PIN được mã hóa bằng thuật toán bcrypt chuẩn công nghiệp
                                    </p>
                                </div>
                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                                    <h3 className="font-semibold text-blue-800 mb-2">🛡️ RLS Policies</h3>
                                    <p className="text-sm text-blue-700">
                                        Row Level Security đảm bảo chỉ chủ sở hữu mới có thể chỉnh sửa dữ liệu
                                    </p>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                                    <h3 className="font-semibold text-purple-800 mb-2">☁️ Cloud Storage</h3>
                                    <p className="text-sm text-purple-700">
                                        Lưu trữ trên Supabase - nền tảng đám mây có chứng nhận bảo mật
                                    </p>
                                </div>
                                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                                    <h3 className="font-semibold text-amber-800 mb-2">🔒 HTTPS</h3>
                                    <p className="text-sm text-amber-700">
                                        Tất cả dữ liệu truyền tải được mã hóa qua HTTPS/TLS
                                    </p>
                                </div>
                            </div>
                            <p className="text-gray-600 italic mt-4">
                                Lưu ý: Bạn có trách nhiệm giữ bí mật PIN/mật khẩu của mình.
                                Chúng tôi không thể khôi phục mật khẩu nếu bạn quên.
                            </p>
                        </div>
                    </section>

                    {/* Section 4: Data Deletion */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="text-purple-600">4.</span>
                            Xóa Dữ Liệu
                        </h2>
                        <div className="space-y-4 text-gray-700 leading-relaxed">
                            <p>
                                Bạn có <strong>toàn quyền kiểm soát</strong> dữ liệu của mình:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Bạn có thể xóa từng ảnh, lời nhắn, câu hỏi bất kỳ lúc nào</li>
                                <li>Bạn có thể yêu cầu xóa vĩnh viễn toàn bộ trang của mình</li>
                                <li>Sau khi xóa, dữ liệu sẽ được gỡ bỏ hoàn toàn khỏi hệ thống</li>
                            </ul>
                            <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 mt-4">
                                <p className="text-amber-900">
                                    <strong>Cách yêu cầu xóa toàn bộ:</strong> Liên hệ bộ phận hỗ trợ với username của bạn.
                                    Chúng tôi sẽ xử lý trong vòng 48 giờ.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 5: Third-Party */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="text-purple-600">5.</span>
                            Chia Sẻ Với Bên Thứ Ba
                        </h2>
                        <div className="space-y-4 text-gray-700 leading-relaxed">
                            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-xl">
                                <p className="text-xl font-bold text-red-900 mb-2">
                                    ❌ Chúng tôi KHÔNG bao giờ bán dữ liệu của bạn
                                </p>
                                <p className="text-red-800">
                                    Dữ liệu của bạn là của bạn. Chúng tôi không chia sẻ, bán, hoặc
                                    trao đổi thông tin cá nhân của bạn với bất kỳ đơn vị quảng cáo
                                    hoặc bên thứ ba nào.
                                </p>
                            </div>
                            <p>
                                <strong>Ngoại lệ duy nhất:</strong> Chúng tôi sử dụng các dịch vụ sau để vận hành:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong>Supabase:</strong> Lưu trữ cơ sở dữ liệu và file (tuân thủ GDPR)</li>
                                <li><strong>Vercel:</strong> Hosting website (tuân thủ GDPR)</li>
                                <li><strong>Sentry:</strong> Theo dõi lỗi kỹ thuật (không chứa dữ liệu cá nhân)</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 6: Cookies */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="text-purple-600">6.</span>
                            Cookies và Lưu Trữ Cục Bộ
                        </h2>
                        <div className="space-y-4 text-gray-700 leading-relaxed">
                            <p>
                                Chúng tôi sử dụng cookies và sessionStorage chỉ để:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Duy trì trạng thái đăng nhập trong phiên làm việc</li>
                                <li>Lưu tạm các thiết lập giao diện (theme color)</li>
                            </ul>
                            <p className="text-gray-600 italic">
                                Cookies này sẽ tự động xóa khi bạn đóng trình duyệt.
                            </p>
                        </div>
                    </section>

                    {/* Section 7: Children */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="text-purple-600">7.</span>
                            Quyền Riêng Tư Trẻ Em
                        </h2>
                        <div className="space-y-4 text-gray-700 leading-relaxed">
                            <p>
                                Dịch vụ của chúng tôi dành cho người dùng từ <strong>13 tuổi trở lên</strong>.
                                Chúng tôi không cố ý thu thập thông tin từ trẻ em dưới 13 tuổi.
                            </p>
                        </div>
                    </section>

                    {/* Section 8: Updates */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="text-purple-600">8.</span>
                            Cập Nhật Chính Sách
                        </h2>
                        <div className="space-y-4 text-gray-700 leading-relaxed">
                            <p>
                                Chúng tôi có thể cập nhật chính sách này theo thời gian.
                                Mọi thay đổi quan trọng sẽ được thông báo trước qua:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Hiển thị thông báo trên trang chủ</li>
                                <li>Cập nhật ngày "Cập nhật lần cuối" ở đầu trang này</li>
                            </ul>
                        </div>
                    </section>

                    {/* Contact */}
                    <section className="bg-gradient-to-r from-purple-50 to-pink-50 p-8 rounded-2xl border-2 border-purple-200">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            📧 Liên Hệ
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            Nếu bạn có bất kỳ câu hỏi nào về chính sách bảo mật này, vui lòng liên hệ:
                        </p>
                        <div className="mt-4 space-y-2 text-gray-700">
                            <p><strong>Email:</strong> privacy@kyniemso.com</p>
                            <p><strong>Địa chỉ:</strong> [Địa chỉ văn phòng của bạn]</p>
                        </div>
                    </section>

                    {/* Summary Box */}
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 rounded-2xl text-white">
                        <h3 className="text-2xl font-bold mb-4">Tóm Tắt</h3>
                        <ul className="space-y-2">
                            <li className="flex items-start gap-2">
                                <span>✓</span>
                                <span>Chỉ lưu trữ dữ liệu bạn tải lên</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span>✓</span>
                                <span>Bảo vệ bằng mã hóa và RLS</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span>✓</span>
                                <span>Không bán dữ liệu cho bên thứ ba</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span>✓</span>
                                <span>Bạn có quyền xóa bất cứ lúc nào</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-12">
                    <a
                        href="/"
                        className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transition-shadow"
                    >
                        ← Quay về trang chủ
                    </a>
                </div>
            </div>
        </div>
    );
}
