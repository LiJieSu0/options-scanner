#!/usr/bin/env python3
"""
Options Scanner API
"""

import os
from flask import Flask, jsonify, request
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

ALPHA_VANTAGE_KEY = "Y30JW23SBXB0C7PE"


@app.route("/")
def root():
    return jsonify({"status": "ok"})


@app.route("/api/stock")
def stock():
    s = request.args.get("symbol", "")
    if not s:
        return jsonify({"error": "need symbol"}), 400
    
    try:
        r = requests.get(f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={s}&apikey={ALPHA_VANTAGE_KEY}", timeout=10)
        data = r.json()
        q = data.get("Global Quote", {})
        if not q:
            return jsonify({"error": f"not found: {s}"}), 404
        return jsonify({
            "symbol": q.get("01. symbol", s),
            "currentPrice": float(q.get("05. price", 0)),
            "change": float(q.get("09. change", 0)),
            "changePercent": float(q.get("10. change percent", "0").replace("%", "")),
            "previousClose": float(q.get("08. previous close", 0)),
            "volume": int(q.get("06. volume", 0)),
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/options")
def options():
    return jsonify({"calls": [], "puts": [], "expirationDates": []})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 10000)))
