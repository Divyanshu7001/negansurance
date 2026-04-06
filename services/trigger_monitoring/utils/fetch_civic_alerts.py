
from __future__ import annotations

import json
import os
import re
from datetime import date as date_type
from typing import Any

import dotenv
from groq import APIStatusError, Groq


dotenv.load_dotenv()


def _default_result() -> dict[str, bool]:
    return {"protests": False, "curfews": False, "traffic_jam": False}


def _parse_json_object(text: str) -> dict[str, Any] | None:
    text = text.strip()
    if not text:
        return None

    try:
        value = json.loads(text)
        return value if isinstance(value, dict) else None
    except Exception:
        pass

    # Some models wrap JSON with extra text; try to extract the first JSON object.
    match = re.search(r"\{.*\}", text, flags=re.DOTALL)
    if not match:
        return None
    try:
        value = json.loads(match.group(0))
        return value if isinstance(value, dict) else None
    except Exception:
        return None


def _coerce_result(parsed: dict[str, Any] | None) -> dict[str, bool]:
    base = _default_result()
    if not parsed:
        return base

    for key in base.keys():
        if key in parsed:
            base[key] = bool(parsed[key])
    return base


def _build_prompt(*, location: str, date: str, time: str) -> str:
    return (
        "Determine whether the following events occurred on the given date within a 2 km radius of "
        f"{location}.\n\n"
        f"Date: {date}\n"
        f"Local time: {time}\n\n"
        "Return true only if you find credible evidence from recent, reliable signals (e.g., local news, "
        "regional media, credible social media reports). If you cannot find credible evidence, return false. "
        "Do not guess.\n\n"
        "Traffic jam rule: If that time falls in peak traffic hours for that day around the location for any reason, "
        "set traffic_jam=true; otherwise false.\n\n"
        "Output strict JSON only (no markdown, no extra keys):\n"
        '{"protests": false, "curfews": false, "traffic_jam": false}'
    )


def _get_status_code(exc: Exception) -> int | None:
    status_code = getattr(exc, "status_code", None)
    if isinstance(status_code, int):
        return status_code
    response = getattr(exc, "response", None)
    status_code = getattr(response, "status_code", None)
    return status_code if isinstance(status_code, int) else None


def _fetch_civic_alerts(location: str, time: str, date: str | None = None) -> dict[str, bool]:
    api_key = os.environ.get("DATA_GROK_API_KEY")
    if not api_key:
        return _default_result()

    if date is None:
        date = date_type.today().isoformat()

    client = Groq(api_key=api_key)
    prompt = _build_prompt(location=location, date=date, time=time)

    def _request(*, enabled_tools: list[str] | None) -> dict[str, bool]:
        request_kwargs: dict[str, Any] = {
            "model": "openai/gpt-oss-120b",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0,
            "max_completion_tokens": 256,
            "top_p": 1,
            "stream": False,
            "stop": None,
        }
        if enabled_tools is not None:
            request_kwargs["compound_custom"] = {
                "tools": {"enabled_tools": enabled_tools}}

        completion = client.chat.completions.create(**request_kwargs)
        try:
            content = completion.choices[0].message.content
        except Exception:
            return _default_result()

        if not isinstance(content, str):
            return _default_result()

        parsed = _parse_json_object(content)
        return _coerce_result(parsed)

    try:
        # Primary attempt: allow only lightweight web search (avoid visit_website which often balloons context).
        return _request(enabled_tools=["web_search"])
    except APIStatusError as e:
        if _get_status_code(e) == 413:
            try:
                return _request(enabled_tools=None)
            except Exception:
                return _default_result()
        return _default_result()
    except Exception:
        return _default_result()


if __name__ == "__main__":
    sample_location = "Bangaluru, Karnataka"
    sample_date = "2026-04-03"
    sample_time = "9:00"
    print(_fetch_civic_alerts(sample_location, sample_time, sample_date))
