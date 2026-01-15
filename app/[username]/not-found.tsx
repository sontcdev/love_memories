import { Metadata } from 'next';

export const metadata: Metadata = {
    title: '404 - Không tìm thấy',
    description: 'Trang không tồn tại',
};

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">
            <div className="text-center px-4">
                <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                    404
                </h1>
                <h2 className="text-3xl font-semibold text-gray-800 mt-4 mb-2">
                    Không tìm thấy trang
                </h2>
                <p className="text-gray-600 mb-8">
                    Trang kỷ niệm này không tồn tại hoặc đã bị xóa
                </p>
                <a
                    href="/"
                    className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full hover:shadow-lg transition-all"
                >
                    Về trang chủ
                </a>
            </div>
        </div>
    );
}
