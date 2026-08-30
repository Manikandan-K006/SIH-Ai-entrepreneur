# pyrefly: ignore [missing-import]
import json
import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from app.ai.llm_client import generate_structured_output
from app.models.business import BusinessProfile, Product, Service
from app.models.promotion import PromotionCampaign

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """
You are SATYA AI's Natural Language Search Parser for rural micro-businesses.
Extract structured search requirements from customer queries.

Rules:
1. Extract intent: "find_product", "find_service", "find_business", "general_inquiry"
2. Extract key product/service query text (e.g. "homemade snacks", "tailor", "mechanic", "pickle", "cake")
3. Extract category (e.g. "Food Processing", "Services", "Handicrafts", "Textiles", "Automobile", "Agriculture")
4. Extract location/distance if specified (e.g. "near me", "5 km", "Salem", "village")
5. Extract budget if specified in INR (e.g. 500)
6. NEVER fabricate products or businesses.

Return valid JSON:
{
  "intent": "find_product",
  "query_term": "mango pickle",
  "category": "Food Processing",
  "location_filter": "Salem",
  "max_budget": 500,
  "confidence": 0.9
}
"""


async def parse_customer_query(query: str) -> Dict[str, Any]:
    prompt = f"Parse this user search query: \"{query}\""
    result = await generate_structured_output(
        system_prompt=SYSTEM_PROMPT,
        user_prompt=prompt,
        temperature=0.1
    )
    if "error" in result:
        # Fallback simple parser
        return {
            "intent": "find_product",
            "query_term": query,
            "category": None,
            "location_filter": None,
            "max_budget": None,
            "confidence": 0.5,
        }
    return result


async def search_local_businesses_and_products(
    query: str,
    db: Session,
    user_location: Optional[str] = None
) -> Dict[str, Any]:
    parsed = await parse_customer_query(query)
    term = parsed.get("query_term", query).lower()
    category = parsed.get("category")
    max_budget = parsed.get("max_budget")

    # 1. Search Products
    prod_q = db.query(Product).join(BusinessProfile)
    if term:
        prod_q = prod_q.filter(
            or_(
                Product.name.ilike(f"%{term}%"),
                Product.description.ilike(f"%{term}%"),
                Product.category.ilike(f"%{term}%"),
                BusinessProfile.business_name.ilike(f"%{term}%"),
                BusinessProfile.business_category.ilike(f"%{term}%")
            )
        )
    if max_budget and isinstance(max_budget, (int, float)) and max_budget > 0:
        prod_q = prod_q.filter(Product.price <= float(max_budget))

    products = prod_q.limit(20).all()

    # 2. Search Services
    serv_q = db.query(Service).join(BusinessProfile)
    if term:
        serv_q = serv_q.filter(
            or_(
                Service.name.ilike(f"%{term}%"),
                Service.description.ilike(f"%{term}%"),
                Service.category.ilike(f"%{term}%"),
                BusinessProfile.business_name.ilike(f"%{term}%")
            )
        )
    services = serv_q.limit(20).all()

    # 3. Search Businesses
    biz_q = db.query(BusinessProfile)
    if term:
        biz_q = biz_q.filter(
            or_(
                BusinessProfile.business_name.ilike(f"%{term}%"),
                BusinessProfile.description.ilike(f"%{term}%"),
                BusinessProfile.business_category.ilike(f"%{term}%"),
                BusinessProfile.district.ilike(f"%{term}%"),
                BusinessProfile.village_town.ilike(f"%{term}%")
            )
        )
    businesses = biz_q.limit(20).all()

    # Format product items
    product_items = []
    for p in products:
        b = p.business_profile
        product_items.append({
            "id": p.id,
            "type": "product",
            "name": p.name,
            "category": p.category or b.business_category,
            "description": p.description,
            "price": p.price,
            "unit": p.unit,
            "in_stock": p.in_stock,
            "is_promoted": p.is_promoted,
            "business_id": b.id,
            "business_name": b.business_name or "Local Entrepreneur",
            "location": f"{b.village_town or ''}, {b.district or ''}, {b.state or ''}".strip(", "),
            "phone": b.phone,
            "share_code": b.share_code,
            "verification_status": b.verification_status,
        })

    # Format service items
    service_items = []
    for s in services:
        b = s.business_profile
        service_items.append({
            "id": s.id,
            "type": "service",
            "name": s.name,
            "category": s.category or b.business_category,
            "description": s.description,
            "price_starting": s.price_starting,
            "duration": s.duration,
            "is_available": s.is_available,
            "business_id": b.id,
            "business_name": b.business_name or "Local Service Provider",
            "location": f"{b.village_town or ''}, {b.district or ''}, {b.state or ''}".strip(", "),
            "phone": b.phone,
            "share_code": b.share_code,
            "verification_status": b.verification_status,
        })

    # Format business items
    business_items = []
    for b in businesses:
        business_items.append({
            "id": b.id,
            "type": "business",
            "business_name": b.business_name or "Local Enterprise",
            "business_category": b.business_category,
            "description": b.description,
            "location": f"{b.village_town or ''}, {b.district or ''}, {b.state or ''}".strip(", "),
            "phone": b.phone,
            "verification_status": b.verification_status,
            "share_code": b.share_code,
            "delivery_available": b.delivery_available,
            "pickup_available": b.pickup_available,
        })

    total_results = len(product_items) + len(service_items) + len(business_items)

    message = f"Found {total_results} matching items for '{query}'" if total_results > 0 else f"No registered micro-businesses or products found matching '{query}'. Verify exact search criteria."

    return {
        "parsed_query": parsed,
        "total_results": total_results,
        "message": message,
        "products": product_items,
        "services": service_items,
        "businesses": business_items,
        "disclaimer": "VERIFIED INFORMATION — Product availability and prices are direct from registered local entrepreneurs."
    }
