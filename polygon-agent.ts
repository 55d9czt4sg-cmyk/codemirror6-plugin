import Anthropic from "@anthropic-ai/sdk";

/**
 * Polygon.io Financial Data Agent
 *
 * Uses Claude claude-opus-4-6 with Composio Polygon tools to answer
 * financial data questions via the Polygon.io API.
 *
 * Required environment variables:
 *   ANTHROPIC_API_KEY  - Your Anthropic API key
 *   POLYGON_API_KEY    - Your Polygon.io API key
 *   COMPOSIO_API_KEY   - Your Composio API key (optional, for managed auth)
 */

const client = new Anthropic();

const POLYGON_BASE_URL = "https://api.polygon.io";

// ---------------------------------------------------------------------------
// Polygon API helpers
// ---------------------------------------------------------------------------

async function polygonGet(
  path: string,
  params: Record<string, string | number | boolean> = {}
): Promise<unknown> {
  const apiKey = process.env.POLYGON_API_KEY;
  if (!apiKey) throw new Error("POLYGON_API_KEY environment variable not set");

  const url = new URL(`${POLYGON_BASE_URL}${path}`);
  url.searchParams.set("apiKey", apiKey);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") {
      url.searchParams.set(k, String(v));
    }
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Polygon API error ${res.status}: ${body}`);
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// Tool implementations
// ---------------------------------------------------------------------------

async function polygon_get_all_tickers(input: {
  ticker?: string;
  type?: string;
  market?: string;
  exchange?: string;
  cusip?: string;
  cik?: string;
  date?: string;
  search?: string;
  active?: boolean;
  order?: string;
  limit?: number;
  sort?: string;
}): Promise<string> {
  const data = await polygonGet("/v3/reference/tickers", {
    ...(input.ticker && { ticker: input.ticker }),
    ...(input.type && { type: input.type }),
    ...(input.market && { market: input.market }),
    ...(input.exchange && { exchange: input.exchange }),
    ...(input.cusip && { cusip: input.cusip }),
    ...(input.cik && { cik: input.cik }),
    ...(input.date && { date: input.date }),
    ...(input.search && { search: input.search }),
    ...(input.active !== undefined && { active: input.active }),
    ...(input.order && { order: input.order }),
    ...(input.limit && { limit: input.limit }),
    ...(input.sort && { sort: input.sort }),
  });
  return JSON.stringify(data, null, 2);
}

async function polygon_get_aggregates(input: {
  stocksTicker: string;
  multiplier: number;
  timespan: string;
  from: string;
  to: string;
  adjusted?: boolean;
  sort?: string;
  limit?: number;
}): Promise<string> {
  const data = await polygonGet(
    `/v2/aggs/ticker/${input.stocksTicker}/range/${input.multiplier}/${input.timespan}/${input.from}/${input.to}`,
    {
      ...(input.adjusted !== undefined && { adjusted: input.adjusted }),
      ...(input.sort && { sort: input.sort }),
      ...(input.limit && { limit: input.limit }),
    }
  );
  return JSON.stringify(data, null, 2);
}

async function polygon_get_crypto_ema(input: {
  cryptoTicker: string;
  timespan?: string;
  adjusted?: boolean;
  window?: number;
  series_type?: string;
  order?: string;
  limit?: number;
}): Promise<string> {
  const data = await polygonGet(
    `/v1/indicators/ema/${input.cryptoTicker}`,
    {
      ...(input.timespan && { timespan: input.timespan }),
      ...(input.adjusted !== undefined && { adjusted: input.adjusted }),
      ...(input.window && { window: input.window }),
      ...(input.series_type && { series_type: input.series_type }),
      ...(input.order && { order: input.order }),
      ...(input.limit && { limit: input.limit }),
    }
  );
  return JSON.stringify(data, null, 2);
}

async function polygon_get_daily_ticker_summary(input: {
  stocksTicker: string;
  date?: string;
  adjusted?: boolean;
}): Promise<string> {
  const path = input.date
    ? `/v1/open-close/${input.stocksTicker}/${input.date}`
    : `/v2/snapshot/locale/us/markets/stocks/tickers/${input.stocksTicker}`;
  const data = await polygonGet(path, {
    ...(input.adjusted !== undefined && { adjusted: input.adjusted }),
  });
  return JSON.stringify(data, null, 2);
}

async function polygon_get_futures_quotes(input: {
  fxTicker: string;
  timestamp?: string;
  order?: string;
  limit?: number;
  sort?: string;
}): Promise<string> {
  const data = await polygonGet(
    `/v3/quotes/${input.fxTicker}`,
    {
      ...(input.timestamp && { timestamp: input.timestamp }),
      ...(input.order && { order: input.order }),
      ...(input.limit && { limit: input.limit }),
      ...(input.sort && { sort: input.sort }),
    }
  );
  return JSON.stringify(data, null, 2);
}

async function polygon_get_macd(input: {
  stocksTicker: string;
  timespan?: string;
  adjusted?: boolean;
  short_window?: number;
  long_window?: number;
  signal_window?: number;
  series_type?: string;
  order?: string;
  limit?: number;
}): Promise<string> {
  const data = await polygonGet(
    `/v1/indicators/macd/${input.stocksTicker}`,
    {
      ...(input.timespan && { timespan: input.timespan }),
      ...(input.adjusted !== undefined && { adjusted: input.adjusted }),
      ...(input.short_window && { short_window: input.short_window }),
      ...(input.long_window && { long_window: input.long_window }),
      ...(input.signal_window && { signal_window: input.signal_window }),
      ...(input.series_type && { series_type: input.series_type }),
      ...(input.order && { order: input.order }),
      ...(input.limit && { limit: input.limit }),
    }
  );
  return JSON.stringify(data, null, 2);
}

async function polygon_get_news(input: {
  ticker?: string;
  published_utc?: string;
  order?: string;
  limit?: number;
  sort?: string;
}): Promise<string> {
  const data = await polygonGet("/v2/reference/news", {
    ...(input.ticker && { ticker: input.ticker }),
    ...(input.published_utc && { published_utc: input.published_utc }),
    ...(input.order && { order: input.order }),
    ...(input.limit && { limit: input.limit }),
    ...(input.sort && { sort: input.sort }),
  });
  return JSON.stringify(data, null, 2);
}

async function polygon_get_rsi(input: {
  stocksTicker: string;
  timespan?: string;
  adjusted?: boolean;
  window?: number;
  series_type?: string;
  order?: string;
  limit?: number;
}): Promise<string> {
  const data = await polygonGet(
    `/v1/indicators/rsi/${input.stocksTicker}`,
    {
      ...(input.timespan && { timespan: input.timespan }),
      ...(input.adjusted !== undefined && { adjusted: input.adjusted }),
      ...(input.window && { window: input.window }),
      ...(input.series_type && { series_type: input.series_type }),
      ...(input.order && { order: input.order }),
      ...(input.limit && { limit: input.limit }),
    }
  );
  return JSON.stringify(data, null, 2);
}

async function polygon_get_snapshot_all_tickers(input: {
  locale: string;
  market: string;
  tickers?: string;
  include_otc?: boolean;
}): Promise<string> {
  const data = await polygonGet(
    `/v2/snapshot/locale/${input.locale}/markets/${input.market}/tickers`,
    {
      ...(input.tickers && { tickers: input.tickers }),
      ...(input.include_otc !== undefined && { include_otc: input.include_otc }),
    }
  );
  return JSON.stringify(data, null, 2);
}

async function polygon_get_stocks_daily_market_summary(input: {
  date?: string;
}): Promise<string> {
  const date = input.date ?? new Date().toISOString().split("T")[0];
  const data = await polygonGet(`/v1/marketstatus/upcoming`);
  // Also fetch grouped daily bars for US stocks
  const grouped = await polygonGet(`/v2/aggs/grouped/locale/us/market/stocks/${date}`, {
    adjusted: true,
  });
  return JSON.stringify({ market_status: data, grouped_daily: grouped }, null, 2);
}

async function polygon_get_stock_financials(input: {
  ticker?: string;
  cik?: string;
  company_name?: string;
  sic?: string;
  filing_date?: string;
  period_of_report_date?: string;
  timeframe?: string;
  include_sources?: boolean;
  order?: string;
  limit?: number;
  sort?: string;
}): Promise<string> {
  const data = await polygonGet("/vX/reference/financials", {
    ...(input.ticker && { ticker: input.ticker }),
    ...(input.cik && { cik: input.cik }),
    ...(input.company_name && { company_name: input.company_name }),
    ...(input.sic && { sic: input.sic }),
    ...(input.filing_date && { filing_date: input.filing_date }),
    ...(input.period_of_report_date && { period_of_report_date: input.period_of_report_date }),
    ...(input.timeframe && { timeframe: input.timeframe }),
    ...(input.include_sources !== undefined && { include_sources: input.include_sources }),
    ...(input.order && { order: input.order }),
    ...(input.limit && { limit: input.limit }),
    ...(input.sort && { sort: input.sort }),
  });
  return JSON.stringify(data, null, 2);
}

// ---------------------------------------------------------------------------
// Tool definitions (Anthropic format)
// ---------------------------------------------------------------------------

const TOOLS: Anthropic.Tool[] = [
  {
    name: "POLYGON_GET_ALL_TICKERS",
    description:
      "Query all ticker symbols supported by Polygon.io. Filter by type, market, exchange, or keyword search. Returns ticker details including name, market, locale, primary exchange, type, active status, and more.",
    input_schema: {
      type: "object",
      properties: {
        ticker: {
          type: "string",
          description: "Specify a ticker symbol. Limit to one ticker per request.",
        },
        type: {
          type: "string",
          description:
            "Specify the type of ticker. Common values: CS (Common Stock), ETF, CRYPTO, FX.",
        },
        market: {
          type: "string",
          description: "Filter by market type. Values: stocks, crypto, fx, otc, indices.",
        },
        exchange: {
          type: "string",
          description: "Specify the primary exchange MIC code.",
        },
        cusip: { type: "string", description: "Specify the CUSIP code." },
        cik: { type: "string", description: "Specify the CIK number." },
        date: {
          type: "string",
          description: "Specify a point in time to retrieve tickers available on that date (YYYY-MM-DD).",
        },
        search: {
          type: "string",
          description: "Search for terms within the ticker or company name.",
        },
        active: {
          type: "boolean",
          description: "Specify if the ticker is actively traded.",
        },
        order: {
          type: "string",
          description: "Order results by ascending (asc) or descending (desc).",
        },
        limit: {
          type: "number",
          description: "Limit the number of results returned (max 1000).",
        },
        sort: {
          type: "string",
          description: "Sort field for ordering results (e.g. ticker, name, market).",
        },
      },
      required: [],
    },
  },
  {
    name: "POLYGON_GET_AGGREGATES",
    description:
      "Get aggregate bars (OHLCV) for a stock over a given date range in custom time window sizes. Returns open, high, low, close, volume, VWAP, and number of transactions for each bar.",
    input_schema: {
      type: "object",
      properties: {
        stocksTicker: {
          type: "string",
          description: "The ticker symbol of the stock (e.g. AAPL).",
        },
        multiplier: {
          type: "number",
          description: "The size of the aggregate time window.",
        },
        timespan: {
          type: "string",
          description:
            "The size of the aggregate time window. Values: minute, hour, day, week, month, quarter, year.",
        },
        from: {
          type: "string",
          description: "The start of the aggregate time window (YYYY-MM-DD or ms timestamp).",
        },
        to: {
          type: "string",
          description: "The end of the aggregate time window (YYYY-MM-DD or ms timestamp).",
        },
        adjusted: {
          type: "boolean",
          description: "Whether results are adjusted for splits. Default: true.",
        },
        sort: {
          type: "string",
          description: "Sort results by timestamp. Values: asc, desc.",
        },
        limit: {
          type: "number",
          description: "Limit the number of base aggregates returned (max 50000).",
        },
      },
      required: ["stocksTicker", "multiplier", "timespan", "from", "to"],
    },
  },
  {
    name: "POLYGON_GET_CRYPTO_EMA",
    description:
      "Get the exponential moving average (EMA) for a crypto ticker symbol over a given range. Returns EMA values with timestamps.",
    input_schema: {
      type: "object",
      properties: {
        cryptoTicker: {
          type: "string",
          description: "The crypto ticker symbol (e.g. X:BTCUSD).",
        },
        timespan: {
          type: "string",
          description:
            "The size of the time window. Values: minute, hour, day, week, month, quarter, year.",
        },
        adjusted: {
          type: "boolean",
          description: "Whether the aggregates used to calculate the indicator are adjusted for splits.",
        },
        window: {
          type: "number",
          description: "The window size used to calculate the EMA (e.g. 14, 50, 200).",
        },
        series_type: {
          type: "string",
          description: "The price type used to calculate EMA. Values: open, high, low, close.",
        },
        order: {
          type: "string",
          description: "Order results by ascending (asc) or descending (desc) timestamp.",
        },
        limit: {
          type: "number",
          description: "Limit the number of results returned (max 5000).",
        },
      },
      required: ["cryptoTicker"],
    },
  },
  {
    name: "POLYGON_GET_DAILY_TICKER_SUMMARY",
    description:
      "Get the open, close, and afterhours prices for a stock on a specific date, or get a full snapshot of current trading data including last quote, last trade, minute bar, day bar, and previous day bar.",
    input_schema: {
      type: "object",
      properties: {
        stocksTicker: {
          type: "string",
          description: "The ticker symbol of the stock (e.g. AAPL).",
        },
        date: {
          type: "string",
          description:
            "The date for the open/close data in YYYY-MM-DD format. If omitted, returns current snapshot.",
        },
        adjusted: {
          type: "boolean",
          description: "Whether results are adjusted for splits.",
        },
      },
      required: ["stocksTicker"],
    },
  },
  {
    name: "POLYGON_GET_FUTURES_QUOTES",
    description:
      "Get quotes (bid/ask) for a forex or futures ticker. Returns historical NBBO quotes with timestamps, bid/ask prices and sizes, and exchange information.",
    input_schema: {
      type: "object",
      properties: {
        fxTicker: {
          type: "string",
          description: "The forex or futures ticker symbol (e.g. C:EURUSD).",
        },
        timestamp: {
          type: "string",
          description: "Query by timestamp (nanosecond Unix timestamp or date YYYY-MM-DD).",
        },
        order: {
          type: "string",
          description: "Order results by ascending (asc) or descending (desc) timestamp.",
        },
        limit: {
          type: "number",
          description: "Limit the number of results returned (max 50000).",
        },
        sort: {
          type: "string",
          description: "Sort field. Default: timestamp.",
        },
      },
      required: ["fxTicker"],
    },
  },
  {
    name: "POLYGON_GET_MACD",
    description:
      "Get the moving average convergence/divergence (MACD) data for a stock ticker. Returns MACD value, signal, histogram, and underlying OHLCV aggregates.",
    input_schema: {
      type: "object",
      properties: {
        stocksTicker: {
          type: "string",
          description: "The ticker symbol of the stock (e.g. AAPL).",
        },
        timespan: {
          type: "string",
          description:
            "The size of the time window. Values: minute, hour, day, week, month, quarter, year.",
        },
        adjusted: {
          type: "boolean",
          description: "Whether the aggregates are adjusted for splits.",
        },
        short_window: {
          type: "number",
          description: "The short window size for MACD calculation (default: 12).",
        },
        long_window: {
          type: "number",
          description: "The long window size for MACD calculation (default: 26).",
        },
        signal_window: {
          type: "number",
          description: "The signal window size for MACD calculation (default: 9).",
        },
        series_type: {
          type: "string",
          description: "The price type used to calculate MACD. Values: open, high, low, close.",
        },
        order: {
          type: "string",
          description: "Order results by ascending (asc) or descending (desc) timestamp.",
        },
        limit: {
          type: "number",
          description: "Limit the number of results returned (max 5000).",
        },
      },
      required: ["stocksTicker"],
    },
  },
  {
    name: "POLYGON_GET_NEWS",
    description:
      "Get the most recent news articles relating to a stock ticker, including article title, author, published date, article URL, tickers mentioned, and a short description.",
    input_schema: {
      type: "object",
      properties: {
        ticker: {
          type: "string",
          description: "Return results that contain this ticker (e.g. AAPL).",
        },
        published_utc: {
          type: "string",
          description:
            "Return results published on, before, or after this date (YYYY-MM-DD or ISO 8601 timestamp). Supports range operators like lte:2024-01-01.",
        },
        order: {
          type: "string",
          description: "Order results by ascending (asc) or descending (desc).",
        },
        limit: {
          type: "number",
          description: "Limit the number of results returned (max 1000).",
        },
        sort: {
          type: "string",
          description: "Sort field. Default: published_utc.",
        },
      },
      required: [],
    },
  },
  {
    name: "POLYGON_GET_RSI",
    description:
      "Get the relative strength index (RSI) for a stock ticker. RSI is a momentum oscillator that measures the speed and change of price movements, ranging from 0 to 100. Values above 70 indicate overbought conditions; below 30 indicate oversold.",
    input_schema: {
      type: "object",
      properties: {
        stocksTicker: {
          type: "string",
          description: "The ticker symbol of the stock (e.g. AAPL).",
        },
        timespan: {
          type: "string",
          description:
            "The size of the time window. Values: minute, hour, day, week, month, quarter, year.",
        },
        adjusted: {
          type: "boolean",
          description: "Whether the aggregates are adjusted for splits.",
        },
        window: {
          type: "number",
          description: "The window size used to calculate RSI (default: 14).",
        },
        series_type: {
          type: "string",
          description: "The price type used to calculate RSI. Values: open, high, low, close.",
        },
        order: {
          type: "string",
          description: "Order results by ascending (asc) or descending (desc) timestamp.",
        },
        limit: {
          type: "number",
          description: "Limit the number of results returned (max 5000).",
        },
      },
      required: ["stocksTicker"],
    },
  },
  {
    name: "POLYGON_GET_SNAPSHOT_ALL_TICKERS",
    description:
      "Get snapshots for all tickers in a given market, containing current trading data including last quote, last trade, minute bar, day bar, previous day bar, and change percentages.",
    input_schema: {
      type: "object",
      properties: {
        locale: {
          type: "string",
          description: "The locale/region of the market (e.g. us, global).",
        },
        market: {
          type: "string",
          description: "The type of market (e.g. stocks, crypto, fx, options).",
        },
        tickers: {
          type: "string",
          description: "Comma-separated list of tickers to filter results (e.g. AAPL,MSFT,GOOG).",
        },
        include_otc: {
          type: "boolean",
          description: "Include OTC securities in the response. Default: false.",
        },
      },
      required: ["locale", "market"],
    },
  },
  {
    name: "POLYGON_GET_STOCK_FINANCIALS",
    description:
      "Get fundamental financial data for a publicly traded company, including income statement, balance sheet, and cash flow data. Returns XBRL-tagged financial facts from SEC filings.",
    input_schema: {
      type: "object",
      properties: {
        ticker: {
          type: "string",
          description: "The ticker symbol of the company (e.g. AAPL).",
        },
        cik: {
          type: "string",
          description: "The CIK number of the company.",
        },
        company_name: {
          type: "string",
          description: "Search for a company by name.",
        },
        sic: {
          type: "string",
          description: "The SIC code of the company.",
        },
        filing_date: {
          type: "string",
          description: "Query by filing date (YYYY-MM-DD). Supports range operators.",
        },
        period_of_report_date: {
          type: "string",
          description: "The period of report date (YYYY-MM-DD). Supports range operators.",
        },
        timeframe: {
          type: "string",
          description: "The period of report for financials. Values: annual, quarterly, ttm.",
        },
        include_sources: {
          type: "boolean",
          description: "Whether to include the XBRL facts used to derive the financials.",
        },
        order: {
          type: "string",
          description: "Order results by ascending (asc) or descending (desc).",
        },
        limit: {
          type: "number",
          description: "Limit the number of results returned (max 100).",
        },
        sort: {
          type: "string",
          description: "Sort field (e.g. filing_date, period_of_report_date).",
        },
      },
      required: [],
    },
  },
  {
    name: "POLYGON_GET_STOCKS_DAILY_MARKET_SUMMARY",
    description:
      "Get a summary of the entire US stock market for a given trading day. Returns grouped daily OHLCV bars for all stocks traded on a specific date, along with the current or upcoming market status/schedule.",
    input_schema: {
      type: "object",
      properties: {
        date: {
          type: "string",
          description:
            "The date to retrieve grouped daily bars for, in YYYY-MM-DD format. Defaults to today if omitted.",
        },
      },
      required: [],
    },
  },
];

// ---------------------------------------------------------------------------
// Tool executor
// ---------------------------------------------------------------------------

async function executeTool(name: string, input: Record<string, unknown>): Promise<string> {
  try {
    switch (name) {
      case "POLYGON_GET_ALL_TICKERS":
        return await polygon_get_all_tickers(input as Parameters<typeof polygon_get_all_tickers>[0]);
      case "POLYGON_GET_AGGREGATES":
        return await polygon_get_aggregates(input as Parameters<typeof polygon_get_aggregates>[0]);
      case "POLYGON_GET_CRYPTO_EMA":
        return await polygon_get_crypto_ema(input as Parameters<typeof polygon_get_crypto_ema>[0]);
      case "POLYGON_GET_DAILY_TICKER_SUMMARY":
        return await polygon_get_daily_ticker_summary(input as Parameters<typeof polygon_get_daily_ticker_summary>[0]);
      case "POLYGON_GET_FUTURES_QUOTES":
        return await polygon_get_futures_quotes(input as Parameters<typeof polygon_get_futures_quotes>[0]);
      case "POLYGON_GET_MACD":
        return await polygon_get_macd(input as Parameters<typeof polygon_get_macd>[0]);
      case "POLYGON_GET_NEWS":
        return await polygon_get_news(input as Parameters<typeof polygon_get_news>[0]);
      case "POLYGON_GET_RSI":
        return await polygon_get_rsi(input as Parameters<typeof polygon_get_rsi>[0]);
      case "POLYGON_GET_SNAPSHOT_ALL_TICKERS":
        return await polygon_get_snapshot_all_tickers(input as Parameters<typeof polygon_get_snapshot_all_tickers>[0]);
      case "POLYGON_GET_STOCK_FINANCIALS":
        return await polygon_get_stock_financials(input as Parameters<typeof polygon_get_stock_financials>[0]);
      case "POLYGON_GET_STOCKS_DAILY_MARKET_SUMMARY":
        return await polygon_get_stocks_daily_market_summary(input as Parameters<typeof polygon_get_stocks_daily_market_summary>[0]);
      default:
        return JSON.stringify({ error: `Unknown tool: ${name}` });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return JSON.stringify({ error: message });
  }
}

// ---------------------------------------------------------------------------
// Agent loop
// ---------------------------------------------------------------------------

async function runPolygonAgent(userQuery: string): Promise<void> {
  console.log(`\nUser: ${userQuery}\n`);

  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: userQuery },
  ];

  const MAX_ITERATIONS = 10;
  let iterations = 0;

  while (iterations < MAX_ITERATIONS) {
    iterations++;

    // Stream the response
    const stream = client.messages.stream({
      model: "claude-opus-4-6",
      max_tokens: 4096,
      thinking: { type: "adaptive" },
      system:
        "You are a financial data assistant with access to real-time and historical market data via Polygon.io. " +
        "Use the available tools to retrieve accurate financial data and provide clear, insightful analysis. " +
        "Always cite the data source and timestamp when presenting financial figures.",
      tools: TOOLS,
      messages,
    });

    process.stdout.write("Assistant: ");

    stream.on("text", (delta) => {
      process.stdout.write(delta);
    });

    const message = await stream.finalMessage();
    console.log("\n");

    if (message.stop_reason === "end_turn") {
      break;
    }

    if (message.stop_reason === "pause_turn") {
      // Server-side tool hit iteration limit — re-send to continue
      messages.push({ role: "assistant", content: message.content });
      continue;
    }

    if (message.stop_reason !== "tool_use") {
      break;
    }

    // Collect tool calls
    const toolUseBlocks = message.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
    );

    messages.push({ role: "assistant", content: message.content });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const toolUse of toolUseBlocks) {
      console.log(`[Tool: ${toolUse.name}]`, JSON.stringify(toolUse.input, null, 2));
      const result = await executeTool(toolUse.name, toolUse.input as Record<string, unknown>);
      console.log(`[Result snippet]: ${result.slice(0, 200)}...\n`);
      toolResults.push({
        type: "tool_result",
        tool_use_id: toolUse.id,
        content: result,
      });
    }

    messages.push({ role: "user", content: toolResults });
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const query = process.argv[2] ??
  "What are the latest news articles about Apple (AAPL)? Also show me the past 5 daily OHLCV bars and the current MACD indicator.";

runPolygonAgent(query).catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
