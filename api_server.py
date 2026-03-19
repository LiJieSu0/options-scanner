#!/usr/bin/env python3
"""
Options Scanner API - Python yfinance wrapper
Run this script to start a local API server with real options data.
Usage: python api_server.py
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import yfinance as yf
from datetime import datetime, timedelta
import json

import time

app = Flask(__name__)
CORS(app)


def get_option_chain(symbol: str, expiration: str = None):
    """Fetch option chain data for a given symbol"""
    try:
        ticker = yf.Ticker(symbol)

        if expiration:
            expiration_dt = datetime.strptime(expiration, "%Y-%m-%d")
            expiration_str = expiration_dt.strftime("%Y-%m-%d")
        else:
            expirations = ticker.options
            if not expirations:
                return None
            expiration_str = expirations[0]

        options = ticker.option_chain(expiration_str)

        def parse_options(options_df, option_type):
            if options_df is None or options_df.empty:
                return []

            result = []
            for _, row in options_df.iterrows():
                result.append(
                    {
                        "strike": float(row.get("strike", 0)),
                        "bid": float(row.get("bid", 0)),
                        "ask": float(row.get("ask", 0)),
                        "lastPrice": float(row.get("lastPrice", 0))
                        if pd.notna(row.get("lastPrice"))
                        else 0,
                        "volume": int(row.get("volume", 0))
                        if pd.notna(row.get("volume"))
                        else 0,
                        "openInterest": int(row.get("openInterest", 0))
                        if pd.notna(row.get("openInterest"))
                        else 0,
                        "impliedVolatility": float(row.get("impliedVolatility", 0))
                        if pd.notna(row.get("impliedVolatility"))
                        else 0,
                        "inTheMoney": bool(row.get("inTheMoney", False)),
                        "expiration": expiration_str,
                        "type": option_type,
                    }
                )
            return result

        import pandas as pd

        calls = parse_options(options.calls, "call")
        puts = parse_options(options.puts, "put")

        stock = ticker.info
        current_price = stock.get("regularMarketPrice", stock.get("currentPrice", 0))

        return {
            "calls": calls,
            "puts": puts,
            "underlyingPrice": float(current_price) if current_price else 0,
            "symbol": symbol.upper(),
            "expirationDates": list(ticker.options) if ticker.options else [],
        }

    except Exception as e:
        print(f"Error fetching option chain for {symbol}: {e}")
        return None


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
