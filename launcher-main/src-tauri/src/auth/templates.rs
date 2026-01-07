/// HTML шаблон для успешной OAuth авторизации
pub fn success_page() -> &'static str {
    r#"
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Login Successful</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #000000;
            color: #ffffff;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            overflow: hidden;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            user-select: none;
        }
        .snowfall { position: fixed; inset: 0; width: 100vw; height: 100vh; pointer-events: none; z-index: 900; }
        .snowfall__flake { position: absolute; top: -10vh; left: var(--snow-left); width: var(--snow-size); height: var(--snow-size); opacity: var(--snow-opacity); animation: snowfall-fall var(--snow-duration) linear var(--snow-delay) infinite; }
        .snowfall__flakeInner { display: block; width: 100%; height: 100%; border-radius: 9999px; background: rgba(255, 255, 255, 0.95); filter: blur(var(--snow-blur)); box-shadow: 0 0 6px rgba(255, 255, 255, 0.25); animation: snowfall-sway calc(var(--snow-duration) * 0.65) ease-in-out var(--snow-delay) infinite alternate; }
        @keyframes snowfall-fall { from { transform: translate3d(0, -10vh, 0); } to { transform: translate3d(0, 120vh, 0); } }
        @keyframes snowfall-sway { from { transform: translate3d(0, 0, 0); } to { transform: translate3d(var(--snow-sway), 0, 0); } }
        
        .container { position: relative; display: flex; flex-direction: column; align-items: center; z-index: 10; }
        .glow { position: absolute; width: 600px; height: 600px; background: radial-gradient(circle, rgba(34, 197, 94, 0.15) 0%, rgba(0, 0, 0, 0) 70%); top: 50%; left: 50%; transform: translate(-50%, -50%); pointer-events: none; z-index: 0; }
        h1 { font-size: 12rem; font-weight: 900; margin: 0; line-height: 1; background: linear-gradient(135deg, #fff 0%, #4ade80 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; filter: drop-shadow(0 0 30px rgba(34, 197, 94, 0.2)); letter-spacing: -0.05em; }
        p { font-size: 2rem; font-weight: 500; margin-top: 1rem; color: #86efac; }
        .btn { margin-top: 2rem; padding: 12px 32px; font-size: 1.1rem; background-color: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; color: white; cursor: pointer; transition: all 0.2s ease; backdrop-filter: blur(10px); }
        .btn:hover { background-color: rgba(255, 255, 255, 0.2); transform: translateY(-2px); }
    </style>
</head>
<body>
    <div class="snowfall" id="snowfall"></div>
    <div class="glow"></div>
    <div class="container">
        <h1>200</h1>
        <p>Successful</p>
        <button class="btn" onclick="closeWindow()">Закрыть</button>
    </div>
    <script>
        const snowfall = document.getElementById('snowfall');
        const count = 60;
        const rand = (min, max) => min + Math.random() * (max - min);
        for (let i = 0; i < count; i++) {
            const flake = document.createElement('span');
            flake.className = 'snowfall__flake';
            const inner = document.createElement('span');
            inner.className = 'snowfall__flakeInner';
            flake.appendChild(inner);
            flake.style.setProperty('--snow-left', rand(0, 100) + 'vw');
            flake.style.setProperty('--snow-size', rand(2, 6) + 'px');
            flake.style.setProperty('--snow-opacity', rand(0.25, 0.9));
            flake.style.setProperty('--snow-blur', rand(0, 1.2) + 'px');
            flake.style.setProperty('--snow-duration', rand(7, 15) + 's');
            flake.style.setProperty('--snow-delay', rand(-15, 0) + 's');
            flake.style.setProperty('--snow-sway', rand(8, 40) + 'px');
            snowfall.appendChild(flake);
        }
        
        function closeWindow() {
            try {
                // Try Tauri API first
                if (window.__TAURI__ && window.__TAURI__.window) {
                    window.__TAURI__.window.getCurrent().close();
                } else {
                    // Fallback for web view
                    window.close();
                    // If window.close() doesn't work, try to redirect to about:blank
                    setTimeout(() => {
                        window.location.href = 'about:blank';
                    }, 100);
                }
            } catch (error) {
                console.error('Error closing window:', error);
                window.close();
            }
        }
        
        // Auto-close after 3 seconds as backup
        setTimeout(() => {
            closeWindow();
        }, 3000);
    </script>
</body>
</html>
"#
}
