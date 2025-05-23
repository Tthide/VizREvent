from app import create_app
import os
import webbrowser
from threading import Timer

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    Timer(1.0, lambda: webbrowser.open(f"http://127.0.0.1:{port}")).start()
    app.run(host="0.0.0.0", port=port)
