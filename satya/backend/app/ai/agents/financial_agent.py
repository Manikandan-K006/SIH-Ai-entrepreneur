"""
Financial Agent — Calculations, projections, EMI, and AI insights.
"""
import math
import logging
from typing import Any

logger = logging.getLogger(__name__)


def calculate_emi(principal: float, annual_rate: float, tenure_months: int) -> float:
    """Calculate EMI using standard formula."""
    if principal <= 0 or tenure_months <= 0:
        return 0.0
    if annual_rate <= 0:
        return principal / tenure_months
    monthly_rate = annual_rate / (12 * 100)
    emi = principal * monthly_rate * math.pow(1 + monthly_rate, tenure_months) / \
          (math.pow(1 + monthly_rate, tenure_months) - 1)
    return round(emi, 2)


def calculate_break_even(monthly_fixed_costs: float, revenue_per_unit: float, variable_cost_per_unit: float) -> dict:
    """Calculate break-even point."""
    if revenue_per_unit <= variable_cost_per_unit:
        return {"units": None, "revenue": None, "months": None, "error": "Revenue per unit must exceed variable cost per unit"}
    contribution_margin = revenue_per_unit - variable_cost_per_unit
    break_even_units = monthly_fixed_costs / contribution_margin
    break_even_revenue = break_even_units * revenue_per_unit
    return {
        "units": round(break_even_units, 0),
        "revenue": round(break_even_revenue, 2),
        "contribution_margin": round(contribution_margin, 2),
    }


def generate_cash_flow_projection(
    initial_revenue: float,
    monthly_expenses: float,
    growth_rate: float = 0.05,
    months: int = 12,
    emi: float = 0.0,
) -> list[dict]:
    """Generate 12-month cash flow projection."""
    projection = []
    cumulative_cash_flow = 0.0
    for month in range(1, months + 1):
        revenue = initial_revenue * math.pow(1 + growth_rate, month - 1)
        expenses = monthly_expenses + emi
        net_cash_flow = revenue - expenses
        cumulative_cash_flow += net_cash_flow
        projection.append({
            "month": month,
            "month_label": f"Month {month}",
            "revenue": round(revenue, 2),
            "expenses": round(expenses, 2),
            "emi": round(emi, 2),
            "net_cash_flow": round(net_cash_flow, 2),
            "cumulative_cash_flow": round(cumulative_cash_flow, 2),
            "is_profitable": net_cash_flow > 0,
        })
    return projection


def compute_financial_plan(data: dict) -> dict[str, Any]:
    """
    Core financial calculator — transparent, deterministic.
    No AI involved here; all pure math.
    """
    available_capital = data.get("available_capital", 0)
    equipment_cost = data.get("equipment_cost", 0)
    raw_material_cost = data.get("raw_material_cost", 0)
    labour_cost = data.get("labour_cost_monthly", 0)
    rent = data.get("rent_monthly", 0)
    transport = data.get("transport_monthly", 0)
    other = data.get("other_expenses_monthly", 0)
    expected_revenue = data.get("expected_revenue_monthly", 0)
    required_investment = data.get("required_investment", equipment_cost + raw_material_cost * 3)
    loan_amount = data.get("loan_amount", 0)
    loan_rate = data.get("loan_interest_rate", 7.0)
    loan_tenure = data.get("loan_tenure_months", 36)

    # Core calculations
    total_project_cost = required_investment
    own_contribution = min(available_capital, total_project_cost)
    funding_requirement = max(0, total_project_cost - own_contribution)
    total_monthly_expenses = labour_cost + rent + transport + other + raw_material_cost

    # Gross margin
    gross_margin = 0.0
    if expected_revenue > 0:
        gross_margin = ((expected_revenue - total_monthly_expenses) / expected_revenue) * 100

    # Break-even (months to recover project cost)
    monthly_profit = expected_revenue - total_monthly_expenses
    break_even_months = None
    if monthly_profit > 0:
        break_even_months = math.ceil(total_project_cost / monthly_profit)

    # EMI
    emi_amount = calculate_emi(loan_amount or funding_requirement, loan_rate, loan_tenure)

    # Cash flow projection
    cash_flow = generate_cash_flow_projection(
        initial_revenue=expected_revenue,
        monthly_expenses=total_monthly_expenses,
        growth_rate=0.04,  # 4% monthly growth assumption
        months=12,
        emi=emi_amount,
    )

    return {
        "total_project_cost": round(total_project_cost, 2),
        "own_contribution": round(own_contribution, 2),
        "funding_requirement": round(funding_requirement, 2),
        "total_monthly_expenses": round(total_monthly_expenses, 2),
        "expected_revenue_monthly": round(expected_revenue, 2),
        "gross_margin_percent": round(gross_margin, 2),
        "break_even_months": break_even_months,
        "break_even_revenue": round(break_even_months * expected_revenue, 2) if break_even_months else None,
        "loan_amount": loan_amount or funding_requirement,
        "loan_interest_rate": loan_rate,
        "loan_tenure_months": loan_tenure,
        "emi_amount": round(emi_amount, 2),
        "cash_flow_projection": cash_flow,
        "monthly_net_profit": round(monthly_profit, 2),
        "disclaimer": "AI-estimated financial projection. Verify with a financial advisor before making decisions.",
        "is_ai_generated": False,  # calculations are deterministic, not AI
    }


def compute_funding_gap(project_cost: float, available_capital: float) -> dict[str, Any]:
    """Calculate project cost vs available capital -> Funding Gap breakdown."""
    cost = max(0.0, project_cost)
    capital = max(0.0, available_capital)
    own_contrib = min(capital, cost)
    funding_gap = max(0.0, cost - own_contrib)
    percent_own = round((own_contrib / cost) * 100, 1) if cost > 0 else 100.0
    percent_gap = round((funding_gap / cost) * 100, 1) if cost > 0 else 0.0

    return {
        "project_cost": round(cost, 2),
        "available_capital": round(capital, 2),
        "own_contribution": round(own_contrib, 2),
        "funding_gap": round(funding_gap, 2),
        "own_contribution_percent": percent_own,
        "funding_gap_percent": percent_gap,
        "disclaimer": "Estimates based on user inputs. Verify eligibility with relevant lending institutions."
    }


def compute_loan_readiness(data: dict) -> dict[str, Any]:
    """
    SATYA AI Loan Readiness Assessment (0-100 Score).
    IMPORTANT: This is NOT a bank credit score.
    """
    has_business_plan = bool(data.get("business_idea") or data.get("has_plan"))
    project_cost = float(data.get("project_cost", 0))
    available_capital = float(data.get("available_capital", 0))
    monthly_expenses = float(data.get("monthly_expenses", 0))
    monthly_revenue = float(data.get("expected_revenue", 0))
    has_documents = bool(data.get("has_identity_doc") or data.get("has_address_proof"))
    experience_years = float(data.get("experience_years", 1))

    # Category Scores (0-100)
    score_plan = 80 if has_business_plan else 40
    score_investment = 70 if (project_cost > 0 and available_capital > 0) else 45
    score_financial = 80 if (monthly_revenue > monthly_expenses and monthly_expenses > 0) else 50
    score_docs = 75 if has_documents else 50
    score_experience = min(90, 50 + int(experience_years * 10))

    # Weighted Overall Score
    overall_score = int(
        (score_plan * 0.25) +
        (score_investment * 0.20) +
        (score_financial * 0.25) +
        (score_docs * 0.15) +
        (score_experience * 0.15)
    )

    # Missing Information
    missing_info = []
    if project_cost <= 0:
        missing_info.append("Estimated Project Cost breakdown")
    if available_capital <= 0:
        missing_info.append("Own capital contribution details")
    if monthly_expenses <= 0:
        missing_info.append("Monthly operating expense estimates (raw materials, labour, rent, transport)")
    if monthly_revenue <= 0:
        missing_info.append("Monthly sales revenue projections")
    if not has_documents:
        missing_info.append("Identity proof & Address proof copies")

    # Recommended Next Steps
    next_steps = [
        "Complete 10-section SATYA Business Plan",
        "Calculate total project cost and own capital contribution",
        "Enter monthly income and expense estimates",
        "Verify scheme-specific eligibility (MUDRA / KCC / PM-FME)",
        "Prepare required application documents checklist"
    ]

    return {
        "assessment_label": "SATYA AI Loan Readiness Assessment",
        "overall_score": overall_score,
        "max_score": 100,
        "score_breakdown": {
            "business_plan": score_plan,
            "investment_information": score_investment,
            "financial_projection": score_financial,
            "required_documents": score_docs,
            "business_experience": score_experience,
        },
        "missing_information": missing_info,
        "next_steps": next_steps,
        "disclaimer": "This assessment is NOT a bank credit score. Final loan approval is determined by the official lending institution based on current rules."
    }
