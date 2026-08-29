"""
Business Agent — Handles business analysis, feasibility, and plan generation.
"""
import json
import logging
from typing import Any
from app.ai.llm_client import chat_completion

logger = logging.getLogger(__name__)

BUSINESS_ANALYSIS_PROMPT = """You are a seasoned business analyst specializing in rural micro-enterprises in India.

Analyze this business opportunity and provide a comprehensive assessment.

Business Details:
- Business Idea: {business_idea}
- Location: {location}
- Available Capital: ₹{capital:,.0f}
- Skills: {skills}
- Available Resources: {resources}

Provide a detailed JSON analysis:
{{
  "opportunity_score": <integer 0-100>,
  "feasibility": "<High/Medium/Low>",
  "feasibility_reasoning": "<2-3 sentences>",
  "strengths": ["<strength1>", "<strength2>", "<strength3>"],
  "weaknesses": ["<weakness1>", "<weakness2>"],
  "risks": ["<risk1>", "<risk2>", "<risk3>"],
  "opportunities": ["<opportunity1>", "<opportunity2>"],
  "required_resources": ["<resource1>", "<resource2>", "<resource3>"],
  "target_customers": ["<customer_segment1>", "<customer_segment2>"],
  "suggested_next_steps": ["<step1>", "<step2>", "<step3>", "<step4>"],
  "analysis_summary": "<comprehensive 3-4 sentence summary>",
  "estimated_startup_cost": <number in INR>,
  "estimated_monthly_revenue": <number in INR>,
  "estimated_monthly_expenses": <number in INR>,
  "break_even_months": <integer>,
  "confidence": <float 0-1>
}}

IMPORTANT: Base your analysis on realistic rural India market conditions. Do not invent specific government schemes here.
"""

BUSINESS_PLAN_PROMPT = """You are a senior business consultant creating a comprehensive business plan for a rural micro-entrepreneur in India.

Business Details:
- Business Idea: {business_idea}
- Location: {location}  
- Available Capital: ₹{capital:,.0f}
- Skills: {skills}
- Available Resources: {resources}
- Team Size: {team_size} people

Generate a complete, realistic business plan as JSON:
{{
  "title": "<Business Plan Title>",
  "executive_summary": "<2-3 paragraph executive summary>",
  "business_objective": "<Clear business objective statement>",
  "products_services": "<Detailed description of products/services>",
  "target_market": "<Target market description>",
  "customer_segments": "<Detailed customer segments>",
  "resource_requirements": {{
    "equipment": ["<item1>: ₹<amount>", "<item2>: ₹<amount>"],
    "raw_materials": ["<material1>", "<material2>"],
    "infrastructure": "<infrastructure needs>",
    "human_resources": "<staffing needs>"
  }},
  "operations_plan": "<How the business will operate day-to-day>",
  "marketing_plan": "<Marketing strategy for rural context>",
  "financial_requirements": {{
    "total_investment": <number>,
    "own_capital": <number>,
    "required_funding": <number>,
    "working_capital": <number>
  }},
  "risk_assessment": [
    {{"risk": "<risk>", "likelihood": "<High/Medium/Low>", "mitigation": "<strategy>"}},
    {{"risk": "<risk>", "likelihood": "<High/Medium/Low>", "mitigation": "<strategy>"}}
  ],
  "action_plan_30": ["<Day 1-30 action1>", "<action2>", "<action3>", "<action4>", "<action5>"],
  "action_plan_60": ["<Day 31-60 action1>", "<action2>", "<action3>", "<action4>"],
  "action_plan_90": ["<Day 61-90 action1>", "<action2>", "<action3>", "<action4>"]
}}

Make this realistic for rural India. Use INR (₹) for all amounts.
"""


async def analyze_business(
    business_idea: str,
    location: str,
    capital: float,
    skills: list[str],
    resources: str = "",
) -> dict[str, Any]:
    """Run business analysis through AI."""
    prompt = BUSINESS_ANALYSIS_PROMPT.format(
        business_idea=business_idea,
        location=location,
        capital=capital,
        skills=", ".join(skills) if skills else "General skills",
        resources=resources or "Basic tools and workspace",
    )
    content, tokens = await chat_completion(
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=2000,
        response_format={"type": "json_object"},
    )
    try:
        result = json.loads(content)
        result["tokens_used"] = tokens
        result["is_ai_generated"] = True
        return result
    except json.JSONDecodeError as e:
        logger.error(f"Business analysis JSON parse error: {e}")
        return {
            "opportunity_score": 65,
            "feasibility": "Medium",
            "feasibility_reasoning": "Analysis could not be fully parsed. Please try again.",
            "strengths": ["Local market presence", "Low competition"],
            "weaknesses": ["Capital constraints"],
            "risks": ["Market uncertainty"],
            "opportunities": ["Growing rural demand"],
            "required_resources": ["Working capital", "Equipment"],
            "target_customers": ["Local community"],
            "suggested_next_steps": ["Research local market", "Consult a mentor"],
            "analysis_summary": content[:500] if content else "Analysis unavailable",
            "confidence": 0.5,
            "is_ai_generated": True,
        }


async def generate_business_plan(
    business_idea: str,
    location: str,
    capital: float,
    skills: list[str],
    resources: str = "",
    team_size: int = 1,
) -> dict[str, Any]:
    """Generate a complete business plan through AI."""
    prompt = BUSINESS_PLAN_PROMPT.format(
        business_idea=business_idea,
        location=location,
        capital=capital,
        skills=", ".join(skills) if skills else "General business skills",
        resources=resources or "Basic tools and workspace",
        team_size=team_size,
    )
    content, tokens = await chat_completion(
        messages=[{"role": "user", "content": prompt}],
        temperature=0.4,
        max_tokens=3000,
        response_format={"type": "json_object"},
    )
    try:
        result = json.loads(content)
        result["tokens_used"] = tokens
        result["is_ai_generated"] = True
        return result
    except json.JSONDecodeError as e:
        logger.error(f"Business plan JSON parse error: {e}")
        raise ValueError(f"Failed to generate business plan: {e}")
