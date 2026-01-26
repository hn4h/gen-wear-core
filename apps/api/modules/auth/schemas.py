from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional
import phonenumbers

class RegisterRequest(BaseModel):
    phone_number: str = Field(..., description="Phone number with country code (e.g., +84912345678)")
    full_name: str = Field(..., min_length=1, max_length=100)
    password: str = Field(..., min_length=6, description="Password with at least 6 characters")
    
    @field_validator('phone_number')
    @classmethod
    def validate_phone_number(cls, v):
        try:
            parsed = phonenumbers.parse(v, None)
            if not phonenumbers.is_valid_number(parsed):
                raise ValueError('Invalid phone number')
            return phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164)
        except Exception:
            raise ValueError('Invalid phone number format. Use international format (e.g., +84912345678)')

class RegisterResponse(BaseModel):
    user_id: str
    phone_number: str
    full_name: str
    message: str = "Registration successful"

class LoginRequest(BaseModel):
    phone_number: str = Field(..., description="Phone number with country code")
    password: str = Field(..., description="User password")
    
    @field_validator('phone_number')
    @classmethod
    def validate_phone_number(cls, v):
        try:
            parsed = phonenumbers.parse(v, None)
            if not phonenumbers.is_valid_number(parsed):
                raise ValueError('Invalid phone number')
            return phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164)
        except Exception:
            raise ValueError('Invalid phone number format. Use international format (e.g., +84912345678)')

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=100)
    
class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6, description="New password with at least 6 characters")

class UserResponse(BaseModel):
    id: str
    phone_number: str
    full_name: str
    role: str
    created_at: datetime
    is_active: bool
    
    class Config:
        from_attributes = True
