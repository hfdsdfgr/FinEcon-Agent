from app.core.exceptions import unavailable


def run_ar(series, lags=1):
    """Autoregression interface for a numeric series and lag count. Raises FinEconError (501) until implemented."""
    unavailable("run_ar")


def run_arima(series, order=(1, 0, 0)):
    """ARIMA interface for a numeric series and (p,d,q) order. Raises FinEconError (501) until implemented."""
    unavailable("run_arima")
