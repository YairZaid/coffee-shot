from fastapi import FastAPI

from app.routers import bean_router


def create_app() -> FastAPI:
    app = FastAPI(title="Coffee Shot Intelligence API")

    @app.get("/health")
    def health_check() -> dict[str, str]:
        return {"status": "ok"}

    app.include_router(bean_router)

    return app


app = create_app()
