#!/usr/bin/env python3
"""
Options Scanner API - Using Finnhub free stock API
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import os

app = Flask(__name__)
CORS(app)

# Free Finnhub API key (demo key - limited)
FINNHUB_API_KEY = os.environ.get("FINNHUB_API_KEY", "ctq1hr01qt95e8or2q9gctq1hr01qt95e8or2qa0")


def get_stock_info(symbol: str):
    """Fetch stock info using Finnhub"""
    try:
        url = f"https://finnhub.io/api/v1/quote?symbol={symbol}&token={FINNHUB_API_KEY}"
        resp = requests.get(url, timeout=10)
        data = resp.json()
        
        if not data or data.get('c') == 0:
            return {"error": f"Symbol {symbol} not found. Try AAPL, TSLA, NVDA, MSFT"}
        
        return {
            "symbol": symbol.upper(),
            "currentPrice": data.get('c', 0),
            "change": data.get('d', 0),
            "changePercent": data.get('dp', 0),
            "previousClose": data.get('pc', 0),
            "name": symbol,
            "marketCap": 0,
            "volume": 0,
        }
    except Exception as e:
        print(f"Error fetching stock info: {e}")
        return {"error": f"Error: {str(e)}. Try AAPL, TSLA, NVDA"}


def get_option_chain(symbol: str, expiration: str = None):
    """Fetch option chain - Finnhub free tier doesn't include options, return mock data with message"""
    return {
        "calls": [],
        "puts": [],
        "underlyingPrice": 0,
        "symbol": symbol.upper(),
        "expirationDates": [],
        "note": "Options data requires paid API. Using stock data only."
    }


def get_stock_info(symbol: str):
    """Fetch stock info for a given symbol"""
    for attempt in range(3):
        try:
            time.sleep(1.5)
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period="1d")
            if hist.empty:
                info = ticker.info
                if not info:
                    return {"error": f"Symbol {symbol} not found. Try AAPL, TSLA, NVDA, MSFT"}
            else:
                info = ticker.info
                
            current = hist['Close'].iloc[-1] if len(hist) > 0 else 0
            return {
                "symbol": symbol.upper(),
                "currentPrice": info.get("regularMarketPrice", info.get("currentPrice", current)),
                "change": info.get("regularMarketChange", 0),
                "changePercent": info.get("regularMarketChangePercent", 0),
                "previousClose": info.get("regularMarketPreviousClose", info.get("previousClose", 0)),
                "name": info.get("shortName", symbol),
                "marketCap": info.get("marketCap", 0),
                "volume": info.get("regularMarketVolume", 0),
            }
        except Exception as e:
            if "rate limit" in str(e).lower() and attempt < 2:
                time.sleep(3)
                continue
            print(f"Error fetching stock info for {symbol}: {e}")
            return {"error": f"Rate limited. Wait a moment then try again."}
    return {"error": "Rate limited. Try again later."}


@app.route("/api/options", methods=["GET"])
def options_endpoint():
    symbol = request.args.get("symbol", "").upper()
    expiration = request.args.get("expiration")
    data_type = request.args.get("type", "all")

    if not symbol:
        return jsonify({"error": "Symbol is required"}), 400

    if data_type == "options" or data_type == "all":
        options_data = get_option_chain(symbol, expiration)
        if not options_data:
            return jsonify({"error": "No options data available"}), 404

        if data_type == "options":
            return jsonify(options_data)

        stock_info = get_stock_info(symbol)
        return jsonify({"stock": stock_info, "options": options_data})

    elif data_type == "stock":
        stock_info = get_stock_info(symbol)
        if not stock_info:
            return jsonify({"error": "Stock not found"}), 404
        return jsonify(stock_info)

    return jsonify({"error": "Invalid type parameter"}), 400


@app.route("/api/stock", methods=["GET"])
def stock_endpoint():
    symbol = request.args.get("symbol", "").upper()

    if not symbol:
        return jsonify({"error": "Symbol is required"}), 400

    stock_info = get_stock_info(symbol)
    if not stock_info:
        return jsonify({"error": "Stock not found"}), 404

    return jsonify(stock_info)


@app.route("/api/expirations", methods=["GET"])
def expirations_endpoint():
    symbol = request.args.get("symbol", "").upper()

    if not symbol:
        return jsonify({"error": "Symbol is required"}), 400

    try:
        ticker = yf.Ticker(symbol)
        expirations = list(ticker.options) if ticker.options else []
        return jsonify({"symbol": symbol, "expirations": expirations})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/", methods=["GET"])
def root():
    return jsonify({"status": "ok", "message": "Options Scanner API is running"})


if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 5000))
    print("Starting Options Scanner API...")
    print("Available endpoints:")
    print("  GET /api/options?symbol=NVDA&type=all - Get stock info and option chain")
    print("  GET /api/options?symbol=NVDA&type=options - Get option chain only")
    print("  GET /api/options?symbol=NVDA&type=stock - Get stock info only")
    print("  GET /api/stock?symbol=NVDA - Get stock info")
    print("  GET /api/expirations?symbol=NVDA - Get available expiration dates")
    print(f"\nStarting server on http://0.0.0.0:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
