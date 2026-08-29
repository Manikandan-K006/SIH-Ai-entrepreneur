"""
Market Agent — Hyper-local market analysis.
"""
import logging
from typing import Any
from sqlalchemy.orm import Session
from app.models.market import MarketData

logger = logging.getLogger(__name__)


def get_level_label(score: int) -> str:
    if score >= 70:
        return "High"
    elif score >= 40:
        return "Medium"
    return "Low"


def compute_opportunity_score(data: MarketData) -> int:
    """Weighted opportunity score from market factors."""
    demand_weight = 0.30
    competition_weight = 0.20  # inverted — low competition is good
    raw_material_weight = 0.20
    transport_weight = 0.15
    seasonality_weight = 0.15

    competition_inverted = 100 - data.competition_score
    score = (
        data.demand_score * demand_weight
        + competition_inverted * competition_weight
        + data.raw_material_score * raw_material_weight
        + data.transport_score * transport_weight
        + data.seasonality_score * seasonality_weight
    )
    return int(round(score))


async def analyze_local_market(
    state: str,
    district: str,
    business_category: str,
    db: Session,
) -> dict[str, Any]:
    """
    Look up market data for location + category.
    Returns opportunity score, factor breakdown, and insights.
    """
    # Try to find exact match
    market_data = (
        db.query(MarketData)
        .filter(
            MarketData.state == state,
            MarketData.district == district,
            MarketData.business_category == business_category,
        )
        .first()
    )

    # Fallback: state level match
    if not market_data:
        market_data = (
            db.query(MarketData)
            .filter(
                MarketData.state == state,
                MarketData.business_category == business_category,
            )
            .first()
        )

    if market_data:
        opportunity_score = compute_opportunity_score(market_data)
        return {
            "state": market_data.state,
            "district": market_data.district,
            "business_category": market_data.business_category,
            "opportunity_score": opportunity_score,
            "factors": {
                "demand": {
                    "score": market_data.demand_score,
                    "level": get_level_label(market_data.demand_score),
                },
                "competition": {
                    "score": market_data.competition_score,
                    "level": get_level_label(market_data.competition_score),
                    "note": "Lower competition is better",
                },
                "raw_material_availability": {
                    "score": market_data.raw_material_score,
                    "level": get_level_label(market_data.raw_material_score),
                },
                "transport_accessibility": {
                    "score": market_data.transport_score,
                    "level": get_level_label(market_data.transport_score),
                },
                "seasonality": {
                    "score": market_data.seasonality_score,
                    "level": get_level_label(market_data.seasonality_score),
                },
            },
            "nearby_markets": market_data.nearby_markets or [],
            "price_range_info": market_data.price_range_info or {},
            "seasonal_patterns": market_data.seasonal_patterns,
            "key_competitors": market_data.key_competitors or [],
            "opportunities": market_data.opportunities or [],
            "challenges": market_data.challenges or [],
            "data_source": market_data.data_source,
            "is_verified": market_data.is_verified,
            "is_estimated": not market_data.is_verified,
            "data_note": (
                "Verified market data" if market_data.is_verified
                else "⚠️ Demo Data — AI-estimated market indicators. Replace with verified local data."
            ),
        }
    else:
        # Generic estimate
        return {
            "state": state,
            "district": district,
            "business_category": business_category,
            "opportunity_score": 60,
            "factors": {
                "demand": {"score": 60, "level": "Medium"},
                "competition": {"score": 50, "level": "Medium"},
                "raw_material_availability": {"score": 60, "level": "Medium"},
                "transport_accessibility": {"score": 55, "level": "Medium"},
                "seasonality": {"score": 65, "level": "Medium"},
            },
            "nearby_markets": [],
            "price_range_info": {},
            "seasonal_patterns": "Market data not yet available for this location.",
            "key_competitors": [],
            "opportunities": ["Local market potential exists", "Growing rural consumer base"],
            "challenges": ["Limited data for this specific location"],
            "data_source": "AI Estimate",
            "is_verified": False,
            "is_estimated": True,
            "data_note": "⚠️ No specific market data found. Showing generic AI estimate. Collect local data for accuracy.",
        }


def get_people_matches(
    entrepreneur_profile: dict,
    mentors: list,
    suppliers: list,
    buyers: list,
) -> dict[str, Any]:
    """Score and rank people matches for an entrepreneur."""

    def score_mentor(mentor) -> tuple[int, str]:
        score = 50
        reasons = []
        ep_cat = (entrepreneur_profile.get("business_category") or "").lower()
        m_cats = [c.lower() for c in (mentor.business_categories or [])]
        if ep_cat and any(ep_cat in c or c in ep_cat for c in m_cats):
            score += 30
            reasons.append(f"Expertise in {entrepreneur_profile.get('business_category')}")
        ep_state = entrepreneur_profile.get("state", "")
        if mentor.state == ep_state:
            score += 15
            reasons.append(f"Located in {ep_state}")
        if mentor.years_experience >= 5:
            score += 5
            reasons.append(f"{mentor.years_experience} years experience")
        explanation = " • ".join(reasons) if reasons else "General business expertise"
        return min(score, 99), explanation

    def score_supplier(supplier) -> tuple[int, str]:
        score = 40
        reasons = []
        ep_cat = (entrepreneur_profile.get("business_category") or "").lower()
        s_cat = (supplier.category or "").lower()
        if ep_cat and (ep_cat in s_cat or s_cat in ep_cat):
            score += 35
            reasons.append(f"Supplies for {entrepreneur_profile.get('business_category')}")
        ep_state = entrepreneur_profile.get("state", "")
        if supplier.state == ep_state:
            score += 15
            reasons.append(f"Located in {ep_state}")
        explanation = " • ".join(reasons) if reasons else "General supplier"
        return min(score, 99), explanation

    def score_buyer(buyer) -> tuple[int, str]:
        score = 40
        reasons = []
        ep_cat = (entrepreneur_profile.get("business_category") or "").lower()
        b_prods = [p.lower() for p in (buyer.products_required or [])]
        if ep_cat and any(ep_cat in p or p in ep_cat for p in b_prods):
            score += 35
            reasons.append(f"Looking for {entrepreneur_profile.get('business_category')} products")
        ep_state = entrepreneur_profile.get("state", "")
        if buyer.state == ep_state:
            score += 15
            reasons.append(f"Located in {ep_state}")
        explanation = " • ".join(reasons) if reasons else "Potential buyer"
        return min(score, 99), explanation

    mentor_matches = []
    for m in mentors:
        score, explanation = score_mentor(m)
        mentor_matches.append({
            "id": m.id,
            "name": m.name,
            "match_score": score,
            "explanation": explanation,
            "expertise": m.expertise or [],
            "location": f"{m.district or ''}, {m.state or ''}".strip(", "),
            "years_experience": m.years_experience,
            "is_demo": m.is_demo,
        })
    mentor_matches.sort(key=lambda x: x["match_score"], reverse=True)

    supplier_matches = []
    for s in suppliers:
        score, explanation = score_supplier(s)
        supplier_matches.append({
            "id": s.id,
            "name": s.name,
            "match_score": score,
            "explanation": explanation,
            "category": s.category,
            "products": s.products or [],
            "location": f"{s.district or ''}, {s.state or ''}".strip(", "),
            "is_demo": s.is_demo,
        })
    supplier_matches.sort(key=lambda x: x["match_score"], reverse=True)

    buyer_matches = []
    for b in buyers:
        score, explanation = score_buyer(b)
        buyer_matches.append({
            "id": b.id,
            "name": b.name,
            "match_score": score,
            "explanation": explanation,
            "buyer_type": b.buyer_type,
            "products_required": b.products_required or [],
            "location": f"{b.district or ''}, {b.state or ''}".strip(", "),
            "is_demo": b.is_demo,
        })
    buyer_matches.sort(key=lambda x: x["match_score"], reverse=True)

    return {
        "mentors": mentor_matches[:5],
        "suppliers": supplier_matches[:5],
        "buyers": buyer_matches[:5],
    }
