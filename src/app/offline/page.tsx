import { Heart, WifiOff, RefreshCw } from "lucide-react";

export default function OfflinePage() {
    const handleRetry = () => {
        window.location.reload();
    };

    return (
        <html lang="vi">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>Offline - Love Memories</title>
                <style>{`
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #fff0f5 0%, #ffe4f0 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .container {
            text-align: center;
            padding: 2rem;
            max-width: 400px;
          }
          .icon-container {
            position: relative;
            display: inline-block;
            margin-bottom: 2rem;
          }
          .heart {
            width: 80px;
            height: 80px;
            fill: url(#gradient);
            filter: drop-shadow(0 4px 6px rgba(236, 72, 153, 0.2));
          }
          .wifi-off {
            position: absolute;
            bottom: -5px;
            right: -5px;
            width: 40px;
            height: 40px;
            background: white;
            border-radius: 50%;
            padding: 8px;
            stroke: #ef4444;
          }
          h1 {
            font-size: 2rem;
            font-weight: bold;
            background: linear-gradient(135deg, #ec4899, #f472b6, #c026d3);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin: 0 0 1rem 0;
          }
          p {
            color: #666;
            margin: 0 0 2rem 0;
            line-height: 1.6;
          }
          button {
            background: linear-gradient(135deg, #ec4899, #f472b6);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 4px 12px rgba(236, 72, 153, 0.3);
            transition: all 0.3s ease;
          }
          button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(236, 72, 153, 0.4);
          }
          .features {
            margin-top: 3rem;
            padding-top: 2rem;
            border-top: 1px solid rgba(236, 72, 153, 0.1);
          }
          .feature {
            color: #999;
            font-size: 0.875rem;
            margin: 0.5rem 0;
          }
        `}</style>
            </head>
            <body>
                <div className="container">
                    <div className="icon-container">
                        <svg className="heart" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style={{ stopColor: "#ec4899" }} />
                                    <stop offset="50%" style={{ stopColor: "#f472b6" }} />
                                    <stop offset="100%" style={{ stopColor: "#c026d3" }} />
                                </linearGradient>
                            </defs>
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        <WifiOff className="wifi-off" />
                    </div>

                    <h1>Không có kết nối</h1>
                    <p>
                        Bạn đang ngoại tuyến. Một số nội dung có thể không khả dụng khi không có kết nối internet.
                        Vui lòng kiểm tra kết nối mạng và thử lại.
                    </p>

                    <button onClick={handleRetry}>
                        <RefreshCw size={20} />
                        Thử lại
                    </button>

                    <div className="features">
                        <div className="feature">💡 Nội dung đã xem trước đó vẫn có thể truy cập</div>
                        <div className="feature">📱 Ứng dụng sẽ tự động đồng bộ khi có mạng</div>
                    </div>
                </div>
            </body>
        </html>
    );
}
