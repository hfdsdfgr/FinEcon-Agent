import math
from app.core.exceptions import computation
from app.data.validator import numeric_frame
from app.schemas.analysis import DescriptiveResult


def finite(value):
    return float(value) if math.isfinite(float(value)) else None


@computation
def descriptive_statistics(data):
    """Describe finite numeric columns; sample variance/std use ddof=1.

    Returns structured statistics, Pearson correlations and observation count.
    Skewness is sample adjusted; kurtosis is unbiased excess kurtosis.
    Undefined statistics (constant columns or short samples) become JSON null.
    """
    frame = numeric_frame(data)
    methods = {"mean": frame.mean, "median": frame.median,
               "standard_deviation": frame.std, "variance": frame.var,
               "min": frame.min, "max": frame.max,
               "skewness": frame.skew, "kurtosis": frame.kurt}
    computed = {name: method() for name, method in methods.items()}
    statistics = {c: {name: finite(values[c]) for name, values in computed.items()} for c in frame.columns}
    correlation = {c: {k: finite(v) for k, v in values.items()} for c, values in frame.corr().to_dict().items()}
    undefined = any(v is None for row in [*statistics.values(), *correlation.values()] for v in row.values())
    return DescriptiveResult(statistics=statistics, correlation=correlation, n_obs=len(frame),
                             warnings=["Undefined statistics are represented as null"] if undefined else [])
