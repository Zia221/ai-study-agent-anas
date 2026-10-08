from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.services.auth_service import (
    change_password,
    create_user,
    login_user,
    update_user,
)
from app.core.security import (
    create_access_token,
    get_current_user,
)
from app.db.database import get_db
from app.db.models import User

from app.schemas.auth import (
    ChangePasswordRequest,
    GoogleAuthRequest,
    LoginRequest,
    Token,
    UserCreate,
    UserResponse,
    UserUpdate,
)

from app.services.auth_service import (
    create_user,
    login_user,
    update_user,
)

from app.services.google_auth_service import (
    authenticate_google_user,
)


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)


@router.post(
    "/register",
    response_model=UserResponse,
)
async def register(
    user_data: UserCreate,
    db: Session = Depends(get_db),
):
    try:
        user = create_user(
            db=db,
            user_data=user_data,
        )

        return user

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


@router.post(
    "/login",
    response_model=Token,
)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = login_user(
        db=db,
        username=form_data.username,
        password=form_data.password,
    )

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password.",
        )

    access_token = create_access_token(user.id)

    return Token(
        access_token=access_token,
        token_type="bearer",
    )


@router.post(
    "/google",
    response_model=Token,
)
async def google_login(
    request: GoogleAuthRequest,
    db: Session = Depends(get_db),
):
    try:
        access_token = authenticate_google_user(
            db=db,
            credential=request.credential,
        )

        return Token(
            access_token=access_token,
            token_type="bearer",
        )

    except ValueError as error:
        raise HTTPException(
            status_code=401,
            detail=str(error),
        )


@router.get(
    "/me",
    response_model=UserResponse,
)
async def get_me(
    current_user: User = Depends(get_current_user),
):
    return current_user


@router.put(
    "/me",
    response_model=UserResponse,
)
async def update_me(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        user = update_user(
            db=db,
            user=current_user,
            username=user_data.username,
        )

        return user

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


@router.put("/me/password")
async def change_my_password(
    request: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        change_password(
            db=db,
            user=current_user,
            current_password=request.current_password,
            new_password=request.new_password,
        )

        return {
            "message": "Password changed successfully."
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )