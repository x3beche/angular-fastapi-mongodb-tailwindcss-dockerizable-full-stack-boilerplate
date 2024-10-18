from app import app
from models.user import AccountStatus
from routes.authentication.auth_modules import *
from fastapi.security import OAuth2PasswordRequestForm


@app.get("/check_auth/", response_model=bool, tags=["user authentication"])
def check_auth(user: User = Depends(get_session)):
    return True


def user_pass_conditions_check(user: User) -> str:

    if user.activated == False:
        return "Account not activated yet, please contact with your administrator."

    if user.status == AccountStatus.suspend:
        return "Account suspended, please contact with your administrator."


@app.post("/token/", response_model=Token, tags=["user authentication"])
def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    condition = user_pass_conditions_check(user=user)
    if condition:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=condition)

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_jwt_token(
        data={"sub": user.id}, expires_delta=access_token_expires
    )
    user.hashed_password = ""
    user.pp = ""
    return Token(access_token=access_token, token_type="bearer", user=user)
