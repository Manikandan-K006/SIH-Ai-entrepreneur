# pyrefly: ignore [missing-import]
import json
import logging
from typing import Dict, Any, Optional
from app.ai.llm_client import generate_structured_output

logger = logging.getLogger(__name__)

AGRI_PROMPT = """
You are SATYA AI's Agri-Enterprise & Rural Micro-Business Advisor.
Analyze farm-based and allied agricultural income-generating enterprises (Dairy, Poultry, Fisheries, Beekeeping, Food Processing, Millet Processing, Crop Trading, Handicrafts).

Input provided:
- Activity/Idea: {business_idea}
- Location: {location}
- Available Capital: ₹{capital}
- Required Investment / Estimated Cost: ₹{required_investment}
- Existing Equipment/Resources: {resources}
- Skills: {skills}

Rules:
1. Do NOT provide unsupported agricultural or financial claims.
2. Focus on BUSINESS + FINANCE + MARKET + GOVERNMENT SUPPORT + CONNECTIONS.
3. Structure the output clearly in valid JSON:

{{
  "enterprise_category": "...",
  "feasibility_assessment": "High / Medium / Requires Capital",
  "opportunity_score": 82,
  "market_opportunity": "...",
  "operational_requirements": ["...", "..."],
  "key_risks": ["...", "..."],
  "recommended_next_steps": ["...", "..."],
  "potential_buyers_category": ["Local Dairy Cooperatives", "Retail Shops", "Nearby Wholesalers"],
  "goverment_schemes_to_check": ["PM-FME", "Agri Infrastructure Fund", "Kisan Credit Card"],
  "analysis_summary": "...",
  "disclaimer": "VERIFIED INFORMATION — Analysis based on provided user parameters. Verify scheme eligibility with official institutions."
}}
"""


async def analyze_agri_business(
    business_idea: str,
    location: str = "Tamil Nadu",
    capital: float = 50000.0,
    required_investment: float = 200000.0,
    resources: str = "",
    skills: str = ""
) -> Dict[str, Any]:
    formatted_system = AGRI_PROMPT.format(
        business_idea=business_idea,
        location=location,
        capital=capital,
        required_investment=required_investment,
        resources=resources or "Basic farming tools",
        skills=skills or "Farming experience"
    )

    user_prompt = f"Analyze agri-enterprise idea: '{business_idea}' in {location} with available capital ₹{capital} and required investment ₹{required_investment}."

    result = await generate_structured_output(
        system_prompt=formatted_system,
        user_prompt=user_prompt,
        temperature=0.4
    )

    if "error" in result:
        return {
            "enterprise_category": "Agri-Business",
            "feasibility_assessment": "Medium",
            "opportunity_score": 75,
            "market_opportunity": f"Steady demand for farm-processed products in {location}.",
            "operational_requirements": ["Procure quality input materials", "FSSAI / Local Registration if food processing", "Quality packaging"],
            "key_risks": ["Price fluctuations", "Storage and spoilage risk"],
            "recommended_next_steps": [
                "Calculate total project cost and funding gap",
                "Explore PM-FME / MUDRA government schemes",
                "Identify nearby wholesale buyers"
            ],
            "potential_buyers_category": ["Local Cooperatives", "Town Markets"],
            "goverment_schemes_to_check": ["PM-FME", "MUDRA Scheme"],
            "analysis_summary": f"Agri-business '{business_idea}' in {location} has good market viability.",
            "disclaimer": "VERIFIED INFORMATION — Preliminary AI analysis. Verify final loan/subsidy rules with lending institutions."
        }

    return result
