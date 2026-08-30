import pytest
from app.ai.agents.financial_agent import compute_funding_gap, compute_loan_readiness


def test_funding_gap_calculator():
    res = compute_funding_gap(200000.0, 50000.0)
    assert res["project_cost"] == 200000.0
    assert res["available_capital"] == 50000.0
    assert res["own_contribution"] == 50000.0
    assert res["funding_gap"] == 150000.0
    assert res["funding_gap_percent"] == 75.0


def test_satya_loan_readiness_assessment():
    res = compute_loan_readiness({
        "business_idea": "Dairy & Millet Enterprise",
        "project_cost": 200000.0,
        "available_capital": 50000.0,
        "monthly_expenses": 15000.0,
        "expected_revenue": 35000.0,
        "has_identity_doc": True,
        "has_address_proof": True,
        "experience_years": 3.0,
    })

    assert res["assessment_label"] == "SATYA AI Loan Readiness Assessment"
    assert res["overall_score"] >= 60
    assert "score_breakdown text/values" not in res  # verify structure
    assert len(res["next_steps"]) > 0
    assert "NOT a bank credit score" in res["disclaimer"]
