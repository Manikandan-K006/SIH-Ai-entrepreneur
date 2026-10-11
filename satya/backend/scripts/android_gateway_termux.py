#!/usr/bin/env python3
"""
SATYA — Android SIM Gateway Daemon (Option 3)
Run this lightweight script directly on any spare Android phone using Termux.
It turns your phone and normal Indian SIM card into an AI rural helpline for ₹0 extra.

Prerequisites on Android Phone:
1. Install Termux and Termux:API from F-Droid (https://f-droid.org/en/packages/com.termux/)
2. In Termux, run:
     pkg install python termux-api -y
     pip install requests
3. Run this script:
     python android_gateway_termux.py --server http://YOUR-IP-OR-NGROK:8000 --lang ta
"""
import sys
import time
import json
import argparse
import subprocess
import requests

def run_termux_cmd(cmd: list[str]) -> str:
    try:
        res = subprocess.run(cmd, capture_output=True, text=True, check=True)
        return res.stdout.strip()
    except Exception as e:
        print(f"[Error running {' '.join(cmd)}]: {e}", file=sys.stderr)
        return ""

def send_sim_sms(phone_number: str, message_text: str):
    """Sends SMS directly using the Android phone's physical SIM card."""
    print(f"[SMS Dispatch] Sending to {phone_number} via SIM...")
    cmd = ["termux-sms-send", "-n", phone_number, message_text]
    run_termux_cmd(cmd)
    print(f"[SMS Dispatch] Sent successfully!")

def main():
    parser = argparse.ArgumentParser(description="SATYA Android SIM Gateway Daemon")
    parser.add_argument("--server", default="http://localhost:8000", help="SATYA backend URL (e.g. https://xxxx.ngrok-free.app)")
    parser.add_argument("--lang", default="ta", choices=["ta", "hi", "en"], help="Default language (ta, hi, en)")
    args = parser.parse_args()

    server_url = args.server.rstrip("/")
    lang = args.lang

    print("=" * 60)
    print("  🌾 SATYA Android Phone SIM Gateway Running")
    print(f"  Connected Backend: {server_url}")
    print(f"  Default Language:  {lang.upper()}")
    print("  Listening for Incoming Calls & SMS via Termux:API...")
    print("=" * 60)

    seen_calls = set()
    seen_sms_ids = set()

    while True:
        try:
            # 1. Check for incoming telephony call logs
            telephony_log_raw = run_termux_cmd(["termux-telephony-call-log", "-l", "5"])
            if telephony_log_raw:
                try:
                    call_logs = json.loads(telephony_log_raw)
                    for call in call_logs:
                        call_id = f"{call.get('phone_number')}_{call.get('date')}"
                        call_type = call.get("type", "")
                        
                        # Type 3 = MISSED CALL, Type 1 = INCOMING CALL
                        if call_id not in seen_calls and call_type in ["MISSED", "INCOMING", "3", "1"]:
                            seen_calls.add(call_id)
                            phone = call.get("phone_number", "").strip()
                            if phone:
                                print(f"\n[Call Detected] From {phone} (Type: {call_type})")
                                # Trigger SATYA backend webhook
                                webhook_url = f"{server_url}/api/v1/voice/android-gateway/call"
                                payload = {
                                    "caller_number": phone,
                                    "call_type": "missed_call",
                                    "language": lang
                                }
                                resp = requests.post(webhook_url, json=payload, timeout=10)
                                if resp.status_code == 200:
                                    data = resp.json()
                                    sms_text = data.get("sms_text", "")
                                    if sms_text:
                                        send_sim_sms(phone, sms_text)
                                else:
                                    print(f"[Webhook Error] Status {resp.status_code}")
                except Exception as ex:
                    pass

            # 2. Check for incoming SMS queries
            sms_raw = run_termux_cmd(["termux-sms-list", "-l", "5", "-t", "inbox"])
            if sms_raw:
                try:
                    sms_list = json.loads(sms_raw)
                    for sms in sms_list:
                        msg_id = sms.get("_id") or f"{sms.get('number')}_{sms.get('received')}"
                        if msg_id not in seen_sms_ids:
                            seen_sms_ids.add(msg_id)
                            sender = sms.get("number", "")
                            body = sms.get("body", "").strip()
                            
                            # Ignore self-sent or empty SMS
                            if sender and body and len(body) > 2:
                                print(f"\n[Inbound SMS Query] From {sender}: '{body}'")
                                webhook_url = f"{server_url}/api/v1/voice/android-gateway/sms-inbound"
                                payload = {
                                    "sender_number": sender,
                                    "message_text": body,
                                    "language": lang
                                }
                                resp = requests.post(webhook_url, json=payload, timeout=15)
                                if resp.status_code == 200:
                                    data = resp.json()
                                    reply = data.get("reply_sms", "")
                                    if reply:
                                        send_sim_sms(sender, reply)
                except Exception as ex:
                    pass

            time.sleep(4)

        except KeyboardInterrupt:
            print("\nShutting down SATYA Gateway.")
            break
        except Exception as e:
            print(f"[Loop error]: {e}")
            time.sleep(5)

if __name__ == "__main__":
    main()
