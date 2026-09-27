import numpy as np
import pytest
import statsmodels.api as sm
from app.core.exceptions import FinEconError
from app.econometrics.regression import run_ols


def test_ols_matches_reference_and_numpy():
    rng = np.random.default_rng(42)
    x = rng.normal(size=100)
    y = 0.5 + 1.7 * x + rng.normal(scale=0.2, size=100)
    result = run_ols(y, {"x": x})
    design = sm.add_constant(x)
    reference = sm.OLS(y, design).fit()
    expected = np.linalg.lstsq(design, y, rcond=None)[0]
    assert list(result.coefficients.values()) == pytest.approx(expected)
    assert list(result.standard_errors.values()) == pytest.approx(reference.bse)
    assert list(result.p_values.values()) == pytest.approx(reference.pvalues)
    assert result.aic == pytest.approx(reference.aic)
    assert result.bic == pytest.approx(reference.bic)
    assert result.adjusted_r_squared == pytest.approx(reference.rsquared_adj)
    assert result.n_obs == 100
    assert sum(result.residuals) == pytest.approx(0, abs=1e-10)
    result.model_dump_json()


@pytest.mark.parametrize("y,X", [([1,2,3], {"x":[1,2]}),
    ([1,2,3], {"x":[1,1,1]}), ([1,1,1], {"x":[1,2,3]}),
    ([1,2], {"x":[1,2]}), ([1,2,3], {"x":[1,float('nan'),3]}),
    ([1,2,3], {"x":[1,2,3],"z":[2,4,6]})])
def test_rejects_invalid_design(y, X):
    with pytest.raises(FinEconError):
        run_ols(y,X)


def test_without_intercept():
    result = run_ols([2,3.9,6.2,7.8], {"x":[1,2,3,4]}, add_intercept=False)
    assert set(result.coefficients) == {"x"}
    assert result.coefficients["x"] == pytest.approx(59.6/30)

