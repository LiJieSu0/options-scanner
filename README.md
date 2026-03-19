# Options Scanner

A modern, dark-themed stock options price scanner built with Next.js 14.

## Features

- Search for stock tickers (NVDA, TSLA, AAPL, etc.)
- Real-time stock price display
- Full option chain with Calls and Puts
- Advanced filtering: strike range, expiration date, premium, IV
- Favorites list with localStorage persistence
- Filter memory across sessions
- Responsive design for desktop and mobile

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Lucide React Icons

## Getting Started

### Install dependencies

```bash
npm install
```

### Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Build for production

```bash
npm run build
npm run start
```

## Using Real Data with Python API

For production use with real market data, run the Python backend:

```bash
# Install Python dependencies
pip install -r requirements.txt

# Start the API server
python api_server.py
```

The API server runs on `http://localhost:5000` and provides:
- `/api/options?symbol=NVDA` - Get stock info and option chain
- `/api/stock?symbol=NVDA` - Get stock info only
- `/api/expirations?symbol=NVDA` - Get available expiration dates

## Deploy to Vercel

```bash
npm i -g vercel
vercel
```

## Demo Data

The app includes mock data for development/demo purposes. To use real data, either:
1. Run the Python API server locally
2. Replace the API routes with calls to a paid data provider

## License

MIT
