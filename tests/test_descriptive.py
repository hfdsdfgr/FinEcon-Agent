import pytest
from app.econometrics.descriptive import descriptive_statistics
from app.core.exceptions import FinEconError


def test_statistics_and_undefined_values():
    result = descriptive_statistics({"x":[1,2,3,4], "constant":[2,2,2,2]})
    assert result.statistics["x"]["mean"] == 2.5
    assert result.statistics["x"]["variance"] == pytest.approx(5/3)
    assert result.statistics["x"]["standard_deviation"] == pytest.approx((5/3)**0.5)
    assert result.correlation["constant"]["x"] is None
    assert result.warnings
    assert 'NaN' not in result.model_dump_json()


@pytest.mark.parametrize("data", [{}, {"x":[]}, {"x":[1],"y":[1,2]}, {"x":[float('inf')]}, {"x":["a"]}])
def test_bad_data(data):
    with pytest.raises(FinEconError):
        descriptive_statistics(data)
