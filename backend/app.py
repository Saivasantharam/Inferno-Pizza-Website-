
from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/")
def home():
    return jsonify({
        "message": "Welcome to Inferno Pizza Backend!"
    })

@app.route("/api/health")
def health():
    return jsonify({
        "status": "success",
        "message": "Inferno Pizza API is running!"
    })

if __name__ == "__main__":
    app.run(debug=True)
