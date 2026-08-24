from fastapi import FastAPI


def create_app() -> FastAPI:
    app = FastAPI(title="Coffee Shot Intelligence API")

    @app.get("/health")
    def health_check() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()
