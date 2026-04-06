from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import List

from pydantic import BaseModel, Field


class UserRegisterRequest(BaseModel):
    full_name: str
    email: str
    phone_number: str = Field(pattern=r"^\+\d{10,13}$")
    operating_city: str
    average_duty_hours_per_week: int = Field(ge=0, le=12)
    average_weekly_earnings: int = Field(ge=5000, le=30000)
    partner_name: str
    partner_platform_id: str
    is_kyc_verified: bool


class User(BaseModel):
    id: int
    full_name: str
    email: str
    phone_number: str
    operating_city: str
    average_duty_hours_per_week: int
    average_weekly_earnings: int
    partner_name: str
    partner_platform_id: str
    is_kyc_verified: bool


class Status(BaseModel):
    code: int
    message: str


class UserResponse(BaseModel):
    status: Status
    user: User


class UserStatus:
    created: Status = Status(code=201, message="Account created successfully")
    updated: Status = Status(code=200, message="Account updated successfully")
    logged_in: Status = Status(code=200, message="Logged in successfully")
    logged_out: Status = Status(code=200, message="Logged out successfully")
    deleted: Status = Status(code=200, message="Account deleted successfully")
    unauthorized: Status = Status(code=401, message="Unauthorized access")
    forbidden: Status = Status(code=403, message="Forbidden access")
