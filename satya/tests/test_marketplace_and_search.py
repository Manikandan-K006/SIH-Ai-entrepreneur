import pytest
from app.ai.agents.financial_agent import compute_financial_plan
from app.services.telephony import telephony_service


def test_telephony_mock_ivr():
    import asyncio
    
    async def run_ivr_test():
        res = await telephony_service.initiate_ivr("+919876543210")
        assert "session_id" in res
        assert "SATYA" in res["prompt"]

        dtmf_res = await telephony_service.process_dtmf(res["session_id"], "1")
        assert dtmf_res["language"] == "ta"
        assert "Tamil" in dtmf_res["language_name"]

    asyncio.run(run_ivr_test())


def test_missed_call_and_sms():
    import asyncio

    async def run_test():
        mc = await telephony_service.handle_missed_call("+919876543210")
        assert mc["callback_status"] == "scheduled"

        sms = await telephony_service.send_sms_fallback("+919876543210", "Your business plan is ready!")
        assert sms["status"] == "sent"

    asyncio.run(run_test())
