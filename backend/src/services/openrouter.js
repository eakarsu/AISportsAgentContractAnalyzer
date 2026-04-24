const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5';

const featurePrompts = {
  contracts: (data) => `You are an expert sports contract analyst. Analyze the following player contract data and provide:
1. Contract Value Assessment: Is this contract above, below, or at market value?
2. Market Comparison: How does this compare to similar players at the same position and league?
3. Risk Analysis: What are the risks associated with this contract structure?
4. Recommendations: What improvements could be made for both player and team?
5. Key Insights: Any notable clauses or financial structures worth highlighting.

Contract Data:
${JSON.stringify(data, null, 2)}

Provide a detailed, structured analysis in markdown format.`,

  salary_caps: (data) => `You are an expert salary cap analyst for professional sports teams. Analyze the following salary cap data and provide:
1. Cap Health Assessment: How healthy is this team's cap situation?
2. Cap Space Optimization: How can the team better utilize their cap space?
3. Trade Suggestions: What trades could improve the cap situation?
4. Future Projections: How will the cap situation evolve over the next 2-3 seasons?
5. Risk Areas: What contracts could become problematic?
6. Recommendations: Specific actionable steps to optimize the salary cap.

Salary Cap Data:
${JSON.stringify(data, null, 2)}

Provide a detailed, structured analysis in markdown format.`,

  endorsements: (data) => `You are an expert sports marketing and endorsement deal analyst. Analyze the following endorsement data and provide:
1. Deal Valuation: Is this endorsement deal appropriately valued?
2. Brand-Player Fit: How well does the player match the brand's target market?
3. Market Opportunities: What additional endorsement categories should be explored?
4. Social Media Impact: How does the player's social media presence affect deal value?
5. Revenue Projections: Estimated ROI for the brand.
6. Recommendations: How to maximize endorsement income for the player.

Endorsement Data:
${JSON.stringify(data, null, 2)}

Provide a detailed, structured analysis in markdown format.`,

  free_agents: (data) => `You are an expert free agency market analyst for professional sports. Analyze the following free agent data and provide:
1. Market Value Prediction: What is the expected contract value for this player?
2. Team Fits: Which teams would benefit most from signing this player?
3. Comparable Players: Historical comparisons with similar free agents.
4. Risk Assessment: Injury history, age concerns, and performance trajectory.
5. Negotiation Strategy: How should the agent approach negotiations?
6. Timeline Prediction: Expected timeline for signing.

Free Agent Data:
${JSON.stringify(data, null, 2)}

Provide a detailed, structured analysis in markdown format.`,

  negotiations: (data) => `You are an expert sports contract negotiation strategist. Analyze the following negotiation data and provide:
1. Negotiation Position Analysis: Assess the current leverage for both sides.
2. Counter-Offer Strategy: Suggest optimal counter-offer points.
3. Key Leverage Points: Identify and rank negotiation leverage factors.
4. Deal Structure Recommendations: Optimal contract structure for both parties.
5. Walk-Away Points: Define minimum acceptable terms.
6. Timeline Strategy: When to push and when to pause.
7. Comparable Deals: Reference similar negotiations and their outcomes.

Negotiation Data:
${JSON.stringify(data, null, 2)}

Provide a detailed, structured analysis in markdown format.`,

  performance: (data) => `You are an expert sports performance and analytics specialist. Analyze the following player performance data and provide:
1. Performance Trend Analysis: Is the player improving, declining, or plateauing?
2. Statistical Breakdown: Key metrics and how they compare to peers.
3. Contract Value Impact: How does performance translate to contract value?
4. Future Projections: Predicted performance for the next 2-3 seasons.
5. Injury Risk Assessment: Based on workload and playing patterns.
6. Market Value Trajectory: How will the player's market value change?
7. Recommendations: For the player and their agent.

Performance Data:
${JSON.stringify(data, null, 2)}

Provide a detailed, structured analysis in markdown format.`,

  draft_scouting: (data) => `You are an expert sports draft analyst and scout. Analyze the following draft prospect data and provide:
1. Prospect Grade: Overall evaluation and draft stock assessment.
2. Strengths Analysis: Detailed breakdown of the prospect's key strengths.
3. Weaknesses & Concerns: Areas that need development or pose risks.
4. NFL/NBA/MLB Comparison: How the prospect compares to established professionals.
5. Draft Position Value: Is the projected pick appropriate for this prospect's talent?
6. Contract Projections: Expected rookie contract value and future earning potential.
7. Team Fit Analysis: Which teams would benefit most from drafting this prospect?
8. Development Timeline: How long until the prospect reaches their ceiling?

Draft Prospect Data:
${JSON.stringify(data, null, 2)}

Provide a detailed, structured analysis in markdown format.`,

  injury_reports: (data) => `You are an expert sports medicine analyst and contract specialist. Analyze the following injury report data and provide:
1. Injury Severity Assessment: Detailed evaluation of the injury and its implications.
2. Recovery Timeline: Expected recovery milestones and return-to-play timeline.
3. Career Impact Analysis: How this injury affects long-term career trajectory.
4. Contract Implications: Financial impact on current and future contracts.
5. Insurance & Protection: Coverage analysis and recommendations for contract protection.
6. Historical Comparisons: How similar injuries have affected comparable players.
7. Risk Mitigation: Strategies to minimize future injury risk.
8. Recommendations: For the player, agent, and team management.

Injury Report Data:
${JSON.stringify(data, null, 2)}

Provide a detailed, structured analysis in markdown format.`,

  team_rosters: (data) => `You are an expert team roster and salary cap analyst. Analyze the following team roster data and provide:
1. Roster Composition: Overall assessment of the roster balance and depth.
2. Salary Distribution: How efficiently is the team spending its budget?
3. Core Player Analysis: Evaluation of key players and their value.
4. Roster Gaps: Identify positions or roles that need improvement.
5. Trade Candidates: Which players could be moved and what's their trade value?
6. Contract Optimization: Suggestions for restructures or extensions.
7. Future Outlook: How will this roster look in 2-3 years?
8. Recommendations: Specific moves to improve the roster.

Team Roster Data:
${JSON.stringify(data, null, 2)}

Provide a detailed, structured analysis in markdown format.`,

  trade_analysis: (data) => `You are an expert sports trade analyst. Analyze the following trade scenario and provide:
1. Trade Fairness: Is this trade balanced or does one side benefit more?
2. Winner/Loser Analysis: Which team gets the better end of the deal and why?
3. Salary Cap Impact: How does this trade affect each team's cap situation?
4. On-Court/Field Impact: How does each team improve or decline in performance?
5. Draft Pick Valuation: Assessment of any draft capital exchanged.
6. Long-term Implications: How does this trade affect each team's 3-5 year window?
7. Historical Comparisons: Similar trades and how they played out.
8. Final Verdict: Overall grade and recommendation for each team.

Trade Data:
${JSON.stringify(data, null, 2)}

Provide a detailed, structured analysis in markdown format.`,
};

async function analyzeWithAI(featureType, data) {
  if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'your-openrouter-api-key-here') {
    return {
      analysis: `## AI Analysis (Demo Mode)

AI analysis is not available because the OpenRouter API key is not configured.

To enable AI analysis:
1. Sign up at https://openrouter.ai
2. Get your API key
3. Update the OPENROUTER_API_KEY in your .env file

### Data Summary
The following data was submitted for analysis:
\`\`\`json
${JSON.stringify(data, null, 2)}
\`\`\`

*Configure your OpenRouter API key to get real AI-powered analysis.*`,
      model: 'demo-mode',
      tokensUsed: 0,
    };
  }

  // Normalize feature type (handle hyphens to underscores)
  const normalizedType = featureType.replace(/-/g, '_');
  const promptBuilder = featurePrompts[normalizedType];
  if (!promptBuilder) {
    throw new Error(`Unknown feature type: ${featureType}`);
  }

  const prompt = promptBuilder(data);

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'AI Sports Agent Contract Analyzer',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a professional sports agent AI assistant specializing in contract analysis, salary cap management, endorsement deals, free agency, negotiations, and player performance analytics. Provide detailed, actionable analysis.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${errorBody}`);
    }

    const result = await response.json();

    return {
      analysis: result.choices[0].message.content,
      model: result.model || OPENROUTER_MODEL,
      tokensUsed: result.usage ? result.usage.total_tokens : 0,
    };
  } catch (error) {
    console.error('OpenRouter API error:', error.message);
    throw error;
  }
}

module.exports = { analyzeWithAI };
