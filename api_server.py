#!/usr/bin/env python3
"""
Options Scanner API - Using Alpha Vantage (free, reliable!)
"""

import os
from flask import Flask, jsonify, request
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

# Alpha Vantage free API key
ALPHA_VANTAGE_KEY = os.environ.get("ALPHA_VANTAGE_KEY", "Y30JW23SBXB0C7PE")


@app.route("/", methods=["GET"])
def root():
    return jsonify({"status": "ok", "message": "Options Scanner API running"})


@app.route("/api/stock", methods=["GET"])
def stock_endpoint():
    symbol = request.args.get("symbol", "").upper()
    
    if not symbol:
        return jsonify({"error": "Symbol is required"}), 400
    
    try:
        # Get quote
        url = f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey={ALPHA_VANTAGE_KEY}"
        resp = requests.get(url, timeout=10)
        data = resp.json()
        
        quote = data.get("Global Quote", {})
        if not quote or not quote.get("05. price"):
            return jsonify({"error": f"Symbol {symbol} not found. Try AAPL, TSLA, IBM"}), 404
        
        return jsonify({
            "symbol": quote.get("01. symbol", symbol),
            "currentPrice": float(quote.get("05. price", 0)),
            "change": float(quote.get("09. change", 0)),
            "changePercent": float(quote.get("10. change percent", "0").replace("%", "")),
            "previousClose": float(quote.get("08. previous close", 0)),
            "name": symbol,
            "marketCap": 0,
            "volume": int(quote.get("06. volume", 0)),
        })
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/options", methods=["GET"])
def options_endpoint():
    # Alpha Vantage doesn't have options in free tier
    symbol = request.args.get("symbol", "").upper()
    return jsonify({
        "calls": [],
        "puts": [],
        "underlyingPrice": 0,
        "symbol": symbol,
        "expirationDates": [],
        "note": "Options require Alpha Vantage Premium"
    })


@app.route("/api/expirations", methods=["GET"])
def expirations_endpoint():
    return jsonify({"symbol": "", "expirations": []})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    print(f"Starting Options Scanner API on port {port}")
    app.run(host="0.0.0.0", port=port, debug=False)
