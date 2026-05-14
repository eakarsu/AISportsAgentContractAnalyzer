const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022';

function parseAIJson(text) {
  if (!text) return null;
  try { return JSON.parse(text); } catch (_) {}
  // Strip markdown fences
  let cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  try { return JSON.parse(cleaned); } catch (_) {}
  // Find first { to last }
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    try { return JSON.parse(cleaned.slice(start, end + 1)); } catch (_) {}
  }
  return null;
}

const featurePrompts = {
  contracts: (data, comps) => `You are an expert sports contract analyst. Analyze the following player contract data.
${comps && comps.length > 0 ? `\nComparable contracts in the same sport/position:\n${JSON.stringify(comps, null, 2)}\n` : ''}
Contract Data:
${JSON.stringify(data, null, 2)}

Respond ONLY with valid JSON in this exact format:
{
  "analysis": {
    "risk_score": <number 1-10>,
    "market_value": "<string>",
    "recommendations": ["<string>", ...],
    "red_flags": ["<string>", ...],
    "comparable_players": ["<string>", ...],
    "summary": "<string>"
  }
}`,

  salary_caps: (data) => `You are an expert salary cap analyst for professional sports teams. Analyze the following salary cap data.
Data:
${JSON.stringify(data, null, 2)}

Respond ONLY with valid JSON:
{
  "analysis": {
    "risk_score": <number 1-10>,
    "market_value": "<cap health description>",
    "recommendations": ["<string>", ...],
    "red_flags": ["<string>", ...],
    "comparable_players": [],
    "summary": "<string>"
  }
}`,

  endorsements: (data) => `You are an expert sports marketing and endorsement deal analyst. Analyze the following endorsement data.
Data:
${JSON.stringify(data, null, 2)}

Respond ONLY with valid JSON:
{
  "analysis": {
    "risk_score": <number 1-10>,
    "market_value": "<string>",
    "recommendations": ["<string>", ...],
    "red_flags": ["<string>", ...],
    "comparable_players": [],
    "summary": "<string>"
  }
}`,

  free_agents: (data) => `You are an expert free agency market analyst. Analyze the following free agent data.
Data:
${JSON.stringify(data, null, 2)}

Respond ONLY with valid JSON:
{
  "analysis": {
    "risk_score": <number 1-10>,
    "market_value": "<string>",
    "recommendations": ["<string>", ...],
    "red_flags": ["<string>", ...],
    "comparable_players": ["<string>", ...],
    "summary": "<string>"
  }
}`,

  negotiations: (data, rounds) => `You are an expert sports contract negotiation strategist. Analyze the following negotiation data.
${rounds && rounds.length > 0 ? `\nNegotiation rounds history:\n${JSON.stringify(rounds, null, 2)}\n` : ''}
Data:
${JSON.stringify(data, null, 2)}

Respond ONLY with valid JSON:
{
  "analysis": {
    "risk_score": <number 1-10>,
    "market_value": "<ZOPA estimate>",
    "recommendations": ["<string>", ...],
    "red_flags": ["<string>", ...],
    "comparable_players": [],
    "zopa": "<string>",
    "batna": "<string>",
    "leverage_score": <number 1-10>,
    "summary": "<string>"
  }
}`,

  performance: (data) => `You are an expert sports performance analyst. Analyze the following player performance data.
Data:
${JSON.stringify(data, null, 2)}

Respond ONLY with valid JSON:
{
  "analysis": {
    "risk_score": <number 1-10>,
    "market_value": "<string>",
    "recommendations": ["<string>", ...],
    "red_flags": ["<string>", ...],
    "comparable_players": ["<string>", ...],
    "summary": "<string>"
  }
}`,

  draft_scouting: (data) => `You are an expert sports draft analyst and scout. Analyze the following draft prospect data.
Data:
${JSON.stringify(data, null, 2)}

Respond ONLY with valid JSON:
{
  "analysis": {
    "risk_score": <number 1-10>,
    "market_value": "<projected contract value>",
    "recommendations": ["<string>", ...],
    "red_flags": ["<string>", ...],
    "comparable_players": ["<string>", ...],
    "summary": "<string>"
  }
}`,

  injury_reports: (data) => `You are an expert sports medicine analyst and contract specialist. Analyze the following injury report data.
Data:
${JSON.stringify(data, null, 2)}

Respond ONLY with valid JSON:
{
  "analysis": {
    "risk_score": <number 1-10>,
    "market_value": "<impact on contract value>",
    "recommendations": ["<string>", ...],
    "red_flags": ["<string>", ...],
    "comparable_players": [],
    "summary": "<string>"
  }
}`,

  team_rosters: (data) => `You are an expert team roster and salary cap analyst. Analyze the following team roster data.
Data:
${JSON.stringify(data, null, 2)}

Respond ONLY with valid JSON:
{
  "analysis": {
    "risk_score": <number 1-10>,
    "market_value": "<roster value estimate>",
    "recommendations": ["<string>", ...],
    "red_flags": ["<string>", ...],
    "comparable_players": [],
    "summary": "<string>"
  }
}`,

  trade_analysis: (data) => `You are an expert sports trade analyst. Analyze the following trade scenario.
Data:
${JSON.stringify(data, null, 2)}

Respond ONLY with valid JSON:
{
  "analysis": {
    "risk_score": <number 1-10>,
    "market_value": "<trade fairness assessment>",
    "recommendations": ["<string>", ...],
    "red_flags": ["<string>", ...],
    "comparable_players": [],
    "winner": "<team name>",
    "grade_team_a": "<letter grade>",
    "grade_team_b": "<letter grade>",
    "summary": "<string>"
  }
}`,
};

async function analyzeWithAI(featureType, data, extraContext) {
  if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'your-openrouter-api-key-here') {
    return {
      analysis: {
        risk_score: 5,
        market_value: 'Demo mode - configure OPENROUTER_API_KEY',
        recommendations: ['Configure your OpenRouter API key to get real AI analysis'],
        red_flags: [],
        comparable_players: [],
        summary: 'AI analysis is in demo mode. Please configure your OpenRouter API key.'
      },
      model: 'demo-mode',
      tokensUsed: 0,
    };
  }

  const normalizedType = featureType.replace(/-/g, '_');
  const promptBuilder = featurePrompts[normalizedType];
  if (!promptBuilder) {
    throw new Error(`Unknown feature type: ${featureType}`);
  }

  const prompt = promptBuilder(data, extraContext);

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:3000',
      'X-Title': 'AI Sports Agent Contract Analyzer',
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a professional sports agent AI assistant. Always respond with valid JSON only, no markdown, no explanation outside JSON.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 2000,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${errorBody}`);
  }

  const result = await response.json();
  const rawContent = result.choices[0].message.content;
  const parsed = parseAIJson(rawContent);

  return {
    analysis: parsed ? parsed.analysis : { summary: rawContent, risk_score: 5, market_value: 'N/A', recommendations: [], red_flags: [], comparable_players: [] },
    raw: rawContent,
    model: result.model || OPENROUTER_MODEL,
    tokensUsed: result.usage ? result.usage.total_tokens : 0,
  };
}

module.exports = { analyzeWithAI, parseAIJson, OPENROUTER_MODEL };
