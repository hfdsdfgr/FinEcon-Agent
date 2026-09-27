import numpy as np
import pandas as pd
import statsmodels.api as sm
from app.core.exceptions import FinEconError, computation
from app.data.validator import numeric_frame
from app.econometrics.descriptive import finite
from app.schemas.analysis import OLSResult


@computation
def run_ols(y, X, add_intercept=True):
    """Estimate y = intercept + X beta + error using actual statsmodels OLS.

    Inputs are aligned observations (list/Series y and named numeric columns X).
    An intercept is added by default. Missing values, rank deficiency, constant
    targets and nonpositive residual degrees of freedom are rejected.
    Returns serializable estimates and classical (nonrobust) standard errors.
    """
    frame = numeric_frame(X)
    target = numeric_frame({"y": y})["y"]
    if len(target) != len(frame):
        raise FinEconError("y and X must have equal observation counts")
    if isinstance(y, pd.Series) and not y.index.equals(frame.index):
        raise FinEconError("y and X indexes must align")
    if target.nunique() < 2:
        raise FinEconError("The dependent variable must vary")
    if add_intercept:
        if "const" in frame.columns:
            raise FinEconError("const is reserved for the intercept")
        frame = sm.add_constant(frame, has_constant="add")
    if len(frame) <= frame.shape[1]:
        raise FinEconError("OLS requires positive residual degrees of freedom")
    if np.linalg.matrix_rank(frame.to_numpy()) < frame.shape[1]:
        raise FinEconError("Design matrix is rank deficient")
    fit = sm.OLS(target.to_numpy(), frame, missing="raise").fit()
    notes = ["Classical standard errors assume homoskedastic, uncorrelated errors; diagnostics pending"]
    if np.linalg.cond(frame.to_numpy()) > 1e8:
        notes.append("Design matrix is ill-conditioned; rescale or inspect regressors")
    values = {name: {k: finite(v) for k, v in getattr(fit, attr).items()}
              for name, attr in {"coefficients": "params", "standard_errors": "bse",
                                 "t_statistics": "tvalues", "p_values": "pvalues"}.items()}
    metrics = {name: finite(getattr(fit, attr)) for name, attr in
               {"r_squared": "rsquared", "adjusted_r_squared": "rsquared_adj",
                "aic": "aic", "bic": "bic", "log_likelihood": "llf"}.items()}
    if any(v is None for row in values.values() for v in row.values()) or any(v is None for v in metrics.values()):
        notes.append("Undefined inference or fit metrics are represented as null")
    if not np.isfinite(fit.resid).all():
        raise FinEconError("Nonfinite residuals; rescale inputs")
    return OLSResult(**values, **metrics, n_obs=int(fit.nobs), residuals=fit.resid.tolist(), warnings=notes)
