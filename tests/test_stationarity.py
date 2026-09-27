import pytest
from app.core.exceptions import FinEconError
from app.econometrics.stationarity import run_adf


def test_adf_is_explicitly_reserved():
    with pytest.raises(FinEconError) as error:
        run_adf([1,2,3])
    assert error.value.status_code == 501
