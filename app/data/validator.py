import numpy as np
import pandas as pd
from app.core.exceptions import FinEconError
from app.schemas.dataset import DatasetMetadata


def numeric_frame(data):
    """Validate a rectangular, finite numeric table; never silently drop observations."""
    try:
        frame = pd.DataFrame(data)
        if frame.empty or frame.columns.duplicated().any():
            raise ValueError("Empty data or duplicate columns")
        if not all(isinstance(c, str) and c.strip() for c in frame.columns):
            raise ValueError("Column names must be nonempty strings")
        if not all(pd.api.types.is_numeric_dtype(dtype) and not pd.api.types.is_bool_dtype(dtype) for dtype in frame.dtypes):
            raise ValueError("All columns must be numeric")
        frame = frame.astype(float)
        if not np.isfinite(frame.to_numpy()).all():
            raise ValueError("Missing and infinite values are not supported")
        return frame
    except (ValueError, TypeError, OverflowError) as exc:
        raise FinEconError(str(exc)) from exc


def validate_data(data):
    frame = numeric_frame(data)
    return DatasetMetadata(rows=len(frame), columns=list(frame.columns),
                           numeric_columns=list(frame.columns),
                           missing_values={c: 0 for c in frame.columns})
