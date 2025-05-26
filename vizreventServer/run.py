from app import create_app
import os
import webbrowser
from threading import Timer

app = create_app()


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    
    # Only open browser if DEV_MODE is not set to true
    dev_mode = os.environ.get("DEV_MODE", "false").lower() == "true"
    if not dev_mode:
        Timer(1.0, lambda: webbrowser.open(f"http://127.0.0.1:{port}")).start()
    
    app.run(host="0.0.0.0", port=port)
