from app.ai.agents.financial_agent import (
    calculate_emi,
    calculate_break_even,
    generate_cash_flow_projection,
    compute_financial_plan
)

def test_calculate_emi():
    # Test flat rate
    assert calculate_emi(100000, 0, 10) == 10000.0
    # Test standard compounding
    assert calculate_emi(100000, 12, 12) == 8884.88
    # Test 0 principal
    assert calculate_emi(0, 8.5, 36) == 0.0

def test_calculate_break_even():
    res = calculate_break_even(5000, 10, 5)
    assert res["units"] == 1000
    assert res["revenue"] == 10000.0

def test_generate_cash_flow_projection():
    res = generate_cash_flow_projection(50000, 30000, 0.05, 12, 2000)
    assert len(res) == 12
    assert res[0]["month"] == 1
    assert res[0]["revenue"] == 50000.0
    assert res[0]["expenses"] == 32000.0
    assert res[0]["net_cash_flow"] == 18000.0

def test_compute_financial_plan():
    data = {
        "available_capital": 200000,
        "equipment_cost": 150000,
        "raw_material_cost": 30000,
        "labour_cost_monthly": 15000,
        "rent_monthly": 5000,
        "transport_monthly": 4000,
        "other_expenses_monthly": 3000,
        "expected_revenue_monthly": 90000,
        "loan_amount": 150000,
        "loan_interest_rate": 8.5,
        "loan_tenure_months": 36,
        "required_investment": 350000
    }
    plan = compute_financial_plan(data)
    assert plan["total_project_cost"] == 350000.0
    assert plan["own_contribution"] == 200000.0
    assert plan["funding_requirement"] == 150000.0
    assert len(plan["cash_flow_projection"]) == 12
    assert plan["emi_amount"] > 0
