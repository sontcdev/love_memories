"use client";

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
      </head>
      <body style={{
        margin: 0,
        padding: 0,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        background: 'linear-gradient(135deg, #fff0f5 0%, #ffe4f0 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          maxWidth: '400px'
        }}>
          <div style={{
            position: 'relative',
            display: 'inline-block',
            marginBottom: '2rem'
          }}>
            <svg style={{
              width: '80px',
              height: '80px',
              fill: 'url(#gradient)',
              filter: 'drop-shadow(0 4px 6px rgba(236, 72, 153, 0.2))'
            }} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: "#ec4899" }} />
                  <stop offset="50%" style={{ stopColor: "#f472b6" }} />
                  <stop offset="100%" style={{ stopColor: "#c026d3" }} />
                </linearGradient>
              </defs>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span style={{
              position: 'absolute',
              bottom: '0',
              right: '0',
              fontSize: '30px'
            }}>📡❌</span>
          </div>

          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #ec4899, #f472b6, #c026d3)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: '0 0 1rem 0'
          }}>
            Không có kết nối
          </h1>

          <p style={{
            color: '#666',
            margin: '0 0 2rem 0',
            lineHeight: 1.6
          }}>
            Bạn đang ngoại tuyến. Một số nội dung có thể không khả dụng khi không có kết nối internet.
            Vui lòng kiểm tra kết nối mạng và thử lại.
          </p>

          <button onClick={handleRetry} style={{
            background: 'linear-gradient(135deg, #ec4899, #f472b6)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)'
          }}>
            🔄 Thử lại
          </button>

          <div style={{
            marginTop: '3rem',
            paddingTop: '2rem',
            borderTop: '1px solid rgba(236, 72, 153, 0.1)'
          }}>
            <div style={{ color: '#999', fontSize: '0.875rem', margin: '0.5rem 0' }}>
              💡 Nội dung đã xem trước đó vẫn có thể truy cập
            </div>
            <div style={{ color: '#999', fontSize: '0.875rem', margin: '0.5rem 0' }}>
              📱 Ứng dụng sẽ tự động đồng bộ khi có mạng
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
