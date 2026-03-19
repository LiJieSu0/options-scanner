#!/usr/bin/env python3
"""
Options Scanner API - Using defeatbeta-api (no rate limits!)
"""

import os
import sys

# Suppress the welcome message
os.environ['DEFEATBETA_QUIET'] = '1'

from flask import Flask, jsonify, request
from flask_cors import CORS

# Import defeatbeta
try:
    from defeatbeta_api import DefeatBeta
    db = DefeatBeta()
    DEFEATBETA_AVAILABLE = True
except Exception as e:
    print(f"Failed to import defeatbeta: {e}")
    DEFEATBETA_AVAILABLE = False

app = Flask(__name__)
CORS(app)

@app.route("/", methods=["GET"])
def root():
    if DEFEATBETA_AVAILABLE:
        return jsonify({"status": "ok", "message": "Options Scanner API with defeatbeta is running"})
    return jsonify({"status": "error", "message": "defeatbeta not available"})


@app.route("/api/stock", methods=["GET"])
def stock_endpoint():
    symbol = request.args.get("symbol", "").upper()
    
    if not symbol:
        return jsonify({"error": "Symbol is required"}), 400
    
    if not DEFEATBETA_AVAILABLE:
        return jsonify({"error": "defeatbeta not available"}), 500
    
    try:
        data = db.ticker(symbol.upper())
        
        if data is None or (hasattr(data, 'empty') and data.empty):
            return jsonify({"error": f"Symbol {symbol} not found"}), 404
        
        # Get current price from the data
        current_price = 0
        if hasattr(data, 'Close') and len(data['Close']) > 0:
            current_price = float(data['Close'].iloc[-1])
        
        return jsonify({
            "symbol": symbol.upper(),
            "currentPrice": current_price,
            "change": 0,
            "changePercent": 0,
            "previousClose": current_price,
            "name": symbol.upper(),
            "marketCap": 0,
            "volume": 0,
        })
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/options", methods=["GET"])
def options_endpoint():
    # defeatbeta doesn't have options data, return empty
    symbol = request.args.get("symbol", "").upper()
    return jsonify({
        "calls": [],
        "puts": [],
        "underlyingPrice": 0,
        "symbol": symbol,
        "expirationDates": [],
        "note": "Options data not available with defeatbeta"
    })


@app.route("/api/expirations", methods=["GET"])
def expirations_endpoint():
    symbol = request.args.get("symbol", "").upper()
    return jsonify({
        "symbol": symbol,
        "expirations": []
    })


if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 10000))
    print(f"Starting Options Scanner API on port {port}")
    print(f"defeatbeta available: {DEFEATBETA_AVAILABLE}")
    app.run(host="0.0.0.0", port=port, debug=False)
