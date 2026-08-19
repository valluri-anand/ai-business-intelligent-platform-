from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import uvicorn

app = FastAPI(title="Mock UI Server")

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

mock_metrics = [
    {
        "company": "Microsoft",
        "year": "2023",
        "revenue": "$211.91B",
        "net_income": "$72.36B",
        "operating_income": "$88.52B",
        "cash_flow": "$87.58B",
        "total_assets": "$411.98B",
        "total_liabilities": "$205.75B",
        "growth_drivers": "Cloud computing growth\nAI integration\nEnterprise software adoption",
        "risk_factors": "Regulatory scrutiny\nMacroeconomic headwinds\nIntense competition in AI"
    },
    {
        "company": "Apple",
        "year": "2023",
        "revenue": "$383.29B",
        "net_income": "$97.00B",
        "operating_income": "$114.30B",
        "cash_flow": "$110.54B",
        "total_assets": "$352.58B",
        "total_liabilities": "$290.44B",
        "growth_drivers": "Services revenue expansion\nStrong iPhone demand\nWearables market growth",
        "risk_factors": "Supply chain concentration\nDependence on iPhone sales\nGeopolitical tensions"
    }
]

@app.get("/")
def dashboard(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="dashboard.html",
        context={
            "metrics": mock_metrics,
            "total_companies": len(mock_metrics),
            "total_reports": len(mock_metrics)
        }
    )

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8080)
