"""User operation endpoints."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from ...domain.users import Status, User, UserRegisterRequest, UserResponse, UserStatus

from ...core.database import get_database

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/register", response_model=UserResponse)
async def register_user(req: UserRegisterRequest) -> UserResponse:
    # Debug log for incoming request data
    print("Received registration request:", req.dict())
    if (not req.full_name or not req.email or not req.phone_number or not req.operating_city or not req.partner_name or not req.partner_platform_id):
        raise HTTPException(status_code=400, detail="All fields are required")

    db = get_database()

    userExistsAlready = await db.fetchrow(
        "SELECT * FROM users WHERE email=$1",
        req.email
    )
    # Debug log for user existence check
    print("Checking if user exists:", userExistsAlready)
    if userExistsAlready:
        raise HTTPException(
            status_code=400, detail="User with this email already exists")

    new_user = await db.fetchrow(
        """
    INSERT INTO users (
        full_name,
        email,
        phone_number,
        operating_city,
        average_duty_hours_per_week,
        average_weekly_earnings,
        partner_name,
        partner_platform_id,
        is_kyc_verified,
        created_at
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, NOW())
    RETURNING *
    """,
        req.full_name,
        req.email,
        req.phone_number,
        req.operating_city,
        req.average_duty_hours_per_week,
        req.average_weekly_earnings,
        req.partner_name,
        req.partner_platform_id,
        req.is_kyc_verified,
    )

    if not new_user:
        raise HTTPException(status_code=500, detail="Failed to create user")

    return UserResponse(
        status=UserStatus.created,
        user=User(
            id=new_user["id"] if new_user else 0,
            full_name=new_user["full_name"] if new_user else "",
            email=new_user["email"] if new_user else "",
            phone_number=new_user["phone_number"] if new_user else "",
            operating_city=new_user["operating_city"] if new_user else "",
            average_duty_hours_per_week=new_user["average_duty_hours_per_week"] if new_user else 0,
            average_weekly_earnings=new_user["average_weekly_earnings"] if new_user else 0,
            partner_name=new_user["partner_name"] if new_user else "",
            partner_platform_id=new_user["partner_platform_id"] if new_user else "",
            is_kyc_verified=new_user["is_kyc_verified"] if new_user else False,
        ),
    )


@router.get("/get/{email}", response_model=User)
async def get_user(email: str) -> User:
    db = get_database()
    user = await db.fetchrow("SELECT * FROM users WHERE email=$1", email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return User(
        id=user["id"],
        full_name=user["full_name"],
        email=user["email"],
        phone_number=user["phone_number"],
        operating_city=user["operating_city"],
        average_duty_hours_per_week=user["average_duty_hours_per_week"],
        average_weekly_earnings=user["average_weekly_earnings"],
        partner_name=user["partner_name"],
        partner_platform_id=user["partner_platform_id"],
        is_kyc_verified=user["is_kyc_verified"],
    )


@router.put("/update/{user_id}", response_model=UserResponse)
async def update_user(user_id: int, req: UserRegisterRequest) -> UserResponse:

    db = get_database()

    existing_user = await db.fetchrow("SELECT * FROM users WHERE id=$1", user_id)
    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")

    updated_user = await db.fetchrow(
        """
    UPDATE users SET
        full_name=$1,
        email=$2,
        phone_number=$3,
        operating_city=$4,
        average_duty_hours_per_week=$5,
        average_weekly_earnings=$6,
        partner_name=$7,
        partner_platform_id=$8,
        is_kyc_verified=$9
    WHERE id=$10
    RETURNING *
    """,
        req.full_name,
        req.email,
        req.phone_number,
        req.operating_city,
        req.average_duty_hours_per_week,
        req.average_weekly_earnings,
        req.partner_name,
        req.partner_platform_id,
        req.is_kyc_verified,
        user_id
    )

    if not updated_user:
        raise HTTPException(status_code=500, detail="Failed to update user")

    return UserResponse(
        status=UserStatus.updated,
        user=User(
            id=updated_user["id"],
            full_name=updated_user["full_name"],
            email=updated_user["email"],
            phone_number=updated_user["phone_number"],
            operating_city=updated_user["operating_city"],
            average_duty_hours_per_week=updated_user["average_duty_hours_per_week"],
            average_weekly_earnings=updated_user["average_weekly_earnings"],
            partner_name=updated_user["partner_name"],
            partner_platform_id=updated_user["partner_platform_id"],
            is_kyc_verified=updated_user["is_kyc_verified"],
        ),
    )


@router.delete("/delete/{user_id}", response_model=Status)
async def delete_user(user_id: int) -> Status:
    db = get_database()
    existing_user = await db.fetchrow("SELECT * FROM users WHERE id=$1", user_id)
    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")

    await db.execute("DELETE FROM users WHERE id=$1", existing_user["id"])
    return UserStatus.deleted
