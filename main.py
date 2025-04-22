from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import os
import logging
from pathlib import Path


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


BASE_DIR = Path(__file__).resolve().parent
TEMPLATES_DIR = BASE_DIR / "templates"
STATIC_DIR = BASE_DIR / "static"

if not TEMPLATES_DIR.exists():
    TEMPLATES_DIR.mkdir(parents=True, exist_ok=True)
    logger.warning(f"Created templates directory at {TEMPLATES_DIR}")

if not STATIC_DIR.exists():
    STATIC_DIR.mkdir(parents=True, exist_ok=True)
    logger.warning(f"Created static directory at {STATIC_DIR}")
app = FastAPI(
    title="Nok Nok Home Services API",
    description="API for Nok Nok home services website",
    version="1.0.0",
)

app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=[
        "localhost", 
        "127.0.0.1", 
        "yourdomain.com",  
        "www.yourdomain.com"  
    ]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost",
        "http://localhost:8000",
        "https://yourdomain.com", 
        "https://www.yourdomain.com"  
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
templates = Jinja2Templates(directory=str(TEMPLATES_DIR))

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    try:
        return templates.TemplateResponse("index.html", {"request": request})
    except Exception as e:
        logger.error(f"Error rendering index page: {str(e)}")
        return templates.TemplateResponse("404.html", {"request": request, "error": str(e)})

@app.get("/error", response_class=HTMLResponse)
async def error(request: Request):
    return templates.TemplateResponse("404.html", {"request": request})

@app.get("/health")
async def health_check():
    """
    Health check endpoint for monitoring systems
    """
    return {"status": "healthy", "service": "noknok-api"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "127.0.0.1")
    logger.info(f"Starting server on {host}:{port}")
    logger.info(f"Templates directory: {TEMPLATES_DIR}")
    logger.info(f"Static files directory: {STATIC_DIR}")
    
    uvicorn.run(app, host=host, port=port, log_level="info")

