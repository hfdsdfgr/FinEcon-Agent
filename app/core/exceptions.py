from functools import wraps


class FinEconError(Exception):
    def __init__(self, message, code="invalid_input", status_code=422):
        super().__init__(message)
        self.code = code
        self.status_code = status_code


def unavailable(feature):
    raise FinEconError(f"{feature} is reserved for a later phase", "not_implemented", 501)


def computation(func):
    @wraps(func)
    def wrapped(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except FinEconError:
            raise
        except Exception as exc:
            raise FinEconError("Computation failed; check inputs and numerical scale", "computation_error") from exc
    return wrapped
